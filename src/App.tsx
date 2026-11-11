import { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { CartDrawer } from './components/CartDrawer';
import { CatalogView } from './components/CatalogView';
import { CheckoutView } from './components/CheckoutView';
import { FarmDetailView } from './components/FarmDetailView';
import { FarmerRegisterView } from './components/FarmerRegisterView';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NearbyFarmsView } from './components/NearbyFarmsView';
import { ProductDetailView } from './components/ProductDetailView';
import { BASE_RESCUED_KG, INITIAL_FARMS, INITIAL_PRODUCTS } from './data/mockData';
import { AppView, CartItem, Farm, GradeType, LatLngLiteral, OrderReceipt, Product } from './types';
import { getGoogleMapsApiKey } from './utils/geo';
import { withEulReul } from './utils/korean';

const STORAGE_KEYS = {
  farmerProducts: 'dumbat_farmer_products_v1',
  farmerFarms: 'dumbat_farmer_farms_v1',
  rescuedKg: 'dumbat_rescued_kg_v1',
};

function loadInitialProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.farmerProducts);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return INITIAL_PRODUCTS;
    const valid = parsed.map((p) => ({
      ...p,
      farmId: p.farmId || INITIAL_FARMS[0].id,
    }));
    return [...valid, ...INITIAL_PRODUCTS];
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function loadInitialFarms(): Farm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.farmerFarms);
    if (!raw) return INITIAL_FARMS;
    const parsed = JSON.parse(raw) as Farm[];
    if (!Array.isArray(parsed)) return INITIAL_FARMS;
    return [...parsed, ...INITIAL_FARMS];
  } catch {
    return INITIAL_FARMS;
  }
}

function loadRescuedKg(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.rescuedKg);
    if (!raw) return BASE_RESCUED_KG;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= BASE_RESCUED_KG ? parsed : BASE_RESCUED_KG;
  } catch {
    return BASE_RESCUED_KG;
  }
}

export default function App() {
  const mapsApiKey = getGoogleMapsApiKey();

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [products, setProducts] = useState<Product[]>(loadInitialProducts);
  const [farms, setFarms] = useState<Farm[]>(loadInitialFarms);
  const [rescuedKg, setRescuedKg] = useState<number>(loadRescuedKg);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<GradeType | 'all'>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>(INITIAL_PRODUCTS[0].id);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(INITIAL_FARMS[0].id);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [userLocationLabel, setUserLocationLabel] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState<boolean>(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0] || INITIAL_PRODUCTS[0];
  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0] || INITIAL_FARMS[0];
  const selectedFarmProducts = products.filter((p) => p.farmId === selectedFarm.id);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setMapsQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGradeGuide = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById('grade-guide')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById('grade-guide')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoCatalog = (grade?: GradeType) => {
    setSelectedGradeFilter(grade ?? 'all');
    navigateTo('catalog');
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    navigateTo('detail');
  };

  const handleOpenFarmStore = (farmId: string) => {
    setSelectedFarmId(farmId);
    navigateTo('farm');
  };

  const handleSetUserLocation = (loc: LatLngLiteral | null, label: string) => {
    setUserLocation(loc);
    setUserLocationLabel(label);
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    setToastMessage(`${withEulReul(product.name)} 장바구니에 담았어요.`);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  const handleUpdateCartQty = (productId: string, nextQty: number) => {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock, nextQty) }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCompleteOrder = (receipt: OrderReceipt) => {
    const nextRescuedKg = rescuedKg + receipt.totalKg;
    setRescuedKg(nextRescuedKg);
    try {
      localStorage.setItem(STORAGE_KEYS.rescuedKg, String(nextRescuedKg));
    } catch {
      // Ignore storage quota errors
    }

    setProducts((prev) =>
      prev.map((prod) => {
        const bought = receipt.items.find((i) => i.product.id === prod.id);
        if (!bought) return prod;
        return { ...prod, stock: Math.max(1, prod.stock - bought.quantity) };
      })
    );

    setCart([]);
  };

  const handleRegisterProduct = (newProduct: Product, newFarm: Farm) => {
    setFarms((prev) => {
      const updated = [newFarm, ...prev];
      const userAddedOnly = updated.filter((f) => f.isUserRegistered);
      try {
        localStorage.setItem(STORAGE_KEYS.farmerFarms, JSON.stringify(userAddedOnly));
      } catch {
        // Ignore storage quota errors
      }
      return updated;
    });

    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      const userAddedOnly = updated.filter((p) => p.isUserRegistered);
      try {
        localStorage.setItem(STORAGE_KEYS.farmerProducts, JSON.stringify(userAddedOnly));
      } catch {
        // Ignore storage quota errors
      }
      return updated;
    });
  };

  const appShell = (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2119]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header
        currentView={currentView}
        cartCount={totalCartCount}
        onNavigate={navigateTo}
        onOpenGradeGuide={handleOpenGradeGuide}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            rescuedKg={rescuedKg}
            onGoCatalog={handleGoCatalog}
            onGoNearby={() => navigateTo('nearby')}
            onGoFarmer={() => navigateTo('farmer')}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(prod) => handleAddToCart(prod, 1)}
          />
        )}

        {currentView === 'nearby' && (
          <NearbyFarmsView
            farms={farms}
            products={products}
            userLocation={userLocation}
            userLocationLabel={userLocationLabel}
            onSetUserLocation={handleSetUserLocation}
            onOpenFarmStore={handleOpenFarmStore}
          />
        )}

        {currentView === 'farm' && (
          <FarmDetailView
            key={selectedFarm.id}
            farm={selectedFarm}
            farmProducts={selectedFarmProducts}
            userLocation={userLocation}
            userLocationLabel={userLocationLabel}
            onBackToNearby={() => navigateTo('nearby')}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            key={selectedGradeFilter}
            products={products}
            initialGrade={selectedGradeFilter}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(prod) => handleAddToCart(prod, 1)}
          />
        )}

        {currentView === 'detail' && (
          <ProductDetailView
            product={selectedProduct}
            onBack={() =>
              handleGoCatalog(selectedGradeFilter === 'all' ? undefined : selectedGradeFilter)
            }
            onOpenFarmStore={handleOpenFarmStore}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {currentView === 'farmer' && (
          <FarmerRegisterView
            onRegisterProduct={handleRegisterProduct}
            onViewRegisteredProduct={handleSelectProduct}
            onViewRegisteredFarm={handleOpenFarmStore}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            items={cart}
            onBack={() => handleGoCatalog()}
            onCompleteOrder={handleCompleteOrder}
            onGoHome={() => navigateTo('home')}
            onGoCatalog={() => handleGoCatalog()}
          />
        )}
      </main>

      <Footer onNavigate={navigateTo} onOpenGradeGuide={handleOpenGradeGuide} />

      <MobileBottomNav
        currentView={currentView}
        cartCount={totalCartCount}
        onNavigate={navigateTo}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          navigateTo('checkout');
        }}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-2rem)] bg-[#2C2119] text-[#FAF8F5] px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3"
        >
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage('');
              setIsCartOpen(true);
            }}
            className="text-xs font-bold text-[#CBE98E] underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
          >
            장바구니 보기
          </button>
        </div>
      )}
    </div>
  );

  if (!mapsApiKey) {
    return appShell;
  }

  return (
    <APIProvider
      apiKey={mapsApiKey}
      language="ko"
      region="KR"
      libraries={['places', 'marker', 'routes']}
    >
      {appShell}
    </APIProvider>
  );
}
