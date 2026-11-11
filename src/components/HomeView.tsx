import { ArrowRight } from 'lucide-react';
import { GRADE_INFO, GRADE_LABEL_MAP, HERO_IMAGE, WEEKLY_STORY } from '../data/mockData';
import { GradeType, Product } from '../types';
import { SafeImage } from './SafeImage';

interface HomeViewProps {
  products: Product[];
  rescuedKg: number;
  onGoCatalog: (grade?: GradeType) => void;
  onGoNearby: () => void;
  onGoFarmer: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export function HomeView({
  products,
  rescuedKg,
  onGoCatalog,
  onGoNearby,
  onGoFarmer,
  onSelectProduct,
  onAddToCart,
}: HomeViewProps) {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="pb-16 md:pb-12">
      {/* Section 1: Storefront Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8 md:pt-12 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm sm:text-base font-medium text-[#4D7C0F] mb-3">
              울퉁불퉁해도 맛은 꽉 찼어요
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#2C2119] leading-[1.2] text-balance mb-5">
              흠은 덤, 맛은 본전.
            </h1>
            <p className="text-base sm:text-lg text-[#5C4B3E] leading-relaxed max-w-xl mb-8">
              우박과 바람에 등급 밖으로 밀린 농산물이에요. 모양만 다르고 맛은 그대로, 가격은 훨씬
              가볍게 드려요.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => onGoCatalog()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#C84B11] text-white text-base font-semibold hover:bg-[#A83B0B] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C84B11]"
              >
                <span>오늘의 덤밭 보러가기</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onGoFarmer}
                className="inline-flex items-center justify-center px-6 py-3.5 min-h-[48px] rounded-xl bg-white border border-[#2C2119] text-[#2C2119] text-base font-semibold hover:bg-[#F3EFE9] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C2119]"
              >
                농가 판매 등록하기
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={onGoNearby}
                className="inline-flex items-center gap-1.5 min-h-[40px] text-sm font-semibold text-[#365314] hover:text-[#4D7C0F] underline underline-offset-4 cursor-pointer whitespace-nowrap"
              >
                <span>내 위치 기준 가까운 덤밭 찾아보기</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full rounded-2xl overflow-hidden border border-[#E4DDD4] bg-[#F3EFE9]">
              <SafeImage
                src={HERO_IMAGE}
                alt="나무 상자에 담긴 못난이 사과, 감귤, 고구마 농가 직송 수확물"
                className="w-full aspect-[4/3] lg:h-full object-cover"
                fallbackLabel="덤밭 농가 직송 수확물"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip + Rescued KG Counter */}
      <section aria-label="덤밭 신뢰 약속 및 누적 수확 구출량" className="border-y border-[#E4DDD4] bg-[#F3EFE9]/75">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          <p className="text-sm sm:text-[15px] font-medium text-[#2C2119]">
            실물 사진만 올려요 <span className="mx-1.5 text-[#7A6859]" aria-hidden="true">·</span> 등급을 솔직하게 적어요{' '}
            <span className="mx-1.5 text-[#7A6859]" aria-hidden="true">·</span> 설명과 다르면 보상해요
          </p>

          <div className="inline-flex items-center gap-2.5 self-start md:self-auto px-3.5 py-2 rounded-lg bg-[#ECF5D8] border border-[#C6DDA0] text-[#365314]">
            <span className="text-sm font-medium">덤밭이 지금까지 구한 농산물</span>
            <strong className="text-base sm:text-lg font-bold tabular-nums whitespace-nowrap">
              {rescuedKg.toLocaleString('ko-KR')}kg
            </strong>
          </div>
        </div>
      </section>

      {/* Section 2: 4-Grade Guide */}
      <section id="grade-guide" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-2xl mb-8 md:mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] text-balance mb-2.5">
            얼마나 못났는지 솔직하게 보여드려요
          </h2>
          <p className="text-[15px] sm:text-base text-[#5C4B3E]">
            등급 이름을 먼저 확인하고, 쓰임새에 맞는 농산물을 골라 보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {GRADE_INFO.map((grade) => (
            <article
              key={grade.id}
              className="flex flex-col justify-between bg-white border border-[#E4DDD4] rounded-2xl p-6"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-[#7A6859] tabular-nums">
                    {grade.index} / {grade.shortTag}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#2C2119] mb-2.5">
                  {grade.label}
                </h3>
                <p className="text-sm text-[#5C4B3E] leading-relaxed mb-5">{grade.summary}</p>
              </div>

              <div className="pt-4 border-t border-[#E4DDD4] space-y-2.5">
                <div className="text-xs text-[#5C4B3E]">
                  <span className="font-semibold text-[#2C2119]">대표 예시: </span>
                  {grade.examples}
                </div>
                <div className="text-xs font-medium text-[#365314]">{grade.priceNote}</div>
                <button
                  type="button"
                  onClick={() => onGoCatalog(grade.id)}
                  className="inline-flex items-center gap-1.5 pt-1 min-h-[40px] text-sm font-semibold text-[#C84B11] hover:text-[#A83B0B] cursor-pointer whitespace-nowrap"
                >
                  <span>이 등급 상품 보기</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 3: Today's Produce Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] text-balance">
              오늘 농가가 막 올린 덤밭
            </h2>
            <p className="text-[15px] text-[#5C4B3E] mt-1">
              선별기 밖으로 밀렸지만 지금 막 수확한 제철 농산물이에요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGoCatalog()}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm sm:text-base font-semibold text-[#2C2119] hover:text-[#C84B11] self-start sm:self-auto whitespace-nowrap cursor-pointer"
          >
            <span>전체 상품 보러가기</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => {
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
                      {product.subRegion} <span aria-hidden="true">·</span>{' '}
                      <span className="text-[#365314] font-semibold">
                        {GRADE_LABEL_MAP[product.grade]}
                      </span>
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
                    <p className="text-xs text-[#7A6859] mt-1 tabular-nums">{product.weightRange}</p>
                  </div>
                </button>

                <div className="px-5 pb-5 pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="w-full min-h-[44px] rounded-xl bg-[#F3EFE9] text-[#2C2119] text-sm font-semibold hover:bg-[#E4DDD4] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    장바구니 담기
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section 4: Weekly Farm Story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#E4DDD4] rounded-2xl overflow-hidden items-stretch">
          <div className="lg:col-span-5 bg-[#F3EFE9]">
            <SafeImage
              src={WEEKLY_STORY.image}
              alt="경북 청송 사과밭에서 사과 상자를 들고 웃고 있는 김영수 농부님"
              className="w-full aspect-[4/3] lg:h-full object-cover"
              fallbackLabel="이번 주 사연 농가"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold text-[#4D7C0F] mb-2">
              {WEEKLY_STORY.subtitle}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] leading-snug text-balance mb-5">
              {WEEKLY_STORY.title}
            </h2>
            <div className="space-y-3 text-[15px] sm:text-base text-[#5C4B3E] leading-relaxed mb-7">
              {WEEKLY_STORY.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div>
              <button
                type="button"
                onClick={() => onSelectProduct(WEEKLY_STORY.targetProductId)}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#2C2119] text-[#FAF8F5] text-sm sm:text-base font-semibold hover:bg-[#3F3126] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>청송 우박 사과 자세히 보기</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
