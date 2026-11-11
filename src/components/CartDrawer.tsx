import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../data/mockData';
import { CartItem } from '../types';
import { SafeImage } from './SafeImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, nextQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee =
    items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const totalPrice = subtotal + shippingFee;
  const totalKg = items.reduce((sum, item) => sum + item.product.weightKg * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="장바구니">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="장바구니 닫기"
        onClick={onClose}
        className="fixed inset-0 bg-[#1E1610]/45 backdrop-blur-xs cursor-pointer"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-[#FAF8F5] h-full flex flex-col border-l border-[#E4DDD4] shadow-xl">
        <div className="px-5 py-4 border-b border-[#E4DDD4] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2C2119]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-[#2C2119]">장바구니</h2>
            <span className="text-sm font-semibold text-[#5C4B3E] tabular-nums">
              ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[#5C4B3E] hover:bg-[#F3EFE9] hover:text-[#2C2119] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-display text-xl font-bold text-[#2C2119]">장바구니가 비어 있어요</p>
              <p className="text-sm text-[#5C4B3E]">
                오늘의 덤밭에서 제철 못난이 농산물을 골라 담아 보세요.
              </p>
            </div>
          ) : (
            <>
              {/* Free Shipping Status */}
              <div className="p-3.5 rounded-xl bg-[#ECF5D8] border border-[#C6DDA0] text-sm text-[#365314]">
                {remainingForFreeShipping === 0 ? (
                  <p className="font-semibold">무료 배송 조건을 채웠어요.</p>
                ) : (
                  <p className="tabular-nums">
                    <strong>{remainingForFreeShipping.toLocaleString('ko-KR')}원</strong>만 더
                    담으면 무료 배송이에요.
                  </p>
                )}
              </div>

              <ul className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="bg-white border border-[#E4DDD4] rounded-2xl p-4 flex gap-3.5"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F3EFE9] shrink-0">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-[#5C4B3E]">{product.subRegion}</p>
                          <h3 className="text-sm font-bold text-[#2C2119] leading-snug">
                            {product.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label={`${product.name} 삭제`}
                          className="w-9 h-9 flex items-center justify-center text-[#7A6859] hover:text-[#C84B11] shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs text-[#7A6859] mt-0.5 tabular-nums">
                        {product.weightRange}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-[#E4DDD4] rounded-lg bg-[#FAF8F5]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, quantity - 1)}
                            aria-label="수량 1개 빼기"
                            className="w-9 h-9 flex items-center justify-center text-[#2C2119] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, quantity + 1)}
                            disabled={quantity >= product.stock}
                            aria-label="수량 1개 더하기"
                            className="w-9 h-9 flex items-center justify-center text-[#2C2119] disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-[#2C2119] tabular-nums">
                          {(product.price * quantity).toLocaleString('ko-KR')}원
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#E4DDD4] bg-white space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5C4B3E]">
                <span>이번에 구하는 농산물 무게</span>
                <span className="font-semibold text-[#365314] tabular-nums">약 {totalKg}kg</span>
              </div>
              <div className="flex justify-between text-[#5C4B3E]">
                <span>상품 금액</span>
                <span className="tabular-nums">{subtotal.toLocaleString('ko-KR')}원</span>
              </div>
              <div className="flex justify-between text-[#5C4B3E]">
                <span>배송비</span>
                <span className="tabular-nums">
                  {shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString('ko-KR')}원`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E4DDD4] text-base font-bold text-[#2C2119]">
                <span>총 결제 예상 금액</span>
                <span className="text-[#C84B11] tabular-nums">
                  {totalPrice.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full min-h-[48px] rounded-xl bg-[#C84B11] text-white text-base font-semibold hover:bg-[#A83B0B] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              주문서 작성하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
