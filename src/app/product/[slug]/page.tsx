"use client";

import { use } from "react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useDBValue } from "@/lib/db";
import { Product, User } from "@/lib/types";
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, Plus, Minus, Leaf, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const products = useDBValue<Product[]>("greenmart_products");
  
  const router = useRouter();
  const product = products?.find(p => p.slug === resolvedParams.slug);
  const currentUser = useDBValue<User | null>("greenmart_current_user");
  const { addItem } = useCart();
  const { toggleMarked, isMarked } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!products) return null; // Wait for hydration

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-mint-900 mb-4">Product Not Found</h1>
            <Link href="/products" className="text-mint-700 hover:underline">Return to Products</Link>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const marked = isMarked(product.id);
  const selectedQuantity = Math.min(quantity, product.stockCount);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-mint-600/70 mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-mint-900 transition-colors">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <Link href="/products" className="hover:text-mint-900 transition-colors">Products</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-mint-900 font-medium truncate max-wxs">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-mint-100/50 border border-mint-200 relative group flex items-center justify-center w-full h-full">
              {imageError ? (
                <div className="flex flex-col items-center justify-center text-mint-500 gap-3 select-none">
                  <Leaf size={48} className="stroke-[1.5] text-mint-500 fill-mint-100" />
                  <span className="text-xs font-bold uppercase tracking-wider text-mint-600/40">GreenMart Choice</span>
                </div>
              ) : (
                <img 
                  src={product.images ? product.images[activeImageIndex] : product.image} 
                  alt={product.name} 
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              )}
              
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.discount && (
                  <span className="bg-red-500 text-mint-900 text-sm font-bold px-3 py-1.5 rounded-lg">-{product.discount}%</span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-mint-600 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-mint-700 font-semibold mb-2">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-mint-900 leading-tight mb-4">{product.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-mint-200 text-mint-200"} />
                  ))}
                  <span className="text-sm font-bold text-mint-900 ml-2">{product.rating}</span>
                  <span className="text-sm text-mint-600/70 ml-1">({product.reviews} reviews)</span>
                </div>
                <div className="h-4 w-px bg-mint-300"></div>
                <div className="text-sm font-medium flex items-center gap-2 text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  In Stock ({product.stockCount})
                </div>
              </div>
              
              <div className="flex items-end gap-3 mb-8">
                <span className="text-4xl font-extrabold text-mint-900">${product.price.toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="text-xl text-mint-600/60 line-through mb-1">${product.oldPrice.toFixed(2)}</span>
                )}
              </div>
              
              <p className="text-mint-800/80 leading-relaxed mb-8 text-lg">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="border-y border-mint-200 py-6 mb-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-mint-300 rounded-xl bg-white w-full sm:w-auto h-14 overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center text-mint-700 hover:bg-mint-50 hover:text-mint-900 transition-colors rounded-l-xl"
                  title="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-mint-900 select-none">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  disabled={quantity >= product.stockCount}
                  className="w-12 h-full flex items-center justify-center text-mint-700 hover:bg-mint-50 hover:text-mint-900 transition-colors disabled:cursor-not-allowed disabled:opacity-40 rounded-r-xl"
                  title="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <button 
                onClick={() => addItem(product, selectedQuantity)}
                disabled={!product.inStock || product.stockCount <= 0}
                className="flex-1 bg-mint-700 hover:bg-mint-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl h-14 flex items-center justify-center gap-2 transition-all shadow-lg shadow-mint-700/20 hover:shadow-mint-700/40"
              >
                <ShoppingCart size={22} />
                {product.inStock && product.stockCount > 0 ? "Add to Cart" : "Out of Stock"}
              </button>

              <button 
                onClick={() => {
                  addItem(product, selectedQuantity);
                  router.push("/checkout");
                }}
                disabled={!product.inStock || product.stockCount <= 0}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-lg rounded-xl h-14 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 cursor-pointer"
              >
                <Zap size={20} className="fill-current" />
                Buy Now
              </button>
              
              {currentUser && (
                <button 
                  onClick={() => toggleMarked(product.id)}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all ${marked ? 'border-red-500 bg-red-50' : 'border-mint-300 bg-white hover:border-mint-500'}`}
                  title="Add to Wishlist"
                >
                  <Heart size={22} className={marked ? "fill-red-500 text-red-500" : "text-mint-200"} />
                </button>
              )}
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-mint-50 border border-mint-100">
                <Truck size={24} className="text-mint-700" />
                <div>
                  <h4 className="font-bold text-mint-900 text-sm">Free Shipping</h4>
                  <p className="text-xs text-mint-600/70">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-mint-50 border border-mint-100">
                <ShieldCheck size={24} className="text-mint-700" />
                <div>
                  <h4 className="font-bold text-mint-900 text-sm">2 Year Warranty</h4>
                  <p className="text-xs text-mint-600/70">100% guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-mint-200">
            <h2 className="text-2xl font-bold text-mint-900 mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
