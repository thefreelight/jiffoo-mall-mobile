/**
 * Cart Store
 * Zustand store for shopping cart state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncCart, Cart, CartItem } from '../services/api';

interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  coupon: { code: string; discount: number } | null;
  loading: boolean;
  synced: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  syncWithServer: () => Promise<void>;
  setFromServer: (cart: Cart) => void;
  calculateTotals: () => void;
}

// Tax rate (can be configured)
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 5.99;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      coupon: null,
      loading: false,
      synced: false,

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(i => i.id === item.id);

        if (existingIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += item.quantity;
          set({ items: updatedItems, synced: false });
        } else {
          // Add new item
          set({ items: [...items, item], synced: false });
        }

        get().calculateTotals();
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const updatedItems = items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        set({ items: updatedItems, synced: false });
        get().calculateTotals();
      },

      removeItem: (itemId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.id !== itemId);
        set({ items: updatedItems, synced: false });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          coupon: null,
          synced: false,
        });
      },

      applyCoupon: (code, discount) => {
        set({ coupon: { code, discount }, synced: false });
        get().calculateTotals();
      },

      removeCoupon: () => {
        set({ coupon: null, synced: false });
        get().calculateTotals();
      },

      syncWithServer: async () => {
        const { items, synced } = get();

        if (synced || items.length === 0) return;

        set({ loading: true });

        try {
          const response = await syncCart(items);
          if (response.data) {
            get().setFromServer(response.data);
          }
          set({ synced: true });
        } catch (error) {
          console.error('Failed to sync cart:', error);
        } finally {
          set({ loading: false });
        }
      },

      setFromServer: (cart) => {
        set({
          items: cart.items,
          subtotal: cart.subtotal,
          shipping: cart.shipping,
          tax: cart.tax,
          total: cart.total,
          coupon: cart.coupon || null,
          synced: true,
        });
      },

      calculateTotals: () => {
        const { items, coupon } = get();

        // Calculate subtotal
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Calculate shipping
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

        // Apply coupon discount
        const discount = coupon?.discount || 0;
        const discountedSubtotal = Math.max(0, subtotal - discount);

        // Calculate tax
        const tax = discountedSubtotal * TAX_RATE;

        // Calculate total
        const total = discountedSubtotal + shipping + tax;

        set({ subtotal, shipping, tax, total });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate totals after rehydration
        state?.calculateTotals();
      },
    }
  )
);

/**
 * Get cart item count
 */
export function useCartItemCount(): number {
  return useCartStore(state =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
}

/**
 * Check if product is in cart
 */
export function useIsInCart(productId: string): boolean {
  return useCartStore(state =>
    state.items.some(item => item.productId === productId)
  );
}
