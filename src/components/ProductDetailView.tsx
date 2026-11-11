import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShieldCheck, Store } from 'lucide-react';
import { GRADE_INFO, GRADE_LABEL_MAP } from '../data/mockData';
import { Product } from '../types';
import { SafeImage } from './SafeImage';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onOpenFarmStore: (farmId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailView({
  product,
  onBack,
  onOpenFarmStore,
  onAddToCart,
  onBuyNow,
}: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);

  const gradeMeta = GRADE_INFO.find((g) => g.id === product.grade);
  const discountRate = Math.round(
    ((product.marketPrice - product.price) / product.marketPrice) * 100
  );
  const totalPrice = product.price * quantity;

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => Math.min(product.stock, q + 1));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-28 md:pt-8 md:pb-16">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 min-h-[44px] text-sm sm:text-[15px] font-medium text-[#5C4B3E] hover:text-[#2C2119] mb-5 cursor-pointer whitespace-nowrap"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>오늘의 덤밭으로 돌아가기</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Unretouched Real Photo + Farmer Bio */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E4DDD4] rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] w-full bg-[#F3EFE9]">
              <SafeImage
                src={product.image}
                alt={`${product.name} 농가 직송 실물 사진`}
                className="w-full h-full object-cover"
                fallbackLabel={product.name}
              />
            </div>
            <div className="px-5 py-3.5 border-t border-[#E4DDD4] bg-[#FAF8F5] text-xs sm:text-sm text-[#5C4B3E]">
              보정이나 연출 없이 농가에서 직접 찍은 실물 사진이에요.
            </div>
          </div>

          {/* Farmer Introduction */}
          <section
            aria-label="농가 소개"
            className="bg-white border border-[#E4DDD4] rounded-2xl p-6 space-y-4"
          >
            <div>
              <p className="text-xs font-semibold text-[#4D7C0F] mb-1">농가 소개</p>
              <h2 className="font-display text-xl font-bold text-[#2C2119]">
                {product.farmName} <span aria-hidden="true">·</span> {product.farmerName}
              </h2>
            </div>

            <p className="text-[15px] text-[#5C4B3E] leading-relaxed">{product.farmerBio}</p>

            <blockquote className="p-4 rounded-xl bg-[#F3EFE9] border border-[#E4DDD4] text-[15px] font-medium text-[#2C2119] leading-relaxed">
              “{product.farmerQuote}”
            </blockquote>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenFarmStore(product.farmId)}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#E4DDD4] bg-[#FAF8F5] text-sm font-semibold text-[#2C2119] hover:border-[#4D7C0F] hover:text-[#365314] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Store className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                <span>이 덤밭 농가 페이지 보기</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 bg-white border border-[#E4DDD4] rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#5C4B3E] mb-2">
              {product.subRegion} <span aria-hidden="true">·</span>{' '}
              <span className="text-[#365314] font-semibold">
                {GRADE_LABEL_MAP[product.grade]}
              </span>{' '}
              <span aria-hidden="true">·</span> {product.harvestDate} 수확
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] leading-snug text-balance mb-4">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
              <span className="text-2xl sm:text-3xl font-bold text-[#C84B11]">
                {product.price.toLocaleString('ko-KR')}원
              </span>
              <span className="text-sm text-[#7A6859] line-through">
                시중 참고가 {product.marketPrice.toLocaleString('ko-KR')}원
              </span>
              <span className="text-sm font-semibold text-[#365314]">
                약 {discountRate}% 가벼운 가격
              </span>
            </div>
          </div>

          {/* Honest Grade Description */}
          <div className="p-5 rounded-xl bg-[#F3EFE9]/80 border border-[#E4DDD4] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#2C2119]">
                솔직한 등급 설명 ({GRADE_LABEL_MAP[product.grade]})
              </h2>
              {gradeMeta && (
                <span className="text-xs font-medium text-[#5C4B3E]">{gradeMeta.shortTag}</span>
              )}
            </div>
            <p className="text-sm sm:text-[15px] text-[#2C2119] leading-relaxed">
              {product.gradeDetail}
            </p>
          </div>

          {/* Specs Table */}
          <dl className="divide-y divide-[#E4DDD4] border-y border-[#E4DDD4] text-sm">
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-medium text-[#5C4B3E] shrink-0">중량 범위</dt>
              <dd className="text-right font-semibold text-[#2C2119] tabular-nums">
                {product.weightRange}
              </dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-medium text-[#5C4B3E] shrink-0">수확일</dt>
              <dd className="text-right font-medium text-[#2C2119] tabular-nums">
                {product.harvestDate}
              </dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-medium text-[#5C4B3E] shrink-0">산지</dt>
              <dd className="text-right font-medium text-[#2C2119]">{product.subRegion}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-medium text-[#5C4B3E] shrink-0">보관 방법</dt>
              <dd className="text-right text-[#2C2119]">{product.storageTip}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-medium text-[#5C4B3E] shrink-0">남은 수량</dt>
              <dd className="text-right font-semibold text-[#365314] tabular-nums">
                {product.stock}상자 남음
              </dd>
            </div>
          </dl>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#2C2119]">수량 선택</span>
              <div className="inline-flex items-center border border-[#E4DDD4] rounded-xl bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={decreaseQty}
                  disabled={quantity <= 1}
                  aria-label="수량 1개 줄이기"
                  className="w-11 h-11 flex items-center justify-center text-[#2C2119] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="w-11 text-center font-bold text-[#2C2119] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQty}
                  disabled={quantity >= product.stock}
                  aria-label="수량 1개 늘리기"
                  className="w-11 h-11 flex items-center justify-center text-[#2C2119] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-[#5C4B3E]">합계 금액</span>
              <span className="text-xl font-bold text-[#2C2119] tabular-nums">
                {totalPrice.toLocaleString('ko-KR')}원
              </span>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onAddToCart(product, quantity)}
                className="min-h-[48px] rounded-xl border border-[#2C2119] bg-white text-[#2C2119] text-base font-semibold hover:bg-[#F3EFE9] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                장바구니 담기
              </button>
              <button
                type="button"
                onClick={() => onBuyNow(product, quantity)}
                className="min-h-[48px] rounded-xl bg-[#C84B11] text-white text-base font-semibold hover:bg-[#A83B0B] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                바로 주문하기
              </button>
            </div>
          </div>

          {/* Guarantee Notice */}
          <div className="flex items-start gap-2.5 pt-2 text-xs sm:text-sm text-[#5C4B3E]">
            <ShieldCheck className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
            <span>설명과 다르거나 상해서 도착하면 사진 한 장으로 바로 보상해 드려요.</span>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buy Bar (replaces bottom nav on PDP so total sticky height <= 14%) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[62px] bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E4DDD4] px-4 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onAddToCart(product, quantity)}
          className="flex-1 min-h-[44px] rounded-xl border border-[#2C2119] bg-white text-[#2C2119] text-sm font-semibold active:scale-[0.98] transition-transform cursor-pointer whitespace-nowrap"
        >
          장바구니 담기
        </button>
        <button
          type="button"
          onClick={() => onBuyNow(product, quantity)}
          className="flex-1 min-h-[44px] rounded-xl bg-[#C84B11] text-white text-sm font-semibold active:scale-[0.98] transition-transform cursor-pointer whitespace-nowrap tabular-nums"
        >
          {totalPrice.toLocaleString('ko-KR')}원 주문하기
        </button>
      </div>
    </div>
  );
}
