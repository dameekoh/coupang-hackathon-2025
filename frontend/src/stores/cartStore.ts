import { create } from 'zustand';
import type { Product } from '../types/product';

interface CartItem extends Product {
  cartQuantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addToCart: (product: Product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, cartQuantity: item.cartQuantity + 1 }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { ...product, cartQuantity: 1 }],
      };
    });
  },

  removeFromCart: (productId: string) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === productId);

      if (existingItem && existingItem.cartQuantity > 1) {
        return {
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, cartQuantity: item.cartQuantity - 1 }
              : item
          ),
        };
      }

      return {
        items: state.items.filter((item) => item.id !== productId),
      };
    });
  },

  updateQuantity: (productId: string, newQuantity: number) => {
    set((state) => {
      if (newQuantity < 1) {
        return {
          items: state.items.filter((item) => item.id !== productId),
        };
      }

      return {
        items: state.items.map((item) =>
          item.id === productId ? { ...item, cartQuantity: newQuantity } : item
        ),
      };
    });
  },

  clearCart: () => {
    set({ items: [] });
  },
}));

// Selectors
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.cartQuantity, 0)
  );
export const useCartTotalPrice = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.cartQuantity, 0)
  );
