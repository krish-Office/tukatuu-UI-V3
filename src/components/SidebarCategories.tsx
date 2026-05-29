"use client";

import Link from "next/link";
import { ChevronRight, Grid, Laptop, Shirt, Home, Sparkles, Apple, Bike, BookOpen, Gamepad2, Car } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Laptop, Shirt, Home, Sparkles, Apple, Bike, BookOpen, Gamepad2, Car, Grid
};

import { mockCategories as categories } from "@/lib/db";

export function SidebarCategories() {
  return (
    <div className="rounded-3xl overflow-hidden flex flex-col h-[500px]">
      
      {/* All Categories Header */}
      <button className="w-full flex items-center gap-3 bg-mint-800 text-white p-4 font-semibold text-[15px]">
        <Grid size={20} />
        All Categories
      </button>
      
      {/* Categories List */}
      <div className="bg-mint-50 flex-1 overflow-y-auto">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Grid;
          return (
            <Link 
              key={cat.id} 
              href={`/category/${cat.slug}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-white text-mint-900 group transition-colors border-b border-white/50"
            >
              <div className="flex items-center gap-4">
                <Icon size={18} className="text-mint-700" />
                <span className="text-sm font-semibold">{cat.name}</span>
              </div>
              <ChevronRight size={14} className="text-mint-700 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
        
        <Link 
          href="/products"
          className="flex items-center justify-between px-5 py-3.5 hover:bg-white text-mint-900 group transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-[18px] flex justify-center text-mint-700 font-bold text-lg leading-none">+</div>
            <span className="text-sm font-semibold">More Categories</span>
          </div>
          <ChevronRight size={14} className="text-mint-700 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}

export function PromoCard() {
  return (
    <div className="bg-mint-800 rounded-3xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <h4 className="text-xl font-bold mb-2">Get 20% Off</h4>
        <p className="text-sm text-mint-800/90 mb-5">On your first order</p>
        <Link href="/products" className="inline-block bg-white text-mint-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-mint-50 transition-colors">
          Shop Now
        </Link>
      </div>
      {/* Gift icon decoration */}
      <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 opacity-50">
         <div className="w-full h-full bg-white/20 rounded-2xl rotate-12"></div>
      </div>
    </div>
  );
}
