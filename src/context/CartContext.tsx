'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: number, variantId?: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null | undefined, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  storeId: number | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mymall_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse cart from local storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mymall_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (product: Product, variant?: ProductVariant | null, quantity = 1) => {
    setItems((prev) => {
      // Single-store restriction: if cart has items from another store, prompt or replace
      if (prev.length > 0 && prev[0].product.storeId !== product.storeId) {
        if (!confirm('Your cart contains items from another store. Replace cart with items from this store?')) {
          return prev;
        }
        const unitPrice = variant?.price ? Number(variant.price) : Number(product.sellingPrice);
        return [{ product, variant, quantity, unitPrice }];
      }

      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      const unitPrice = variant?.price ? Number(variant.price) : Number(product.sellingPrice);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, { product, variant, quantity, unitPrice }];
    });
  };

  const removeItem = (productId: number, variantId?: number | null) => {
    setItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && (item.variant?.id ?? null) === (variantId ?? null)))
    );
  };

  const updateQuantity = (productId: number, variantId: number | null | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && (item.variant?.id ?? null) === (variantId ?? null)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const storeId = items.length > 0 ? items[0].product.storeId : null;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        storeId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
