import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useCartItemCount, useCartTotalPrice } from '../stores/cartStore';

interface CartSummaryProps {
  onClick?: () => void;
}

export default function CartSummary({ onClick }: CartSummaryProps) {
  const itemCount = useCartItemCount();
  const totalPrice = useCartTotalPrice();
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [prevCount, setPrevCount] = useState(itemCount);

  // Detect when count increases
  useEffect(() => {
    if (itemCount > prevCount) {
      setShowPlusOne(true);
      setTimeout(() => setShowPlusOne(false), 1000);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);

  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-lg z-50 cursor-pointer hover:bg-blue-700 transition-colors"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {/* Item count badge with animation */}
        <motion.div
          className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm relative"
          key={itemCount}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        >
          {itemCount}

          {/* +1 badge */}
          <AnimatePresence>
            {showPlusOne && (
              <motion.div
                className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                +1
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <span className="text-lg font-medium">카트보기</span>
      </div>

      <div className="text-xl font-bold">
        {totalPrice.toLocaleString()}원
      </div>
    </motion.button>
  );
}
