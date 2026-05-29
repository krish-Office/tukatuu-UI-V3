"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { SidebarCategories, PromoCard } from "@/components/SidebarCategories";
import { HeroSection } from "@/components/HeroSection";
import { FeatureStrip } from "@/components/FeatureStrip";
import { FlashSaleInfo, FlashSaleProducts } from "@/components/FlashSale";
import { ProductCard } from "@/components/ProductCard";
import { PromoBanners } from "@/components/PromoBanners";
import { BrandStrip } from "@/components/BrandStrip";
import { useDBValue } from "@/lib/db";
import { Product } from "@/lib/types";
import Link from "next/link";
import { Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function Home() {
  const allProducts = useDBValue<Product[]>("greenmart_products") || [];
  
  // Marketing bands
  const saleProducts = allProducts.filter(p => p.discount).slice(0, 4);
  const featuredProducts = allProducts
    .filter(p => p.rating >= 4.6)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
  const techGadgets = allProducts
    .filter(p => p.category === "electronics")
    .slice(0, 10);

  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const techScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft } = ref.current;
      const cardWidth = ref.current.firstElementChild?.clientWidth || 200;
      const gap = 16; // gap-4 is 16px
      const scrollAmount = direction === "left" ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2;
      ref.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 lg:px-8">
        
        {/* Navigation row */}
        <div className="hidden lg:flex items-center gap-8 mb-4">
          <div className="w-64 shrink-0"></div>
          
          <div className="flex-1 flex justify-between items-center">
            <nav className="flex items-center gap-8 font-semibold text-sm text-mint-900">
              <Link href="/" className="border-b-2 border-mint-800 pb-1">Home</Link>
              <Link href="/categories" className="hover:text-mint-700 pb-1">Categories</Link>
              <Link href="/products" className="hover:text-mint-700 pb-1">Deals</Link>
              <Link href="/products" className="hover:text-mint-700 pb-1">New Arrivals</Link>
              <Link href="/products" className="hover:text-mint-700 pb-1">Best Sellers</Link>
            </nav>
            
            <div className="flex items-center gap-2 bg-mint-200/50 px-4 py-2 rounded-lg text-sm font-semibold text-mint-900">
              <Truck size={16} />
              Free Shipping on orders over $50
            </div>
          </div>
        </div>

        <div className="flex gap-8 mb-12">
          {/* Left Column */}
          <div className="w-64 shrink-0 hidden lg:flex flex-col gap-6">
            <SidebarCategories />
            <PromoCard />
            <FlashSaleInfo />
          </div>
          
          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <HeroSection />
            <FeatureStrip />
            
            <div className="lg:hidden">
              <FlashSaleInfo />
            </div>
            
            <FlashSaleProducts />
          </div>
        </div>
        
        {/* Additional Marketing Bands */}
        <PromoBanners />
        
        {featuredProducts.length > 0 && (
          <div className="mb-16 relative group/featured">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-mint-900">Featured Products</h2>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => scroll(featuredScrollRef, "left")} 
                  className="w-10 h-10 rounded-full border border-mint-200 bg-white flex items-center justify-center text-mint-800 hover:bg-mint-50 hover:border-mint-300 transition-colors shadow-sm cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll(featuredScrollRef, "right")} 
                  className="w-10 h-10 rounded-full border border-mint-200 bg-white flex items-center justify-center text-mint-800 hover:bg-mint-50 hover:border-mint-300 transition-colors shadow-sm cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div 
              ref={featuredScrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 scroll-smooth"
            >
              {featuredProducts.map(p => (
                <div 
                  key={p.id} 
                  className="w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(16.666%-14px)] shrink-0 snap-start"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        <BrandStrip />

        {techGadgets.length > 0 && (
          <div className="mb-16 relative group/tech">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-mint-900">Top Tech Gadgets</h2>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => scroll(techScrollRef, "left")} 
                  className="w-10 h-10 rounded-full border border-mint-200 bg-white flex items-center justify-center text-mint-800 hover:bg-mint-50 hover:border-mint-300 transition-colors shadow-sm cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll(techScrollRef, "right")} 
                  className="w-10 h-10 rounded-full border border-mint-200 bg-white flex items-center justify-center text-mint-800 hover:bg-mint-50 hover:border-mint-300 transition-colors shadow-sm cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div 
              ref={techScrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 scroll-smooth"
            >
              {techGadgets.map(p => (
                <div 
                  key={p.id} 
                  className="w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-13px)] shrink-0 snap-start"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center mb-16">
          <Link href="/categories" className="bg-mint-700 hover:bg-mint-800 text-white font-bold py-4 px-12 rounded-xl transition-colors text-lg shadow-lg shadow-mint-700/20 hover:shadow-mint-700/40">
            Explore all
          </Link>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
