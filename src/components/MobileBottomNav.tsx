import { Home, MapPin, ShoppingBag, Sprout, Store } from 'lucide-react';
import { AppView } from '../types';

interface MobileBottomNavProps {
  currentView: AppView;
  cartCount: number;
  onNavigate: (view: AppView) => void;
  onOpenCart: () => void;
}

export function MobileBottomNav({
  currentView,
  cartCount,
  onNavigate,
  onOpenCart,
}: MobileBottomNavProps) {
  if (currentView === 'detail' || currentView === 'farmer' || currentView === 'checkout') {
    return null;
  }

  return (
    <nav
      aria-label="모바일 하단 메뉴"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[52px] bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E4DDD4]"
    >
      <div className="grid grid-cols-5 h-full">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-medium cursor-pointer ${
            currentView === 'home' ? 'text-[#C84B11] font-semibold' : 'text-[#5C4B3E]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span className="whitespace-nowrap">홈</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('nearby')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-medium cursor-pointer ${
            currentView === 'nearby' || currentView === 'farm'
              ? 'text-[#4D7C0F] font-semibold'
              : 'text-[#5C4B3E]'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span className="whitespace-nowrap">내 주변</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-medium cursor-pointer ${
            currentView === 'catalog' ? 'text-[#C84B11] font-semibold' : 'text-[#5C4B3E]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span className="whitespace-nowrap">오늘의 덤밭</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('farmer')}
          className="flex flex-col items-center justify-center min-h-[44px] text-[10px] font-medium text-[#365314] cursor-pointer"
        >
          <Sprout className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span className="whitespace-nowrap">농가 등록</span>
        </button>

        <button
          type="button"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center min-h-[44px] text-[10px] font-medium text-[#5C4B3E] cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#C84B11] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </div>
          <span className="whitespace-nowrap">장바구니</span>
        </button>
      </div>
    </nav>
  );
}
