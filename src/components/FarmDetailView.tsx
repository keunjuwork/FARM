import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  Map as GoogleMap,
  Pin,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ArrowLeft, ExternalLink, MapPin, Navigation, ShoppingBag } from 'lucide-react';
import { GRADE_LABEL_MAP } from '../data/mockData';
import { Farm, LatLngLiteral, Product } from '../types';
import {
  calculateDistanceKm,
  formatDistanceKm,
  getGoogleMapsApiKey,
  isQuotaOrRateLimitError,
} from '../utils/geo';
import { SafeImage } from './SafeImage';

interface FarmDetailViewProps {
  farm: Farm;
  farmProducts: Product[];
  userLocation: LatLngLiteral | null;
  userLocationLabel: string;
  onBackToNearby: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

interface RouteOverlayProps {
  origin: LatLngLiteral | null;
  destination: LatLngLiteral;
  requestRouteTrigger: number;
  onRouteResult: (summary: { distanceMeters: number; durationMillis: number } | null, err?: string) => void;
  onRouteLoading: (loading: boolean) => void;
}

function FarmRouteOverlay({
  origin,
  destination,
  requestRouteTrigger,
  onRouteResult,
  onRouteLoading,
}: RouteOverlayProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
  }, []);

  useEffect(() => {
    if (requestRouteTrigger === 0 || !origin || !routesLib || !map) return;

    let cancelled = false;
    clearPolylines();

    const compute = async () => {
      onRouteLoading(true);
      try {
        const response = await routesLib.Route.computeRoutes({
          origin,
          destination,
          travelMode: 'DRIVING' as google.maps.TravelModeString,
          fields: ['durationMillis', 'distanceMeters', 'path', 'viewport'],
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
        });

        if (cancelled) return;
        const route = response.routes?.[0];
        if (!route) {
          onRouteResult(
            null,
            '이 구간은 지도에서 바로 차량 경로를 그리기 어려워요. 위 직선 거리와 구글 지도 길 안내 버튼을 참고해 주세요.'
          );
          return;
        }

        const createdLines = route.createPolylines({
          polylineOptions: {
            strokeColor: '#C84B11',
            strokeOpacity: 0.9,
            strokeWeight: 5,
          },
        });
        createdLines.forEach((line) => line.setMap(map));
        polylinesRef.current = createdLines;

        if (route.viewport) {
          map.fitBounds(route.viewport, { top: 32, right: 32, bottom: 32, left: 32 });
        }

        onRouteResult({
          distanceMeters: route.distanceMeters ?? 0,
          durationMillis: route.durationMillis ?? 0,
        });
      } catch (err) {
        if (isQuotaOrRateLimitError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          onRouteResult(null, '이동 경로를 불러오지 못했어요. 직선 거리와 길 안내 버튼을 참고해 주세요.');
        }
      } finally {
        if (!cancelled) {
          onRouteLoading(false);
        }
      }
    };

    void compute();

    return () => {
      cancelled = true;
    };
  }, [requestRouteTrigger, origin, destination, routesLib, map, clearPolylines, onRouteLoading, onRouteResult]);

  useEffect(() => {
    return () => {
      clearPolylines();
    };
  }, [clearPolylines]);

  return null;
}

interface FarmMiniMapProps {
  farm: Farm;
  userLocation: LatLngLiteral | null;
  requestRouteTrigger: number;
  onRouteResult: (summary: { distanceMeters: number; durationMillis: number } | null, err?: string) => void;
  onRouteLoading: (loading: boolean) => void;
}

function FarmMiniMap({
  farm,
  userLocation,
  requestRouteTrigger,
  onRouteResult,
  onRouteLoading,
}: FarmMiniMapProps) {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#F3EFE9] text-center text-sm text-[#5C4B3E]">
        <MapPin className="w-6 h-6 text-[#4D7C0F] mb-1.5" aria-hidden="true" />
        <span>{farm.shortAddress}</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      defaultCenter={farm.location}
      defaultZoom={11}
      gestureHandling="cooperative"
      streetViewControl={false}
      mapTypeControl={false}
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      className="w-full h-full"
    >
      <AdvancedMarker position={farm.location} title={farm.name} zIndex={500}>
        <Pin background="#C84B11" borderColor="#7C2D12" glyphColor="#FFFFFF" scale={1.15} />
      </AdvancedMarker>

      {userLocation && (
        <AdvancedMarker position={userLocation} title="내 기준 위치" zIndex={400}>
          <Pin background="#2C2119" borderColor="#FAF8F5" glyphColor="#CBE98E" scale={1.0} />
        </AdvancedMarker>
      )}

      <FarmRouteOverlay
        origin={userLocation}
        destination={farm.location}
        requestRouteTrigger={requestRouteTrigger}
        onRouteResult={onRouteResult}
        onRouteLoading={onRouteLoading}
      />
    </GoogleMap>
  );
}

function formatDurationKorean(ms: number): string {
  const totalMinutes = Math.max(1, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `약 ${mins}분`;
  if (mins === 0) return `약 ${hours}시간`;
  return `약 ${hours}시간 ${mins}분`;
}

export function FarmDetailView({
  farm,
  farmProducts,
  userLocation,
  userLocationLabel,
  onBackToNearby,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}: FarmDetailViewProps) {
  const apiKey = getGoogleMapsApiKey();
  const [routeTrigger, setRouteTrigger] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeSummary, setRouteSummary] = useState<{
    distanceMeters: number;
    durationMillis: number;
  } | null>(null);

  const straightDistanceKm = userLocation
    ? calculateDistanceKm(userLocation, farm.location)
    : null;

  const handleRouteResult = useCallback(
    (summary: { distanceMeters: number; durationMillis: number } | null, err?: string) => {
      setRouteSummary(summary);
      setRouteError(err || '');
    },
    []
  );

  const externalDirectionsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${farm.location.lat},${farm.location.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${farm.location.lat},${farm.location.lng}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pt-8 md:pb-16">
      <button
        type="button"
        onClick={onBackToNearby}
        className="inline-flex items-center gap-2 min-h-[44px] text-sm sm:text-[15px] font-medium text-[#5C4B3E] hover:text-[#2C2119] mb-5 cursor-pointer whitespace-nowrap"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>가까운 덤밭 목록으로 돌아가기</span>
      </button>

      {/* Farm Profile + Map Split */}
      <section className="bg-white border border-[#E4DDD4] rounded-2xl overflow-hidden mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 bg-[#F3EFE9]">
            <SafeImage
              src={farm.coverImage}
              alt={`${farm.name} 대표 사진`}
              className="w-full aspect-[4/3] lg:h-full object-cover"
              fallbackLabel={farm.name}
            />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#4D7C0F] mb-1.5">
                  {farm.shortAddress} <span aria-hidden="true">·</span> {farm.farmerName}
                  {straightDistanceKm !== null && (
                    <>
                      {' '}
                      <span aria-hidden="true">·</span>{' '}
                      <span className="tabular-nums font-semibold">
                        {userLocationLabel || '내 위치'}에서 직선 약{' '}
                        {formatDistanceKm(straightDistanceKm)}
                      </span>
                    </>
                  )}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] text-balance">
                  {farm.name}
                </h1>
              </div>

              <p className="text-[15px] sm:text-base text-[#5C4B3E] leading-relaxed">{farm.bio}</p>

              <blockquote className="p-4 rounded-xl bg-[#F3EFE9] border border-[#E4DDD4] text-[15px] font-medium text-[#2C2119] leading-relaxed">
                “{farm.quote}”
              </blockquote>

              <div className="text-sm text-[#5C4B3E] space-y-1">
                <p>
                  <strong className="text-[#2C2119]">출고·수령 안내:</strong> {farm.deliveryNote}
                </p>
                <p>
                  <strong className="text-[#2C2119]">현장 방문:</strong>{' '}
                  {farm.pickupAvailable
                    ? '사전 주문 후 농장 앞 직접 수령 가능해요'
                    : '산지 택배 발송만 진행해요'}
                </p>
              </div>
            </div>

            {/* Farm Mini Map & Route Distance */}
            <div className="pt-4 border-t border-[#E4DDD4] space-y-3">
              <div className="h-[200px] w-full rounded-xl overflow-hidden border border-[#E4DDD4] bg-[#F3EFE9]">
                {apiKey ? (
                  <FarmMiniMap
                    farm={farm}
                    userLocation={userLocation}
                    requestRouteTrigger={routeTrigger}
                    onRouteResult={handleRouteResult}
                    onRouteLoading={setRouteLoading}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-sm text-[#5C4B3E]">
                    <MapPin className="w-6 h-6 text-[#4D7C0F] mb-1.5" aria-hidden="true" />
                    <span>{farm.shortAddress}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {apiKey && userLocation && (
                    <button
                      type="button"
                      onClick={() => setRouteTrigger((n) => n + 1)}
                      disabled={routeLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[42px] rounded-xl bg-[#2C2119] text-white text-xs sm:text-sm font-semibold hover:bg-[#3F3126] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                    >
                      <Navigation className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>
                        {routeLoading ? '차량 경로 계산 중...' : '차량 이동 거리·소요 시간 보기'}
                      </span>
                    </button>
                  )}

                  <a
                    href={externalDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[42px] rounded-xl border border-[#E4DDD4] bg-[#FAF8F5] text-xs sm:text-sm font-medium text-[#2C2119] hover:border-[#2C2119] whitespace-nowrap"
                  >
                    <span>구글 지도로 길 안내 열기</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </div>

                {routeSummary && (
                  <p className="text-sm font-bold text-[#365314] tabular-nums">
                    차량 약 {formatDistanceKm(routeSummary.distanceMeters / 1000)} ·{' '}
                    {formatDurationKorean(routeSummary.durationMillis)} 소요
                  </p>
                )}
                {routeError && <p className="text-xs font-medium text-[#C84B11]">{routeError}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Farm's Products Section */}
      <section aria-label="이 덤밭에서 판매 중인 농산물">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119]">
              이 덤밭에서 지금 파는 농산물
            </h2>
            <p className="text-sm sm:text-base text-[#5C4B3E] mt-1 tabular-nums">
              {farm.name}에서 직접 올린 못난이 농산물 {farmProducts.length}종이에요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmProducts.map((product) => {
            const discountRate = Math.round(
              ((product.marketPrice - product.price) / product.marketPrice) * 100
            );
            return (
              <article
                key={product.id}
                className="group flex flex-col bg-white border border-[#E4DDD4] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(product.id)}
                  className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C84B11]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3EFE9]">
                    <SafeImage
                      src={product.image}
                      alt={`${product.name} 실물 사진`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      fallbackLabel={product.name}
                    />
                  </div>
                  <div className="p-5 pb-3">
                    <p className="text-xs font-medium text-[#5C4B3E] mb-1.5">
                      <span className="text-[#365314] font-semibold">
                        {GRADE_LABEL_MAP[product.grade]}
                      </span>{' '}
                      <span aria-hidden="true">·</span> {product.harvestDate} 수확
                    </p>
                    <h3 className="text-lg font-bold text-[#2C2119] leading-snug mb-1.5">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#5C4B3E] line-clamp-2 mb-3">{product.gradeReason}</p>
                    <div className="flex items-baseline gap-2.5 tabular-nums">
                      <span className="text-lg font-bold text-[#C84B11]">
                        {product.price.toLocaleString('ko-KR')}원
                      </span>
                      <span className="text-xs text-[#7A6859] line-through">
                        {product.marketPrice.toLocaleString('ko-KR')}원
                      </span>
                      <span className="text-xs font-semibold text-[#365314]">
                        {discountRate}% 가벼움
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6859] mt-1 tabular-nums">
                      {product.weightRange} · {product.stock}상자 남음
                    </p>
                  </div>
                </button>

                <div className="px-5 pb-5 pt-2 mt-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product, 1)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-[#F3EFE9] text-[#2C2119] text-sm font-semibold hover:bg-[#E4DDD4] cursor-pointer whitespace-nowrap"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>장바구니 담기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onBuyNow(product, 1)}
                    className="px-4 min-h-[44px] rounded-xl bg-[#C84B11] text-white text-sm font-semibold hover:bg-[#A83B0B] cursor-pointer whitespace-nowrap"
                  >
                    바로 구매
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
