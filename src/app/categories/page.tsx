"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { useDBValue } from "@/lib/db";
import { Category } from "@/lib/types";
import Link from "next/link";
import * as Icons from "lucide-react";

export default function CategoriesPage() {
  const categories = useDBValue<Category[]>("greenmart_categories") || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-mint-100/50 border-b border-mint-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-mint-900 mb-2">All Categories</h1>
          <p className="text-mint-700/80">Browse our complete directory of product categories.</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category) => {
            // Dynamically get the icon component from Lucide
            const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;
            
            return (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="relative flex flex-col items-center justify-end p-6 h-64 rounded-[32px] overflow-hidden border border-mint-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                {/* Full-bleed category image */}
                {category.image && (
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[8000ms] ease-out"
                  />
                )}
                
                {/* Dark brand-mint gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-mint-950/90 via-mint-900/40 to-transparent group-hover:from-mint-950 group-hover:via-mint-900/50 transition-all duration-300 z-10"></div>
                
                {/* Glassmorphic floating icon */}
                <div className="relative z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 mb-3 group-hover:bg-mint-600 group-hover:border-mint-600 transition-all duration-300 shadow-sm">
                  <IconComponent size={20} />
                </div>
                
                {/* Text labels */}
                <h3 className="relative z-20 font-black text-white text-lg text-center tracking-tight drop-shadow-sm leading-tight">
                  {category.name}
                </h3>
                
                <span className="relative z-20 text-mint-200/90 group-hover:text-white font-extrabold text-[10px] tracking-widest uppercase mt-1.5 transition-colors duration-300">
                  Explore →
                </span>
              </Link>
            );
          })}
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
