"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useDBValue } from "@/lib/db";
import { Product } from "@/lib/types";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

export default function MarkedPage() {
  const { wishlist } = useWishlist();
  const allProducts = useDBValue<Product[]>("greenmart_products") || [];
  const markedProducts = allProducts.filter(p => wishlist.includes(p.id));
  
  const currentUser = useDBValue<User | null>("greenmart_current_user");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const activeUser = getCurrentUser();
      if (activeUser === null) {
        window.location.href = "/login";
      }
    }
  }, [mounted]);

  if (!mounted || !currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-mint-50/30 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/account" className="inline-flex items-center gap-1 text-mint-700 hover:text-mint-950 mb-6 font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-red-100 text-red-500 rounded-lg">
              <Heart size={24} className="fill-red-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-mint-900">Wishlist</h1>
          </div>
          
          {markedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-mint-200 shadow-sm max-w-2xl mx-auto">
              <Heart size={48} className="mx-auto text-mint-400 mb-4" />
              <h2 className="text-xl font-bold text-mint-900 mb-2">Your wishlist is empty</h2>
              <p className="text-mint-700 mb-6">Save items you love to your wishlist and review them anytime.</p>
              <Link href="/products" className="bg-mint-700 hover:bg-mint-800 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Discover Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {markedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
