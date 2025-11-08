import { motion } from 'motion/react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <motion.div
      className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.image}
          alt={product.nameKo}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="p-6">
        {/* Product Name */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {product.nameKo}
        </h2>

        {/* Origin */}
        <p className="text-sm text-gray-600 mb-3">
          {product.origin}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-500 text-lg">⭐</span>
          <span className="text-base font-medium text-gray-900">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {product.price.toLocaleString()}원
            </p>
            <p className="text-sm text-gray-500">
              {product.pricePerUnit}
            </p>
          </div>

          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
