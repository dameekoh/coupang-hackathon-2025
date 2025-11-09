import type { Product } from '../types/product';
import { useCartStore } from '../stores/cartStore';

interface CartItemProps {
  item: Product & { cartQuantity: number };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartStore();
  const handleDecrease = () => {
    if (item.cartQuantity > 1) {
      updateQuantity(item.id, item.cartQuantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.id, item.cartQuantity + 1);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      {/* Checkbox */}
      <input
        type="checkbox"
        className="w-5 h-5 rounded border-gray-300"
        defaultChecked
      />

      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.name}
        </h3>
        {item.brand && (
          <p className="text-xs text-gray-600 mt-1">{item.brand}</p>
        )}
        {item.origin && (
          <p className="text-xs text-gray-500 mt-1">{item.origin}</p>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleDecrease}
            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
          >
            −
          </button>
          <span className="text-sm font-medium min-w-[20px] text-center">
            {item.cartQuantity}
          </span>
          <button
            onClick={handleIncrease}
            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Price and Remove */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <p className="text-base font-bold text-gray-900">
          {(item.price * item.cartQuantity).toLocaleString()}원
        </p>
      </div>
    </div>
  );
}
