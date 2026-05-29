"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Leaf } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import toast from "react-hot-toast";

const VALID_COUPONS: Record<string, number> = {
  GREEN10: 0.1,
  WELCOME15: 0.15
};

export default function CartPage() {
  const { cart, removeItem, updateQuantity, cartTotal } = useCart();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleProceedToCheckout = () => {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Please sign in to proceed to checkout.");
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  // Load applied coupon on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("greenmart_coupon");
      if (stored && VALID_COUPONS[stored]) {
        setAppliedCoupon(stored);
      }
    }
  }, []);
  
  const discountRate = appliedCoupon ? VALID_COUPONS[appliedCoupon] : 0;
  const discount = cartTotal * discountRate;
  const discountedSubtotal = cartTotal - discount;
  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 50 || cartTotal === 0 ? 0 : 10;
  const total = discountedSubtotal + tax + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      setAppliedCoupon(null);
      setCouponError("");
      localStorage.removeItem("greenmart_coupon");
      return;
    }

    if (!VALID_COUPONS[normalizedCode]) {
      setAppliedCoupon(null);
      setCouponError("Invalid coupon code.");
      localStorage.removeItem("greenmart_coupon");
      return;
    }

    setAppliedCoupon(normalizedCode);
    setCouponError("");
    localStorage.setItem("greenmart_coupon", normalizedCode);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-mint-50/30">
          <div className="text-center bg-white p-10 rounded-3xl shadow-xl shadow-mint-900/5 border border-mint-200 max-w-md w-full mx-4">
            <div className="w-24 h-24 bg-mint-100 rounded-full flex items-center justify-center text-mint-700 mx-auto mb-6">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-2xl font-bold text-mint-900 mb-4">Your Cart is Empty</h2>
            <p className="text-mint-700 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link 
              href="/products"
              className="bg-mint-700 hover:bg-mint-800 text-white w-full py-4 rounded-xl font-bold transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-mint-100/50 border-b border-mint-200 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-mint-900">Shopping Cart</h1>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-mint-200 shadow-sm overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 p-6 bg-mint-100/50 border-b border-mint-200 text-sm font-bold text-mint-800">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              
              <div className="divide-y divide-mint-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                    
                    {/* Product Info */}
                    <div className="col-span-1 sm:col-span-6 flex gap-4">
                      <Link href={`/product/${item.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-mint-50 border border-mint-100 flex items-center justify-center relative block">
                        {failedImages[item.id] ? (
                          <div className="flex flex-col items-center justify-center text-mint-500 gap-1.5 h-full w-full select-none p-2 bg-mint-50/50">
                            <Leaf size={24} className="stroke-[1.5] text-mint-500 fill-mint-100" />
                            <span className="text-[8px] font-bold uppercase tracking-wider text-mint-600/40">Item</span>
                          </div>
                        ) : (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            onError={() => handleImageError(item.id)}
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </Link>
                      <div className="flex flex-col justify-center flex-1">
                        <Link href={`/product/${item.slug}`} className="font-bold text-mint-900 hover:text-mint-700 transition-colors line-clamp-2 mb-1">
                          {item.name}
                        </Link>
                        <p className="text-sm text-mint-600/70 mb-2">{item.brand}</p>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-semibold flex items-center gap-1 text-red-500 hover:text-red-700 w-fit"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Price (Mobile & Desktop) */}
                    <div className="col-span-1 sm:col-span-2 flex sm:block justify-between items-center sm:text-center">
                      <span className="sm:hidden text-sm font-bold text-mint-700">Price:</span>
                      <span className="font-bold text-mint-900">${item.price.toFixed(2)}</span>
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-1 sm:col-span-2 flex sm:block justify-between items-center">
                      <span className="sm:hidden text-sm font-bold text-mint-700">Quantity:</span>
                      <div className="flex items-center justify-center border border-mint-300 rounded-lg bg-white h-10 w-28 sm:mx-auto overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-full flex items-center justify-center text-mint-700 hover:bg-mint-50 hover:text-mint-900 transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-1 text-center font-bold text-sm text-mint-900 select-none">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center text-mint-700 hover:bg-mint-50 hover:text-mint-900 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="col-span-1 sm:col-span-2 flex sm:block justify-between items-center sm:text-right">
                      <span className="sm:hidden text-sm font-bold text-mint-700">Subtotal:</span>
                      <span className="font-bold text-mint-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-mint-200/50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <form onSubmit={handleApplyCoupon} className="flex flex-col gap-1.5 shrink-0">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-white/80 focus:bg-white border border-mint-200 px-4 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-transparent w-full sm:w-48 text-sm transition-all shadow-sm"
                  />
                  <button 
                    type="submit" 
                    className="bg-mint-800 text-white hover:bg-mint-900 px-6 h-12 rounded-xl font-bold transition-all text-sm whitespace-nowrap shadow-sm hover:shadow active:scale-98 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && <p className="text-xs font-bold text-emerald-700 px-1">{appliedCoupon} applied.</p>}
                {couponError && <p className="text-xs font-bold text-red-600 px-1">{couponError}</p>}
              </form>
              
              <Link 
                href="/products" 
                className="border-2 border-mint-700/80 hover:border-mint-800 bg-white/40 hover:bg-white/80 text-mint-800 hover:text-mint-950 font-bold px-6 h-12 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-gradient-to-br from-mint-850 to-mint-950 rounded-3xl p-6 text-white sticky top-28 shadow-xl shadow-mint-950/15 relative overflow-hidden border border-mint-800/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-mint-500 rounded-full opacity-10 -mr-10 -mt-10 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-mint-600 rounded-full opacity-5 -ml-10 -mb-10 blur-xl"></div>
              
              <h2 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6 text-sm text-mint-100/70 relative z-10 border-b border-white/[0.08] pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">${cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span className="font-bold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-white">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-white">${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-8 relative z-10">
                <span className="text-mint-100/70">Total</span>
                <span className="text-3xl font-extrabold text-white">${total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-white hover:bg-mint-50 text-mint-950 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all relative z-10 shadow-lg shadow-mint-950/10 hover:shadow-mint-950/20 active:scale-98 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight size={20} className="text-mint-950" />
              </button>
              
              <p className="text-center text-xs text-mint-300/50 mt-4 relative z-10">
                Secure checkout. 100% money back guarantee.
              </p>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
