"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/lib/types";

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const clampQuantity = (quantity: number, stockCount: number) => {
  return Math.max(1, Math.min(quantity, stockCount));
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    try {
      const stored = localStorage.getItem("greenmart_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        queueMicrotask(() => {
          if (isActive) {
            setCart(parsed);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }

    queueMicrotask(() => {
      if (isActive) {
        setIsLoaded(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "greenmart_cart" && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setCart(prev => {
            if (JSON.stringify(prev) === event.newValue) return prev;
            return parsed;
          });
        } catch (e) {
          console.error("Failed to parse synced cart from storage:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("greenmart_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addItem = (product: Product, quantity = 1) => {
    if (!product.inStock || product.stockCount <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: clampQuantity(item.quantity + quantity, item.stockCount) } : item
        );
      }
      return [...prev, { ...product, quantity: clampQuantity(quantity, product.stockCount) }];
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: clampQuantity(quantity, item.stockCount) } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
