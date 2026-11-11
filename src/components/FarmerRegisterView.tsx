import { ChangeEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, Minus, Plus, Store } from 'lucide-react';
import {
  GRADE_INFO,
  GRADE_LABEL_MAP,
  REGION_DEFAULT_COORDS,
  REGIONS,
  SAMPLE_FARM_PHOTOS,
} from '../data/mockData';
import { CategoryType, Farm, GradeType, Product, RegionType } from '../types';
import { withIGa } from '../utils/korean';
import { SafeImage } from './SafeImage';

interface FarmerRegisterViewProps {
  onRegisterProduct: (product: Product, farm: Farm) => void;
  onViewRegisteredProduct: (productId: string) => void;
  onViewRegisteredFarm: (farmId: string) => void;
  onBackHome: () => void;
}

const DEFAULT_SUBREGION_BY_REGION: Record<RegionType, string> = {
  경기: '양평군',
  강원: '평창군',
  충북: '충주시',
  충남: '부여군',
  전남: '나주시',
  경북: '청송군',
  제주: '서귀포시',
};

interface PresetItem {
  label: string;
  category: CategoryType;
  defaultMarketKgPrice: number;
}

const PRESET_ITEMS: PresetItem[] = [
  { label: '사과', category: '과일', defaultMarketKgPrice: 9000 },
  { label: '감귤', category: '과일', defaultMarketKgPrice: 4800 },
  { label: '배', category: '과일', defaultMarketKgPrice: 6800 },
  { label: '고구마', category: '구황작물', defaultMarketKgPrice: 6200 },
  { label: '감자', category: '구황작물', defaultMarketKgPrice: 4300 },
  { label: '토마토', category: '채소', defaultMarketKgPrice: 7000 },
];

const QUICK_REASONS = [
  '우박을 맞아 겉에 자국이 있어요',
  '바람에 나뭇가지와 스쳤어요',
  '크기가 큰 것과 작은 것이 섞였어요',
  '밭에서 오래 익어 껍질이 살짝 터졌어요',
];

export function FarmerRegisterView({
  onRegisterProduct,
  onViewRegisteredProduct,
  onViewRegisteredFarm,
  onBackHome,
}: FarmerRegisterViewProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [itemName, setItemName] = useState<string>('사과');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [isCustomItem, setIsCustomItem] = useState<boolean>(false);
  const [category, setCategory] = useState<CategoryType>('과일');
  const [region, setRegion] = useState<RegionType>('경북');
  const [subRegionDetail, setSubRegionDetail] = useState<string>('청송군');
  const [hasCustomSubRegion, setHasCustomSubRegion] = useState<boolean>(false);
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');

  const [grade, setGrade] = useState<GradeType>('scar');
  const [gradeReason, setGradeReason] = useState<string>('우박을 맞아 겉에 자국이 있어요');

  const [weightKg, setWeightKg] = useState<number>(3);
  const [stock, setStock] = useState<number>(20);
  const [price, setPrice] = useState<number>(17500);

  const [stepError, setStepError] = useState<string>('');
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  const effectiveItemName = isCustomItem ? customItemName.trim() : itemName;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setStepError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePhoto = (sample: (typeof SAMPLE_FARM_PHOTOS)[number]) => {
    setPhotoUrl(sample.url);
    setStepError('');
  };

  const handleSelectPresetItem = (preset: PresetItem) => {
    setIsCustomItem(false);
    setItemName(preset.label);
    setCategory(preset.category);
    const suggestedMarket = preset.defaultMarketKgPrice * weightKg;
    setPrice(Math.round((suggestedMarket * 0.65) / 100) * 100);
    setStepError('');
  };

  const handleWeightChange = (nextKg: number) => {
    setWeightKg(nextKg);
    const matchedPreset = PRESET_ITEMS.find((p) => p.label === itemName);
    const basePerKg = matchedPreset ? matchedPreset.defaultMarketKgPrice : 6500;
    setPrice(Math.round((basePerKg * nextKg * 0.65) / 100) * 100);
  };

  const goNextStep = () => {
    if (step === 1 && !photoUrl) {
      setStepError('먼저 농산물 사진 한 장을 올려 주세요.');
      return;
    }
    if (step === 2) {
      if (!effectiveItemName) {
        setStepError('판매할 품목 이름을 선택하거나 적어 주세요.');
        return;
      }
      if (!farmerName.trim()) {
        setStepError('농부님 성함을 적어 주세요.');
        return;
      }
    }
    if (step === 3 && !gradeReason.trim()) {
      setStepError('왜 못났는지 한 줄 이유를 선택하거나 적어 주세요.');
      return;
    }

    setStepError('');
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goPrevStep = () => {
    setStepError('');
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteSubmit = () => {
    if (price < 1000) {
      setStepError('판매 가격을 1,000원 이상으로 적어 주세요.');
      return;
    }
    const cleanName = farmerName.trim() || '정성 농부';
    const displayFarmer = cleanName.endsWith('농부') ? cleanName : `${cleanName} 농부`;
    const displayFarm = farmName.trim() || `${subRegionDetail.trim() || region} 작은밭 농장`;
    const marketEstimate = Math.round((price * 1.48) / 100) * 100;
    const todayStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timestamp = Date.now();
    const farmId = `farm-user-${timestamp}`;
    const cleanSubRegion = subRegionDetail.trim();
    const fullSubRegion = `${region}${cleanSubRegion ? ` ${cleanSubRegion}` : ''}`;
    const baseCoords = REGION_DEFAULT_COORDS[region];
    // Add slight deterministic offset so multiple user-registered farms remain distinct pins on the map
    const latOffset = (((timestamp % 9) - 4) * 0.014);
    const lngOffset = ((((Math.floor(timestamp / 10)) % 9) - 4) * 0.016);

    const newFarm: Farm = {
      id: farmId,
      name: displayFarm,
      farmerName: displayFarmer,
      region,
      subRegion: fullSubRegion,
      shortAddress: `${fullSubRegion} 산지 농장`,
      location: {
        lat: Number((baseCoords.lat + latOffset).toFixed(4)),
        lng: Number((baseCoords.lng + lngOffset).toFixed(4)),
      },
      bio: `${region}에서 정직하게 농사짓고 있습니다. 겉은 투박해도 직접 기른 만큼 맛에는 자신 있습니다.`,
      quote: `${gradeReason.trim()} 그래도 맛 하나만큼은 자신 있게 보내 드립니다.`,
      pickupAvailable: false,
      deliveryNote: '산지 직송 평균 1~2일 소요 (주문 확인 후 순차 출고)',
      coverImage: photoUrl,
      isUserRegistered: true,
    };

    const newProduct: Product = {
      id: `farmer-${timestamp}`,
      farmId,
      name: `${fullSubRegion} ${effectiveItemName}`.trim(),
      category,
      grade,
      gradeReason: gradeReason.trim(),
      gradeDetail: `${gradeReason.trim()} 선별 기준에서는 빠졌지만 ${todayStr}에 직접 수확한 신선한 ${effectiveItemName}입니다. 겉모습과 달리 속 맛은 그대로여서 알뜰하게 드시기 좋습니다.`,
      region,
      subRegion: fullSubRegion,
      price,
      marketPrice: marketEstimate,
      weightKg,
      weightRange: `${weightKg}kg ± 200g (정량 포장)`,
      harvestDate: todayStr,
      storageTip: '받으신 뒤 서늘하고 통풍이 잘 되는 곳에 보관해 주세요.',
      stock,
      image: photoUrl,
      farmerName: displayFarmer,
      farmName: displayFarm,
      farmerBio: newFarm.bio,
      farmerQuote: newFarm.quote,
      isUserRegistered: true,
    };

    onRegisterProduct(newProduct, newFarm);
    setCreatedProduct(newProduct);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setCreatedProduct(null);
    setStep(1);
    setPhotoUrl('');
    setStepError('');
  };

  if (createdProduct) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="bg-white border-2 border-[#4D7C0F] rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#ECF5D8] flex items-center justify-center text-[#365314]">
            <Check className="w-8 h-8" strokeWidth={2.5} aria-hidden="true" />
          </div>

          <div>
            <p className="text-base font-bold text-[#4D7C0F]">등록이 끝났어요</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] mt-1">
              이제 손님들이 바로 살 수 있어요
            </h1>
            <p className="text-base sm:text-lg text-[#5C4B3E] mt-2 leading-relaxed">
              방금 올리신 <strong>{withIGa(createdProduct.name)}</strong> ‘오늘의 덤밭’ 장터에
              올라갔어요.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] flex items-center gap-4">
            <div className="w-24 h-20 rounded-xl overflow-hidden bg-[#F3EFE9] shrink-0">
              <SafeImage
                src={createdProduct.image}
                alt={createdProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-base font-bold text-[#2C2119] truncate">{createdProduct.name}</p>
              <p className="text-sm text-[#5C4B3E]">{GRADE_LABEL_MAP[createdProduct.grade]}</p>
              <p className="text-base font-bold text-[#C84B11] tabular-nums">
                {createdProduct.weightRange} · {createdProduct.price.toLocaleString('ko-KR')}원
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onViewRegisteredProduct(createdProduct.id)}
              className="flex-1 min-h-[56px] px-5 rounded-xl bg-[#C84B11] text-white text-lg font-bold hover:bg-[#A83B0B] cursor-pointer whitespace-nowrap"
            >
              방금 올린 상품 보러가기
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 min-h-[56px] px-5 rounded-xl border-2 border-[#2C2119] bg-white text-[#2C2119] text-lg font-bold hover:bg-[#F3EFE9] cursor-pointer whitespace-nowrap"
            >
              하나 더 등록하기
            </button>
          </div>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => onViewRegisteredFarm(createdProduct.farmId)}
              className="inline-flex items-center gap-1.5 min-h-[44px] text-base font-semibold text-[#365314] hover:text-[#4D7C0F] underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>우리 농장 판매 페이지 확인하기</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = ['1. 사진 올리기', '2. 품목·농가 적기', '3. 등급 고르기', '4. 수량·가격 적기'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20 md:py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 min-h-[48px] text-base font-semibold text-[#5C4B3E] hover:text-[#2C2119] cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>첫 화면으로</span>
        </button>
        <span className="text-sm sm:text-base font-bold text-[#365314] bg-[#ECF5D8] px-3.5 py-1.5 rounded-lg whitespace-nowrap">
          3분 안에 끝나요
        </span>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2119] mb-2">
          농가 판매 등록하기
        </h1>
        <p className="text-base sm:text-lg text-[#5C4B3E]">
          복잡한 글쓰기 없이 네 가지만 고르시면 바로 올라가요.
        </p>
      </div>

      {/* Senior-Friendly Clear 4-Step Progress */}
      <div
        aria-label="등록 단계"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8"
      >
        {stepLabels.map((label, idx) => {
          const stepNumber = (idx + 1) as 1 | 2 | 3 | 4;
          const isCurrent = step === stepNumber;
          const isDone = step > stepNumber;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (stepNumber < step) {
                  setStep(stepNumber);
                  setStepError('');
                }
              }}
              disabled={stepNumber > step}
              className={`min-h-[48px] px-3 py-2.5 rounded-xl border-2 text-left text-sm sm:text-[15px] font-bold transition-colors ${
                isCurrent
                  ? 'bg-[#2C2119] border-[#2C2119] text-white'
                  : isDone
                  ? 'bg-[#ECF5D8] border-[#C6DDA0] text-[#365314] cursor-pointer'
                  : 'bg-white border-[#E4DDD4] text-[#7A6859] cursor-default'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Step Card */}
      <div className="bg-white border-2 border-[#E4DDD4] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* STEP 1: Photo Upload */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-base font-bold text-[#4D7C0F] mb-1 tabular-nums">1단계 / 4단계</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] mb-2">
                농산물 실물 사진을 올려 주세요
              </h2>
              <p className="text-base sm:text-lg text-[#5C4B3E] leading-relaxed">
                예쁘게 꾸미지 마시고, 상자에 담긴 모습 그대로 한 장만 찍어서 올려 주세요.
              </p>
            </div>

            {photoUrl ? (
              <div className="space-y-4">
                <div className="aspect-[4/3] w-full max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-[#4D7C0F] bg-[#F3EFE9]">
                  <SafeImage
                    src={photoUrl}
                    alt="올린 농산물 미리보기 사진"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <label className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-xl border-2 border-[#2C2119] bg-white text-base font-bold text-[#2C2119] hover:bg-[#F3EFE9] cursor-pointer">
                    <Camera className="w-5 h-5" aria-hidden="true" />
                    <span>다른 사진으로 바꾸기</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 min-h-[210px] p-6 rounded-2xl border-2 border-dashed border-[#7A6859] bg-[#FAF8F5] hover:bg-[#F3EFE9] cursor-pointer text-center transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-[#C84B11] text-white flex items-center justify-center">
                  <Camera className="w-8 h-8" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-[#2C2119]">
                  여기를 눌러 사진 찍기 · 고르기
                </span>
                <span className="text-base text-[#5C4B3E]">
                  휴대폰 사진첩에서 고르셔도 바로 올라가요
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}

            {/* Quick Sample Photos for Easy Prototype Testing */}
            <div className="pt-4 border-t border-[#E4DDD4]">
              <p className="text-sm sm:text-base font-semibold text-[#5C4B3E] mb-3">
                지금 사진이 없으시면 아래 예시 사진 중 하나를 눌러 해보세요
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_FARM_PHOTOS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample)}
                    className={`rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                      photoUrl === sample.url
                        ? 'border-[#C84B11] ring-2 ring-[#C84B11]/25'
                        : 'border-[#E4DDD4] hover:border-[#7A6859]'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-[#F3EFE9]">
                      <SafeImage
                        src={sample.url}
                        alt={sample.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="block px-2.5 py-2 text-sm font-semibold text-[#2C2119] bg-white">
                      {sample.defaultItem}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Item & Farmer Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-base font-bold text-[#4D7C0F] mb-1 tabular-nums">2단계 / 4단계</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] mb-2">
                어떤 작물이고 어디 농가인가요?
              </h2>
              <p className="text-base sm:text-lg text-[#5C4B3E]">
                손님들이 알아보기 쉽게 품목과 지역, 농부님 성함을 알려 주세요.
              </p>
            </div>

            <div>
              <span className="block text-lg font-bold text-[#2C2119] mb-3">품목 고르기</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_ITEMS.map((preset) => {
                  const active = !isCustomItem && itemName === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPresetItem(preset)}
                      className={`min-h-[56px] px-4 py-3 rounded-xl border-2 text-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#2C2119] border-[#2C2119] text-white'
                          : 'bg-[#FAF8F5] border-[#E4DDD4] text-[#2C2119] hover:border-[#7A6859]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setIsCustomItem(true)}
                  className={`min-h-[56px] px-4 py-3 rounded-xl border-2 text-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isCustomItem
                      ? 'bg-[#2C2119] border-[#2C2119] text-white'
                      : 'bg-[#FAF8F5] border-[#E4DDD4] text-[#2C2119] hover:border-[#7A6859]'
                  }`}
                >
                  직접 쓰기
                </button>
              </div>

              {isCustomItem && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="예: 복숭아, 양파, 단감"
                    aria-label="판매할 품목 이름"
                    className="w-full min-h-[56px] px-4 rounded-xl bg-[#FAF8F5] border-2 border-[#7A6859] text-lg font-medium text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(['과일', '채소', '구황작물'] as CategoryType[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`min-h-[48px] px-4 rounded-xl border-2 text-base font-bold cursor-pointer ${
                          category === cat
                            ? 'bg-[#4D7C0F] border-[#4D7C0F] text-white'
                            : 'bg-white border-[#E4DDD4] text-[#2C2119]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <span className="block text-lg font-bold text-[#2C2119] mb-3">어느 지역인가요?</span>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRegion(r);
                      if (!hasCustomSubRegion) {
                        setSubRegionDetail(DEFAULT_SUBREGION_BY_REGION[r]);
                      }
                    }}
                    className={`min-h-[52px] rounded-xl border-2 text-base font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      region === r
                        ? 'bg-[#4D7C0F] border-[#4D7C0F] text-white'
                        : 'bg-[#FAF8F5] border-[#E4DDD4] text-[#2C2119] hover:border-[#7A6859]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={subRegionDetail}
                onChange={(e) => {
                  setSubRegionDetail(e.target.value);
                  setHasCustomSubRegion(true);
                }}
                placeholder="시·군 이름을 적어 주세요 (예: 청송군, 서귀포시)"
                aria-label="세부 지역명"
                className="w-full mt-3 min-h-[52px] px-4 rounded-xl bg-[#FAF8F5] border-2 border-[#E4DDD4] text-lg text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="farmer-name-input"
                  className="block text-lg font-bold text-[#2C2119] mb-2"
                >
                  농부님 성함 (필수)
                </label>
                <input
                  id="farmer-name-input"
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="예: 박순자"
                  className="w-full min-h-[56px] px-4 rounded-xl bg-[#FAF8F5] border-2 border-[#E4DDD4] text-lg text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
                />
              </div>
              <div>
                <label
                  htmlFor="farm-name-input"
                  className="block text-lg font-bold text-[#2C2119] mb-2"
                >
                  농장 이름 (선택)
                </label>
                <input
                  id="farm-name-input"
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="예: 햇살 과수원"
                  className="w-full min-h-[56px] px-4 rounded-xl bg-[#FAF8F5] border-2 border-[#E4DDD4] text-lg text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Grade Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-base font-bold text-[#4D7C0F] mb-1 tabular-nums">3단계 / 4단계</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] mb-2">
                어디가 어떻게 못났는지 골라 주세요
              </h2>
              <p className="text-base sm:text-lg text-[#5C4B3E]">
                가장 가까운 등급을 고르시면 손님도 이해하고 반품 걱정도 줄어들어요.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {GRADE_INFO.map((g) => {
                const active = grade === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGrade(g.id)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#ECF5D8] border-[#4D7C0F]'
                        : 'bg-[#FAF8F5] border-[#E4DDD4] hover:border-[#7A6859]'
                    }`}
                  >
                    <p className="text-sm font-bold text-[#365314] mb-1">{g.shortTag}</p>
                    <p className="font-display text-xl font-bold text-[#2C2119] mb-2">{g.label}</p>
                    <p className="text-base text-[#5C4B3E] leading-relaxed">{g.summary}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-2">
              <label
                htmlFor="grade-reason-input"
                className="block text-lg font-bold text-[#2C2119]"
              >
                손님께 전할 솔직한 한 줄 설명
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setGradeReason(reason)}
                    className={`min-h-[48px] px-4 py-2 rounded-xl border-2 text-base font-medium text-left cursor-pointer ${
                      gradeReason === reason
                        ? 'bg-[#2C2119] border-[#2C2119] text-white'
                        : 'bg-white border-[#E4DDD4] text-[#2C2119] hover:border-[#7A6859]'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <input
                id="grade-reason-input"
                type="text"
                value={gradeReason}
                onChange={(e) => setGradeReason(e.target.value)}
                placeholder="직접 적어 주셔도 좋아요"
                className="w-full min-h-[56px] px-4 rounded-xl bg-[#FAF8F5] border-2 border-[#E4DDD4] text-lg text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Weight, Stock, Price */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <p className="text-base font-bold text-[#4D7C0F] mb-1 tabular-nums">4단계 / 4단계</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] mb-2">
                한 상자 무게와 수량, 가격을 적어 주세요
              </h2>
              <p className="text-base sm:text-lg text-[#5C4B3E]">
                정량을 맞춰 보내주시면 되고, 가격은 시중보다 조금 가볍게 정해 주세요.
              </p>
            </div>

            <div>
              <span className="block text-lg font-bold text-[#2C2119] mb-3">
                한 상자 무게 (오차 ±200g 안내)
              </span>
              <div className="grid grid-cols-4 gap-2.5">
                {[2, 3, 5, 10].map((kg) => (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => handleWeightChange(kg)}
                    className={`min-h-[56px] rounded-xl border-2 text-lg font-bold tabular-nums cursor-pointer ${
                      weightKg === kg
                        ? 'bg-[#2C2119] border-[#2C2119] text-white'
                        : 'bg-[#FAF8F5] border-[#E4DDD4] text-[#2C2119] hover:border-[#7A6859]'
                    }`}
                  >
                    {kg}kg
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E4DDD4]">
              <div>
                <p className="text-lg font-bold text-[#2C2119]">판매할 상자 수</p>
                <p className="text-base text-[#5C4B3E]">보내실 수 있는 만큼만 올려 주세요</p>
              </div>
              <div className="inline-flex items-center gap-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStock((s) => Math.max(1, s - 5))}
                  aria-label="수량 5상자 줄이기"
                  className="w-14 h-14 rounded-xl bg-white border-2 border-[#2C2119] flex items-center justify-center text-[#2C2119] cursor-pointer"
                >
                  <Minus className="w-6 h-6" aria-hidden="true" />
                </button>
                <span className="min-w-[84px] text-center text-2xl font-bold text-[#2C2119] tabular-nums">
                  {stock}상자
                </span>
                <button
                  type="button"
                  onClick={() => setStock((s) => s + 5)}
                  aria-label="수량 5상자 늘리기"
                  className="w-14 h-14 rounded-xl bg-white border-2 border-[#2C2119] flex items-center justify-center text-[#2C2119] cursor-pointer"
                >
                  <Plus className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="farmer-price-input"
                className="block text-lg font-bold text-[#2C2119] mb-2"
              >
                한 상자 판매 가격 (원)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  id="farmer-price-input"
                  type="number"
                  step={500}
                  min={1000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="flex-1 min-h-[60px] px-4 rounded-xl bg-[#FAF8F5] border-2 border-[#7A6859] text-2xl font-bold text-[#C84B11] tabular-nums focus:outline-none focus:border-[#C84B11]"
                />
                <span className="text-xl font-bold text-[#2C2119] shrink-0">
                  원 / {weightKg}kg 한 상자
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[10000, 15000, 20000, 25000].map((quickPrice) => (
                  <button
                    key={quickPrice}
                    type="button"
                    onClick={() => setPrice(quickPrice)}
                    className="min-h-[44px] px-4 rounded-xl bg-[#F3EFE9] border border-[#E4DDD4] text-base font-semibold text-[#2C2119] hover:bg-[#E4DDD4] tabular-nums cursor-pointer"
                  >
                    {quickPrice.toLocaleString('ko-KR')}원
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Summary */}
            <div className="p-5 rounded-2xl bg-[#ECF5D8]/70 border-2 border-[#C6DDA0] space-y-2">
              <p className="text-base font-bold text-[#365314]">손님 화면에는 이렇게 보여요</p>
              <p className="text-lg font-bold text-[#2C2119]">
                {region} {subRegionDetail.trim()} {effectiveItemName} · {GRADE_LABEL_MAP[grade]}
              </p>
              <p className="text-base text-[#5C4B3E]">{gradeReason}</p>
              <p className="text-lg font-bold text-[#C84B11] tabular-nums">
                {weightKg}kg ± 200g (정량 포장) · {price.toLocaleString('ko-KR')}원 · {stock}상자
              </p>
            </div>
          </div>
        )}

        {stepError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#FFF4ED] border-2 border-[#C84B11] text-base font-bold text-[#A83B0B]"
          >
            {stepError}
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="pt-4 border-t border-[#E4DDD4] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={goPrevStep}
              className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 rounded-xl border-2 border-[#2C2119] bg-white text-lg font-bold text-[#2C2119] hover:bg-[#F3EFE9] cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>이전</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={goNextStep}
              className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-xl bg-[#2C2119] text-white text-lg font-bold hover:bg-[#3F3126] cursor-pointer whitespace-nowrap"
            >
              <span>다음 단계로</span>
              <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteSubmit}
              className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-xl bg-[#C84B11] text-white text-lg font-bold hover:bg-[#A83B0B] cursor-pointer whitespace-nowrap"
            >
              <Check className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>판매 등록 끝내기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
