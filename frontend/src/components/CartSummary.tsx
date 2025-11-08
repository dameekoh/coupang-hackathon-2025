import { motion } from 'motion/react';

interface CartSummaryProps {
  itemCount: number;
  totalPrice: number;
  onClick?: () => void;
}

export default function CartSummary({ itemCount, totalPrice, onClick }: CartSummaryProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-lg z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {/* Item count badge */}
        <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
          {itemCount}
        </div>
        <span className="text-lg font-medium">카트보기</span>
      </div>

      <div className="text-xl font-bold">
        {totalPrice.toLocaleString()}원
      </div>
    </motion.div>
  );
}
