"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import toast from "react-hot-toast";

interface WishlistContextType {
  wishlist: string[];
  toggleMarked: (productId: string) => void;
  isMarked: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadWishlist = () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          if (isActive) {
            setWishlist([]);
            setIsLoaded(true);
          }
          return;
        }
        
        const storageKey = `greenmart_wishlist_${user.phone}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isActive) {
            setWishlist(parsed);
          }
        } else {
          // Fallback migration check for legacy generic key
          const legacyStored = localStorage.getItem("greenmart_wishlist");
          if (legacyStored) {
            const parsed = JSON.parse(legacyStored);
            if (isActive) {
              setWishlist(parsed);
            }
            localStorage.setItem(storageKey, legacyStored);
          } else {
            if (isActive) {
              setWishlist([]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load wishlist:", e);
      }
      
      if (isActive) {
        setIsLoaded(true);
      }
    };

    loadWishlist();

    window.addEventListener("storage", loadWishlist);
    window.addEventListener("greenmart-storage", loadWishlist);

    return () => {
      isActive = false;
      window.removeEventListener("storage", loadWishlist);
      window.removeEventListener("greenmart-storage", loadWishlist);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const user = getCurrentUser();
      if (user) {
        localStorage.setItem(`greenmart_wishlist_${user.phone}`, JSON.stringify(wishlist));
      }
    }
  }, [wishlist, isLoaded]);

  const toggleMarked = (productId: string) => {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Please sign in to manage your wishlist.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
      return;
    }

    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isMarked = (productId: string) => {
    const user = getCurrentUser();
    return user ? wishlist.includes(productId) : false;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleMarked, isMarked }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
