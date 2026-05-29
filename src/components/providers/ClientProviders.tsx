"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "react-hot-toast";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
      </CartProvider>
    </WishlistProvider>
  );
}
