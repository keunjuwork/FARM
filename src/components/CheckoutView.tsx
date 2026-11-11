import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, Smartphone } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../data/mockData';
import { CartItem, OrderReceipt } from '../types';
import { SafeImage } from './SafeImage';

interface CheckoutViewProps {
  items: CartItem[];
  onBack: () => void;
  onCompleteOrder: (receipt: OrderReceipt) => void;
  onGoHome: () => void;
  onGoCatalog: () => void;
}

export function CheckoutView({
  items,
  onBack,
  onCompleteOrder,
  onGoHome,
  onGoCatalog,
}: CheckoutViewProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('문 앞에 놓아 주세요');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'mobile'>('card');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee =
    items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const finalPrice = subtotal + shippingFee;
  const totalKg = items.reduce((sum, item) => sum + item.product.weightKg * item.quantity, 0);

  const fillSampleCustomer = () => {
    setCustomerName('김다정');
    setPhone('010-4829-1034');
    setAddress('서울특별시 마포구 연남로 123, 201호');
    setMemo('도착하면 문자 부탁드립니다');
    setErrorMessage('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('받는 분 이름, 연락처, 주소를 모두 적어 주세요.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    setTimeout(() => {
      const orderReceipt: OrderReceipt = {
        orderId: `DB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toLocaleString('ko-KR'),
        items: [...items],
        subtotal,
        shippingFee,
        finalPrice,
        totalKg,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        memo: memo.trim() || '없음',
        paymentMethod,
      };
      setIsProcessing(false);
      setReceipt(orderReceipt);
      onCompleteOrder(orderReceipt);
    }, 900);
  };

  if (receipt) {
    const paymentLabel =
      receipt.paymentMethod === 'card'
        ? '간편 카드 결제 (가상)'
        : receipt.paymentMethod === 'transfer'
        ? '계좌이체 (가상)'
        : '휴대폰 결제 (가상)';

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="bg-white border border-[#E4DDD4] rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ECF5D8] flex items-center justify-center text-[#365314]">
              <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#4D7C0F]">
                가상 결제가 완료되었어요 (실제 출금 없음)
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119] mt-1">
                주문이 접수되었어요
              </h1>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#ECF5D8] border border-[#C6DDA0] text-[#365314]">
            <p className="text-sm sm:text-base font-semibold tabular-nums">
              이번 주문으로 못난이 농산물 약 {receipt.totalKg}kg을 구했어요.
            </p>
          </div>

          <dl className="divide-y divide-[#E4DDD4] border-y border-[#E4DDD4] text-sm">
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-[#5C4B3E]">주문 번호</dt>
              <dd className="font-semibold text-[#2C2119] tabular-nums">{receipt.orderId}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-[#5C4B3E]">받는 분</dt>
              <dd className="font-medium text-[#2C2119]">
                {receipt.customerName} ({receipt.phone})
              </dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-[#5C4B3E] shrink-0">배송지</dt>
              <dd className="text-right font-medium text-[#2C2119]">{receipt.address}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-[#5C4B3E]">결제 수단</dt>
              <dd className="font-medium text-[#2C2119]">{paymentLabel}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-[#5C4B3E]">결제 금액</dt>
              <dd className="font-bold text-[#C84B11] tabular-nums">
                {receipt.finalPrice.toLocaleString('ko-KR')}원
              </dd>
            </div>
          </dl>

          <div>
            <h2 className="text-sm font-bold text-[#2C2119] mb-2.5">주문한 농산물</h2>
            <ul className="space-y-2 text-sm text-[#5C4B3E]">
              {receipt.items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between gap-4">
                  <span>
                    {product.name} × {quantity}상자
                  </span>
                  <span className="font-medium text-[#2C2119] tabular-nums">
                    {(product.price * quantity).toLocaleString('ko-KR')}원
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onGoCatalog}
              className="flex-1 min-h-[48px] rounded-xl bg-[#C84B11] text-white font-semibold hover:bg-[#A83B0B] cursor-pointer whitespace-nowrap"
            >
              오늘의 덤밭 더 보기
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="flex-1 min-h-[48px] rounded-xl border border-[#2C2119] bg-white text-[#2C2119] font-semibold hover:bg-[#F3EFE9] cursor-pointer whitespace-nowrap"
            >
              첫 화면으로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-20 md:py-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#5C4B3E] hover:text-[#2C2119] mb-5 cursor-pointer whitespace-nowrap"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>상품 더 둘러보기</span>
      </button>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C2119]">
            주문서 작성
          </h1>
          <p className="text-sm text-[#5C4B3E] mt-1">
            시제품용 가상 결제 화면이에요. 실제 결제는 이루어지지 않아요.
          </p>
        </div>
        <button
          type="button"
          onClick={fillSampleCustomer}
          className="self-start sm:self-auto px-3.5 py-2 min-h-[40px] rounded-lg bg-[#F3EFE9] border border-[#E4DDD4] text-xs sm:text-sm font-semibold text-[#2C2119] hover:bg-[#E4DDD4] cursor-pointer whitespace-nowrap"
        >
          예시 배송 정보 채우기
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[#E4DDD4] rounded-2xl p-10 text-center space-y-4">
          <p className="font-display text-xl font-bold text-[#2C2119]">주문할 상품이 없어요</p>
          <button
            type="button"
            onClick={onGoCatalog}
            className="px-6 py-3 min-h-[44px] rounded-xl bg-[#C84B11] text-white font-semibold cursor-pointer whitespace-nowrap"
          >
            오늘의 덤밭 보러가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white border border-[#E4DDD4] rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#2C2119]">받는 분 정보</h2>

              <div>
                <label htmlFor="order-name" className="block text-sm font-semibold text-[#2C2119] mb-1.5">
                  받는 분 이름
                </label>
                <input
                  id="order-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] text-base text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
                />
              </div>

              <div>
                <label htmlFor="order-phone" className="block text-sm font-semibold text-[#2C2119] mb-1.5">
                  연락처
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 010-1234-5678"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] text-base text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
                />
              </div>

              <div>
                <label htmlFor="order-address" className="block text-sm font-semibold text-[#2C2119] mb-1.5">
                  받을 주소
                </label>
                <input
                  id="order-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="도로명 주소와 동·호수를 적어 주세요"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] text-base text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
                />
              </div>

              <div>
                <label htmlFor="order-memo" className="block text-sm font-semibold text-[#2C2119] mb-1.5">
                  배송 요청사항
                </label>
                <input
                  id="order-memo"
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD4] text-base text-[#2C2119] focus:outline-none focus:border-[#C84B11]"
                />
              </div>
            </section>

            {/* Fake Payment Method */}
            <section className="bg-white border border-[#E4DDD4] rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2C2119]">
                  결제 수단 (가짜 결제 체험)
                </h2>
                <p className="text-xs sm:text-sm text-[#5C4B3E] mt-1">
                  시제품 확인용 가상 화면이므로 실제 카드 승인이나 이체가 일어나지 않아요.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'card', label: '신용·체크카드', icon: CreditCard },
                  { id: 'transfer', label: '계좌이체', icon: Landmark },
                  { id: 'mobile', label: '휴대폰 결제', icon: Smartphone },
                ].map((option) => {
                  const Icon = option.icon;
                  const active = paymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id as 'card' | 'transfer' | 'mobile')}
                      className={`min-h-[52px] px-4 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#2C2119] border-[#2C2119] text-white'
                          : 'bg-[#FAF8F5] border-[#E4DDD4] text-[#5C4B3E] hover:text-[#2C2119]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Summary */}
          <aside className="lg:col-span-5 bg-white border border-[#E4DDD4] rounded-2xl p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold text-[#2C2119]">주문 상품 확인</h2>

            <ul className="divide-y divide-[#E4DDD4]">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F3EFE9] shrink-0">
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2C2119] truncate">{product.name}</p>
                    <p className="text-xs text-[#5C4B3E] tabular-nums">
                      {product.weightRange} · {quantity}상자
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#2C2119] tabular-nums shrink-0">
                    {(product.price * quantity).toLocaleString('ko-KR')}원
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 pt-3 border-t border-[#E4DDD4] text-sm">
              <div className="flex justify-between text-[#5C4B3E]">
                <span>구하는 농산물 무게</span>
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
              <div className="flex justify-between pt-3 border-t border-[#E4DDD4] text-lg font-bold text-[#2C2119]">
                <span>총 결제 금액</span>
                <span className="text-[#C84B11] tabular-nums">
                  {finalPrice.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm font-medium text-[#C84B11]">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full min-h-[52px] rounded-xl bg-[#C84B11] text-white text-base font-semibold hover:bg-[#A83B0B] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap tabular-nums"
            >
              {isProcessing
                ? '가상 결제 확인하는 중...'
                : `${finalPrice.toLocaleString('ko-KR')}원 가상 결제하기`}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}
