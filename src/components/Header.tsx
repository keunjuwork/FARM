import { ShoppingBag } from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  cartCount: number;
  onNavigate: (view: AppView) => void;
  onOpenGradeGuide: () => void;
  onOpenCart: () => void;
}

export function Header({
  currentView,
  cartCount,
  onNavigate,
  onOpenGradeGuide,
  onOpenCart,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E4DDD4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 md:h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-display text-xl md:text-2xl font-bold tracking-tight text-[#2C2119] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C84B11]"
        >
          덤밭
        </button>

        {/* Zone 2: 5 concise single-line desktop nav links */}
        <nav
          aria-label="주 메뉴"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-[15px] font-medium text-[#5C4B3E]"
        >
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              currentView === 'home'
                ? 'text-[#2C2119] font-semibold border-[#C84B11]'
                : 'border-transparent hover:text-[#2C2119]'
            }`}
          >
            홈
          </button>
          <button
            type="button"
            onClick={() => onNavigate('nearby')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              currentView === 'nearby' || currentView === 'farm'
                ? 'text-[#2C2119] font-semibold border-[#4D7C0F]'
                : 'border-transparent hover:text-[#2C2119]'
            }`}
          >
            가까운 덤밭
          </button>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              currentView === 'catalog' || currentView === 'detail'
                ? 'text-[#2C2119] font-semibold border-[#C84B11]'
                : 'border-transparent hover:text-[#2C2119]'
            }`}
          >
            오늘의 덤밭
          </button>
          <button
            type="button"
            onClick={onOpenGradeGuide}
            className="py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 border-transparent hover:text-[#2C2119]"
          >
            등급 안내
          </button>
          <button
            type="button"
            onClick={() => onNavigate('farmer')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              currentView === 'farmer'
                ? 'text-[#2C2119] font-semibold border-[#4D7C0F]'
                : 'border-transparent hover:text-[#2C2119]'
            }`}
          >
            농가 등록
          </button>
        </nav>

        {/* Zone 3: Single Primary Header Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`장바구니 열기, 현재 ${cartCount}개 담김`}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] md:min-h-[44px] rounded-lg bg-[#2C2119] text-[#FAF8F5] text-sm font-medium hover:bg-[#3F3126] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C84B11]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>장바구니</span>
            <span className="tabular-nums font-semibold text-[#CBE98E]">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
