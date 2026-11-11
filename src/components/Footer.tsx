import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onOpenGradeGuide: () => void;
}

export function Footer({ onNavigate, onOpenGradeGuide }: FooterProps) {
  return (
    <footer className="border-t border-[#E4DDD4] bg-[#F3EFE9]/60 pb-20 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-lg font-bold text-[#2C2119]">덤밭</span>
            <span className="text-sm font-medium text-[#5C4B3E]">흠은 덤, 맛은 본전</span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6859]">
            모양 기준 밖으로 밀린 농산물을 농가와 소비자가 직접 나누는 직거래 장터 시제품이에요.
          </p>
        </div>

        <nav aria-label="하단 바로가기" className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#5C4B3E]">
          <button
            type="button"
            onClick={() => onNavigate('nearby')}
            className="hover:text-[#2C2119] cursor-pointer whitespace-nowrap"
          >
            가까운 덤밭
          </button>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="hover:text-[#2C2119] cursor-pointer whitespace-nowrap"
          >
            오늘의 덤밭
          </button>
          <button
            type="button"
            onClick={onOpenGradeGuide}
            className="hover:text-[#2C2119] cursor-pointer whitespace-nowrap"
          >
            등급 안내
          </button>
          <button
            type="button"
            onClick={() => onNavigate('farmer')}
            className="hover:text-[#2C2119] cursor-pointer whitespace-nowrap"
          >
            농가 판매 등록하기
          </button>
        </nav>
      </div>
    </footer>
  );
}
