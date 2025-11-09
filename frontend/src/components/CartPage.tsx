import { motion } from 'motion/react';
import CartItem from './CartItem';
import type { Product } from '../types/product';

interface CartPageProps {
  items: (Product & { cartQuantity: number })[];
  totalPrice: number;
  itemCount: number;
  onBack: () => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartPage({
  items,
  totalPrice,
  itemCount,
  onBack,
  onQuantityChange,
  onRemove,
}: CartPageProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2">장바구니</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button className="flex-1 py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
          일반구매
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-500">
          자주산상품
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-500">
          편한상품
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>장바구니가 비어있습니다</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Bottom Purchase Button */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">총 상품금액</span>
            <span className="text-lg font-bold text-gray-900">
              {totalPrice.toLocaleString()}원
            </span>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium transition-colors">
            총 {itemCount}개 상품 구매하기
          </button>
        </div>
      )}
    </motion.div>
  );
}
