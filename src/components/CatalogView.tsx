import { useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { CATEGORIES, GRADE_INFO, GRADE_LABEL_MAP, REGIONS } from '../data/mockData';
import { CategoryType, GradeType, PriceFilterType, Product, RegionType } from '../types';
import { SafeImage } from './SafeImage';

interface CatalogViewProps {
  products: Product[];
  initialGrade: GradeType | 'all';
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export function CatalogView({
  products,
  initialGrade,
  onSelectProduct,
  onAddToCart,
}: CatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<GradeType | 'all'>(initialGrade);
  const [selectedRegion, setSelectedRegion] = useState<RegionType | 'all'>('all');
  const [selectedPrice, setSelectedPrice] = useState<PriceFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedGrade !== 'all' && item.grade !== selectedGrade) return false;
      if (selectedRegion !== 'all' && item.region !== selectedRegion) return false;
      if (selectedPrice === 'under15' && item.price >= 15000) return false;
      if (selectedPrice === '15to25' && (item.price < 15000 || item.price > 25000)) return false;
      if (selectedPrice === 'over25' && item.price <= 25000) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${item.name} ${item.subRegion} ${item.gradeReason} ${item.farmerName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedGrade, selectedRegion, selectedPrice, searchQuery]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedGrade !== 'all' ||
    selectedRegion !== 'all' ||
    selectedPrice !== 'all' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedGrade('all');
    setSelectedRegion('all');
    setSelectedPrice('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pt-10 md:pb-16">
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2119] text-balance mb-2">
          오늘의 덤밭
        </h1>
        <p className="text-[15px] sm:text-base text-[#5C4B3E]">
          농가가 직접 찍은 실물 사진과 솔직한 등급 설명을 보고 고르세요.
        </p>
      </div>

      {/* Filter Panel */}
      <section
        aria-label="농산물 검색 및 필터"
        className="bg-white border border-[#E4DDD4] rounded-2xl p-4 sm:p-6 mb-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-[#7A6859] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="품목, 산지, 농부 이름으로 찾아보세요"
              aria-label="농산물 검색"
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] text-sm sm:text-[15px] text-[#2C2119] placeholder:text-[#7A6859] focus:outline-none focus:border-[#C84B11]"
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F3EFE9] text-sm font-medium text-[#2C2119] hover:bg-[#E4DDD4] cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>필터 초기화</span>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E4DDD4]">
          <div>
            <span className="block text-xs font-semibold text-[#5C4B3E] mb-2">품목</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#2C2119] text-white'
                    : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                }`}
              >
                전체
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-[#2C2119] text-white'
                      : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Filter */}
          <div>
            <span className="block text-xs font-semibold text-[#5C4B3E] mb-2">못난이 등급</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedGrade('all')}
                className={`px-3.5 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedGrade === 'all'
                    ? 'bg-[#2C2119] text-white'
                    : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                }`}
              >
                전체 등급
              </button>
              {GRADE_INFO.map((grade) => (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setSelectedGrade(grade.id)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedGrade === grade.id
                      ? 'bg-[#4D7C0F] text-white'
                      : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div>
            <span className="block text-xs font-semibold text-[#5C4B3E] mb-2">지역</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedRegion('all')}
                className={`px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedRegion === 'all'
                    ? 'bg-[#2C2119] text-white'
                    : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                }`}
              >
                전국
              </button>
              {REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedRegion === region
                      ? 'bg-[#2C2119] text-white'
                      : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <span className="block text-xs font-semibold text-[#5C4B3E] mb-2">가격대</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: '전체 가격' },
                { id: 'under15', label: '1만 5천 원 미만' },
                { id: '15to25', label: '1만 5천~2만 5천 원' },
                { id: 'over25', label: '2만 5천 원 초과' },
              ].map((priceOption) => (
                <button
                  key={priceOption.id}
                  type="button"
                  onClick={() => setSelectedPrice(priceOption.id as PriceFilterType)}
                  className={`px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedPrice === priceOption.id
                      ? 'bg-[#C84B11] text-white'
                      : 'bg-[#FAF8F5] border border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                  }`}
                >
                  {priceOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-medium text-[#5C4B3E] tabular-nums">
          총 <strong className="text-[#2C2119]">{filteredProducts.length}</strong>건의 농산물이 있어요
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#E4DDD4] rounded-2xl p-10 text-center">
          <p className="font-display text-xl font-bold text-[#2C2119] mb-2">
            고른 조건에 맞는 농산물이 아직 없어요
          </p>
          <p className="text-sm text-[#5C4B3E] mb-6">
            다른 지역이나 등급으로 넓혀서 다시 살펴보시겠어요?
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center px-5 py-3 min-h-[44px] rounded-xl bg-[#C84B11] text-white text-sm font-semibold hover:bg-[#A83B0B] cursor-pointer whitespace-nowrap"
          >
            필터 모두 해제하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
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
                      {product.isUserRegistered && (
                        <>
                          {' '}
                          <span aria-hidden="true">·</span>{' '}
                          <span className="text-[#C84B11] font-semibold">새로 등록됨</span>
                        </>
                      )}
                    </p>
                    <h2 className="text-lg font-bold text-[#2C2119] leading-snug mb-1.5">
                      {product.name}
                    </h2>
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
                      {product.weightRange} <span aria-hidden="true">·</span> {product.harvestDate} 수확
                    </p>
                  </div>
                </button>

                <div className="px-5 pb-5 pt-2 mt-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="flex-1 min-h-[44px] rounded-xl bg-[#F3EFE9] text-[#2C2119] text-sm font-semibold hover:bg-[#E4DDD4] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    장바구니 담기
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product.id)}
                    className="px-4 min-h-[44px] rounded-xl border border-[#E4DDD4] text-[#5C4B3E] text-sm font-medium hover:text-[#2C2119] hover:border-[#2C2119] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    상세 보기
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
