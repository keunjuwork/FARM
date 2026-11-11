export type GradeType = 'appearance' | 'size' | 'scar' | 'processing';

export type CategoryType = '과일' | '채소' | '구황작물';

export type RegionType = '경기' | '강원' | '충북' | '충남' | '전남' | '경북' | '제주';

export type PriceFilterType = 'all' | 'under15' | '15to25' | 'over25';

export type AppView = 'home' | 'nearby' | 'farm' | 'catalog' | 'detail' | 'farmer' | 'checkout';

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface GradeInfo {
  id: GradeType;
  index: string;
  label: string;
  shortTag: string;
  summary: string;
  examples: string;
  bestFor: string;
  priceNote: string;
}

export interface Farm {
  id: string;
  name: string;
  farmerName: string;
  region: RegionType;
  subRegion: string;
  shortAddress: string;
  location: LatLngLiteral;
  bio: string;
  quote: string;
  pickupAvailable: boolean;
  deliveryNote: string;
  coverImage: string;
  isUserRegistered?: boolean;
}

export interface Product {
  id: string;
  farmId: string;
  name: string;
  category: CategoryType;
  grade: GradeType;
  gradeReason: string;
  gradeDetail: string;
  region: RegionType;
  subRegion: string;
  price: number;
  marketPrice: number;
  weightKg: number;
  weightRange: string;
  harvestDate: string;
  storageTip: string;
  stock: number;
  image: string;
  farmerName: string;
  farmName: string;
  farmerBio: string;
  farmerQuote: string;
  isUserRegistered?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderReceipt {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  finalPrice: number;
  totalKg: number;
  customerName: string;
  phone: string;
  address: string;
  memo: string;
  paymentMethod: 'card' | 'transfer' | 'mobile';
}
