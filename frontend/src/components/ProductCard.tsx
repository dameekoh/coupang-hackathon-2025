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
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="p-6">
        {/* Product Name */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {product.name}
        </h2>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-600 mb-2">
            {product.brand}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Origin (only if provided) */}
        {product.origin && (
          <p className="text-sm text-gray-600 mb-3">
            {product.origin}
          </p>
        )}

        {/* Rating (only if provided) */}
        {product.rating !== undefined && product.reviewCount !== undefined && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-base font-medium text-gray-900">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>
        )}

        {/* Delivery Days */}
        {product.deliveryDays && (
          <p className="text-sm text-green-600 mb-3">
            🚚 {product.deliveryDays}일 배송
          </p>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {product.price.toLocaleString()}원
            </p>
            {product.pricePerUnit && (
              <p className="text-sm text-gray-500">
                {product.pricePerUnit}
              </p>
            )}
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
