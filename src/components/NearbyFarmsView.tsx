import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ArrowRight, LocateFixed, MapPin, RotateCcw, Search, Store } from 'lucide-react';
import { DEFAULT_KOREA_CENTER, GRADE_LABEL_MAP } from '../data/mockData';
import { Farm, LatLngLiteral, Product } from '../types';
import {
  calculateDistanceKm,
  formatDistanceKm,
  getGoogleMapsApiKey,
  isQuotaOrRateLimitError,
} from '../utils/geo';
import { SafeImage } from './SafeImage';

interface NearbyFarmsViewProps {
  farms: Farm[];
  products: Product[];
  userLocation: LatLngLiteral | null;
  userLocationLabel: string;
  onSetUserLocation: (loc: LatLngLiteral | null, label: string) => void;
  onOpenFarmStore: (farmId: string) => void;
}

type RadiusFilter = 'all' | 50 | 100 | 200;

interface FarmWithMeta {
  farm: Farm;
  farmProducts: Product[];
  distanceKm: number | null;
}

interface FarmMarkerWithRefProps {
  farm: Farm;
  isSelected: boolean;
  onSelect: (farmId: string, marker: google.maps.marker.AdvancedMarkerElement) => void;
}

function FarmMarkerWithRef({ farm, isSelected, onSelect }: FarmMarkerWithRefProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={farm.location}
      title={farm.name}
      zIndex={isSelected ? 1000 : 10}
      onClick={() => {
        if (marker) {
          onSelect(farm.id, marker);
        }
      }}
    >
      <Pin
        background={isSelected ? '#C84B11' : '#4D7C0F'}
        borderColor={isSelected ? '#7C2D12' : '#365314'}
        glyphColor="#FFFFFF"
        scale={isSelected ? 1.2 : 1.0}
      />
    </AdvancedMarker>
  );
}

interface LocationSearchAutocompleteProps {
  onSelectPlace: (loc: LatLngLiteral, label: string) => void;
}

function LocationSearchAutocomplete({ onSelectPlace }: LocationSearchAutocompleteProps) {
  const placesLib = useMapsLibrary('places');
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (!placesLib) return;
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearchError('');
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        setIsSearching(true);
        setSearchError('');
        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['kr'],
          language: 'ko',
          region: 'kr',
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
        });
        if (!cancelled) {
          setSuggestions(res.suggestions || []);
        }
      } catch (err) {
        if (isQuotaOrRateLimitError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          setSearchError('주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placesLib, inputValue]);

  const handlePickSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!suggestion.placePrediction) return;
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['location', 'formattedAddress', 'displayName'],
      });
      if (place.location) {
        const label =
          place.displayName ||
          place.formattedAddress ||
          suggestion.placePrediction.text.text ||
          inputValue;
        onSelectPlace({ lat: place.location.lat(), lng: place.location.lng() }, label);
        setInputValue('');
        setSuggestions([]);
      }
    } catch (err) {
      if (isQuotaOrRateLimitError(err)) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      setSearchError('선택한 위치의 좌표를 가져오지 못했어요.');
    } finally {
      sessionTokenRef.current = null;
    }
  };

  return (
    <div className="relative flex-1">
      <Search
        className="w-4 h-4 text-[#7A6859] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="동네나 역 이름으로 기준 위치 찾기 (예: 강남역, 대전역, 수원시)"
        aria-label="기준 위치 주소 검색"
        className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] text-sm sm:text-[15px] text-[#2C2119] placeholder:text-[#7A6859] focus:outline-none focus:border-[#C84B11]"
      />

      {isSearching && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white border border-[#E4DDD4] rounded-xl px-4 py-3 text-sm text-[#5C4B3E] shadow-md">
          주소를 찾는 중이에요...
        </div>
      )}

      {!isSearching && searchError && (
        <div className="mt-1.5 text-xs font-medium text-[#C84B11]">{searchError}</div>
      )}

      {!isSearching && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="위치 검색 추천 목록"
          className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-[#E4DDD4] rounded-xl shadow-lg overflow-hidden divide-y divide-[#E4DDD4]"
        >
          {suggestions.slice(0, 5).map((suggestion, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handlePickSuggestion(suggestion)}
                className="w-full min-h-[44px] px-4 py-2.5 text-left text-sm text-[#2C2119] hover:bg-[#F3EFE9] flex items-center gap-2.5 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                <span className="truncate">{suggestion.placePrediction?.text.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface NearbyMapViewportSyncProps {
  userLocation: LatLngLiteral | null;
  farms: FarmWithMeta[];
  focusFarmId: string | null;
  fitTrigger: number;
}

function NearbyMapViewportSync({
  userLocation,
  farms,
  focusFarmId,
  fitTrigger,
}: NearbyMapViewportSyncProps) {
  const map = useMap();
  const coreLib = useMapsLibrary('core');

  useEffect(() => {
    if (!map) return;
    if (focusFarmId) {
      const target = farms.find((f) => f.farm.id === focusFarmId);
      if (target) {
        map.panTo(target.farm.location);
        if ((map.getZoom() ?? 7) < 10) {
          map.setZoom(11);
        }
      }
    }
  }, [map, focusFarmId, farms]);

  useEffect(() => {
    if (!map || !coreLib) return;

    const bounds = new coreLib.LatLngBounds();
    if (userLocation) {
      bounds.extend(userLocation);
      // Include up to 3 closest farms to keep nearby context legible
      const nearbySlice = farms.slice(0, 3);
      nearbySlice.forEach((f) => bounds.extend(f.farm.location));
      if (nearbySlice.length === 0) {
        map.panTo(userLocation);
        map.setZoom(11);
        return;
      }
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
    } else if (farms.length > 0) {
      farms.forEach((f) => bounds.extend(f.farm.location));
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [map, coreLib, userLocation, fitTrigger, farms]);

  return null;
}

interface NearbyGoogleMapCanvasProps {
  farmsWithMeta: FarmWithMeta[];
  userLocation: LatLngLiteral | null;
  userLocationLabel: string;
  selectedFarmId: string | null;
  focusTriggerFarmId: string | null;
  fitTrigger: number;
  onSelectFarm: (farmId: string) => void;
  onOpenFarmStore: (farmId: string) => void;
}

function NearbyGoogleMapCanvas({
  farmsWithMeta,
  userLocation,
  userLocationLabel,
  selectedFarmId,
  focusTriggerFarmId,
  fitTrigger,
  onSelectFarm,
  onOpenFarmStore,
}: NearbyGoogleMapCanvasProps) {
  const loadingStatus = useApiLoadingStatus();
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const activeFarmMeta = useMemo(
    () => farmsWithMeta.find((f) => f.farm.id === selectedFarmId) || null,
    [farmsWithMeta, selectedFarmId]
  );

  const handleMarkerSelect = useCallback(
    (farmId: string, marker: google.maps.marker.AdvancedMarkerElement) => {
      setSelectedMarker(marker);
      setInfoOpen(true);
      onSelectFarm(farmId);
    },
    [onSelectFarm]
  );

  useEffect(() => {
    if (!selectedFarmId) {
      setInfoOpen(false);
    }
  }, [selectedFarmId]);

  if (loadingStatus === APILoadingStatus.FAILED || loadingStatus === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F3EFE9] text-[#5C4B3E]">
        <MapPin className="w-8 h-8 text-[#C84B11] mb-2" aria-hidden="true" />
        <p className="font-display text-lg font-bold text-[#2C2119] mb-1">
          지도를 불러오는 데 어려움이 있어요
        </p>
        <p className="text-sm">
          오른쪽 가까운 덤밭 목록에서 농장별 농산물을 바로 확인하고 주문하실 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      defaultCenter={userLocation || DEFAULT_KOREA_CENTER}
      defaultZoom={userLocation ? 10 : 7}
      gestureHandling="greedy"
      streetViewControl={false}
      mapTypeControl={false}
      fullscreenControl={true}
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      className="w-full h-full"
    >
      <NearbyMapViewportSync
        userLocation={userLocation}
        farms={farmsWithMeta}
        focusFarmId={focusTriggerFarmId}
        fitTrigger={fitTrigger}
      />

      {userLocation && (
        <AdvancedMarker position={userLocation} title={userLocationLabel} zIndex={1200}>
          <Pin background="#2C2119" borderColor="#FAF8F5" glyphColor="#CBE98E" scale={1.15} />
        </AdvancedMarker>
      )}

      {farmsWithMeta.map(({ farm }) => (
        <FarmMarkerWithRef
          key={farm.id}
          farm={farm}
          isSelected={selectedFarmId === farm.id}
          onSelect={handleMarkerSelect}
        />
      ))}

      {infoOpen && selectedMarker && activeFarmMeta && (
        <InfoWindow
          anchor={selectedMarker}
          maxWidth={260}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-[#2C2119] space-y-2">
            <div>
              <p className="text-xs font-medium text-[#5C4B3E]">{activeFarmMeta.farm.subRegion}</p>
              <h3 className="text-base font-bold leading-snug">{activeFarmMeta.farm.name}</h3>
            </div>
            <p className="text-xs text-[#5C4B3E] tabular-nums">
              {activeFarmMeta.distanceKm !== null
                ? `기준 위치에서 직선 약 ${formatDistanceKm(activeFarmMeta.distanceKm)} · `
                : ''}
              판매 농산물 {activeFarmMeta.farmProducts.length}종
            </p>
            <button
              type="button"
              onClick={() => onOpenFarmStore(activeFarmMeta.farm.id)}
              className="w-full min-h-[38px] px-3 py-1.5 rounded-lg bg-[#C84B11] text-white text-xs font-semibold hover:bg-[#A83B0B] cursor-pointer whitespace-nowrap"
            >
              이 덤밭 상품 보러가기
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export function NearbyFarmsView({
  farms,
  products,
  userLocation,
  userLocationLabel,
  onSetUserLocation,
  onOpenFarmStore,
}: NearbyFarmsViewProps) {
  const apiKey = getGoogleMapsApiKey();
  const [radiusFilter, setRadiusFilter] = useState<RadiusFilter>('all');
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(farms[0]?.id || null);
  const [focusTriggerFarmId, setFocusTriggerFarmId] = useState<string | null>(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('이 브라우저에서는 현재 위치 확인을 지원하지 않아요. 지역 검색을 이용해 주세요.');
      return;
    }
    setIsLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        onSetUserLocation(coords, '내 현재 위치');
        setIsLocating(false);
        setFocusTriggerFarmId(null);
        setFitTrigger((n) => n + 1);
      },
      () => {
        setIsLocating(false);
        setGeoError(
          '위치 권한이 꺼져 있거나 확인할 수 없어요. 아래 검색창에서 동네나 역 이름을 찾아 기준 위치를 정해 보세요.'
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handlePlaceChosen = (loc: LatLngLiteral, label: string) => {
    setGeoError('');
    onSetUserLocation(loc, label);
    setFocusTriggerFarmId(null);
    setFitTrigger((n) => n + 1);
  };

  const handleClearLocation = () => {
    onSetUserLocation(null, '');
    setRadiusFilter('all');
    setFocusTriggerFarmId(null);
    setFitTrigger((n) => n + 1);
  };

  const farmsWithMeta = useMemo<FarmWithMeta[]>(() => {
    const mapped = farms
      .map((farm) => {
        const farmProducts = products.filter((p) => p.farmId === farm.id);
        const distanceKm = userLocation ? calculateDistanceKm(userLocation, farm.location) : null;
        return { farm, farmProducts, distanceKm };
      })
      .filter((entry) => entry.farmProducts.length > 0);

    if (userLocation) {
      mapped.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      if (radiusFilter !== 'all') {
        return mapped.filter((entry) => (entry.distanceKm ?? 9999) <= radiusFilter);
      }
    }

    return mapped;
  }, [farms, products, userLocation, radiusFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pt-10 md:pb-16">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="text-sm font-semibold text-[#4D7C0F] mb-1.5">우리 동네 가까운 산지 직거래</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2119] text-balance mb-2">
          내 위치 기준 가까운 덤밭 찾기
        </h1>
        <p className="text-[15px] sm:text-base text-[#5C4B3E]">
          현재 위치나 찾고 싶은 동네를 정하면 가까운 덤밭부터 순서대로 보여 드리고, 그 밭의 농산물을
          바로 주문하실 수 있어요.
        </p>
      </div>

      {/* Location & Radius Controls */}
      <section
        aria-label="기준 위치 설정 및 거리 필터"
        className="bg-white border border-[#E4DDD4] rounded-2xl p-4 sm:p-6 mb-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl bg-[#4D7C0F] text-white text-sm sm:text-base font-semibold hover:bg-[#365314] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LocateFixed className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{isLocating ? '현재 위치 확인 중...' : '내 현재 위치로 찾기'}</span>
          </button>

          {apiKey ? (
            <LocationSearchAutocomplete onSelectPlace={handlePlaceChosen} />
          ) : (
            <div className="flex-1 flex items-center px-4 min-h-[48px] rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] text-sm text-[#7A6859]">
              지도 주소 검색을 준비 중이에요. ‘내 현재 위치로 찾기’로 먼저 가까운 덤밭을 계산해
              보세요.
            </div>
          )}

          {userLocation && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[48px] rounded-xl bg-[#F3EFE9] text-sm font-medium text-[#2C2119] hover:bg-[#E4DDD4] cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>기준 위치 지우기</span>
            </button>
          )}
        </div>

        {geoError && (
          <p role="alert" className="text-sm font-medium text-[#C84B11]">
            {geoError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E4DDD4]">
          <div className="text-sm text-[#5C4B3E]">
            {userLocation ? (
              <span>
                기준 위치: <strong className="text-[#2C2119]">{userLocationLabel}</strong>{' '}
                <span aria-hidden="true">·</span> 가까운 덤밭 순으로 정렬했어요
              </span>
            ) : (
              <span>
                아직 기준 위치를 정하지 않았어요. 전국 덤밭 {farmsWithMeta.length}곳을 함께 보여
                드려요.
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: '전체 거리' },
                { id: 50, label: '50km 이내' },
                { id: 100, label: '100km 이내' },
                { id: 200, label: '200km 이내' },
              ] as const
            ).map((opt) => (
              <button
                key={String(opt.id)}
                type="button"
                disabled={!userLocation && opt.id !== 'all'}
                onClick={() => setRadiusFilter(opt.id)}
                className={`px-3.5 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  radiusFilter === opt.id
                    ? 'bg-[#2C2119] text-white cursor-pointer'
                    : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Split Map + Farm List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Google Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="h-[340px] sm:h-[420px] lg:h-[540px] w-full rounded-2xl overflow-hidden border border-[#E4DDD4] bg-[#F3EFE9]">
            {apiKey ? (
              <NearbyGoogleMapCanvas
                farmsWithMeta={farmsWithMeta}
                userLocation={userLocation}
                userLocationLabel={userLocationLabel || '내 위치'}
                selectedFarmId={selectedFarmId}
                focusTriggerFarmId={focusTriggerFarmId}
                fitTrigger={fitTrigger}
                onSelectFarm={(id) => setSelectedFarmId(id)}
                onOpenFarmStore={onOpenFarmStore}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#5C4B3E]">
                <MapPin className="w-8 h-8 text-[#4D7C0F] mb-2" aria-hidden="true" />
                <p className="font-display text-lg font-bold text-[#2C2119] mb-1">
                  지도 연결이 대기 중이에요
                </p>
                <p className="text-sm max-w-sm">
                  현재 위치 버튼을 누르시면 오른쪽 목록에서 거리순으로 가까운 덤밭과 판매
                  농산물을 바로 확인하실 수 있어요.
                </p>
              </div>
            )}
          </div>
          {apiKey && (
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#5C4B3E] px-1">
              <span>초록 핀은 덤밭 농가, 어두운 핀은 내 기준 위치예요.</span>
              <button
                type="button"
                onClick={() => {
                  setFocusTriggerFarmId(null);
                  setFitTrigger((n) => n + 1);
                }}
                className="font-semibold text-[#2C2119] underline underline-offset-4 hover:text-[#C84B11] cursor-pointer whitespace-nowrap"
              >
                한눈에 보기
              </button>
            </div>
          )}
        </div>

        {/* Nearby Farm Cards */}
        <div className="lg:col-span-5 space-y-3.5 lg:max-h-[540px] lg:overflow-y-auto lg:pr-1">
          {farmsWithMeta.length === 0 ? (
            <div className="bg-white border border-[#E4DDD4] rounded-2xl p-8 text-center space-y-3">
              <p className="font-display text-xl font-bold text-[#2C2119]">
                선택한 거리 안에 덤밭이 없어요
              </p>
              <p className="text-sm text-[#5C4B3E]">
                반경을 ‘전체 거리’로 넓히면 전국의 다른 덤밭도 함께 보실 수 있어요.
              </p>
              <button
                type="button"
                onClick={() => setRadiusFilter('all')}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#C84B11] text-white text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                전체 거리로 보기
              </button>
            </div>
          ) : (
            farmsWithMeta.map(({ farm, farmProducts, distanceKm }) => {
              const isSelected = selectedFarmId === farm.id;
              const lowestPrice = Math.min(...farmProducts.map((p) => p.price));
              return (
                <article
                  key={farm.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-colors ${
                    isSelected ? 'border-[#C84B11] ring-1 ring-[#C84B11]/25' : 'border-[#E4DDD4]'
                  }`}
                >
                  <div className="flex gap-3.5 items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F3EFE9] shrink-0">
                      <SafeImage
                        src={farm.coverImage}
                        alt={`${farm.name} 대표 사진`}
                        className="w-full h-full object-cover"
                        fallbackLabel={farm.name}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-[#5C4B3E] truncate">
                          {farm.subRegion} · {farm.farmerName}
                        </span>
                        {distanceKm !== null && (
                          <span className="text-xs sm:text-sm font-bold text-[#365314] tabular-nums whitespace-nowrap shrink-0">
                            약 {formatDistanceKm(distanceKm)}
                          </span>
                        )}
                      </div>

                      <h2 className="font-display text-lg font-bold text-[#2C2119] leading-snug mb-1">
                        {farm.name}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#5C4B3E] line-clamp-2 mb-2">
                        {farmProducts
                          .map((p) => `${p.name} (${GRADE_LABEL_MAP[p.grade]})`)
                          .join(' · ')}
                      </p>

                      <p className="text-xs text-[#7A6859] tabular-nums">
                        판매 상품 {farmProducts.length}종 · {lowestPrice.toLocaleString('ko-KR')}원부터
                        {farm.pickupAvailable ? ' · 밭 앞 수령 가능' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-[#E4DDD4]">
                    {apiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFarmId(farm.id);
                          setFocusTriggerFarmId(farm.id);
                        }}
                        className="px-3.5 min-h-[42px] rounded-xl border border-[#E4DDD4] bg-[#FAF8F5] text-xs sm:text-sm font-medium text-[#2C2119] hover:border-[#2C2119] cursor-pointer whitespace-nowrap"
                      >
                        지도에서 보기
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenFarmStore(farm.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 min-h-[42px] rounded-xl bg-[#C84B11] text-white text-xs sm:text-sm font-semibold hover:bg-[#A83B0B] cursor-pointer whitespace-nowrap"
                    >
                      <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>이 덤밭 농산물 보러가기</span>
                      <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
