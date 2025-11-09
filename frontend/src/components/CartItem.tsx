import type { Product } from '../types/product';

interface CartItemProps {
  item: Product & { cartQuantity: number };
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const handleDecrease = () => {
    if (item.cartQuantity > 1) {
      onQuantityChange(item.id, item.cartQuantity - 1);
    } else {
      onRemove(item.id);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.id, item.cartQuantity + 1);
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
          alt={item.nameKo}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.nameKo}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{item.origin}</p>

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
          onClick={() => onRemove(item.id)}
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
