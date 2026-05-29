"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { useDBValue } from "@/lib/db";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function FlashSaleInfo() {
  return (
    <div className="p-4 flex flex-col justify-center xl:mt-8">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={24} className="fill-mint-800 text-white" />
        <h2 className="text-3xl font-extrabold text-mint-900">Flash Sale</h2>
      </div>
      
      <p className="text-mint-800 text-sm font-medium mb-6">Hurry up! Limited time<br/>offers</p>
      
      <div className="flex gap-2 mb-8">
        <div className="bg-white rounded-xl w-12 h-14 flex flex-col items-center justify-center border border-mint-200 shadow-sm">
          <span className="text-lg font-bold text-mint-900 leading-none">02</span>
          <span className="text-[9px] text-mint-700 uppercase mt-1 font-semibold capitalize">Days</span>
        </div>
        <div className="bg-white rounded-xl w-12 h-14 flex flex-col items-center justify-center border border-mint-200 shadow-sm">
          <span className="text-lg font-bold text-mint-900 leading-none">14</span>
          <span className="text-[9px] text-mint-700 uppercase mt-1 font-semibold capitalize">Hours</span>
        </div>
        <div className="bg-white rounded-xl w-12 h-14 flex flex-col items-center justify-center border border-mint-200 shadow-sm">
          <span className="text-lg font-bold text-mint-900 leading-none">35</span>
          <span className="text-[9px] text-mint-700 uppercase mt-1 font-semibold capitalize">Mins</span>
        </div>
        <div className="bg-white rounded-xl w-12 h-14 flex flex-col items-center justify-center border border-mint-200 shadow-sm">
          <span className="text-lg font-bold text-mint-900 leading-none">48</span>
          <span className="text-[9px] text-mint-700 uppercase mt-1 font-semibold capitalize">Secs</span>
        </div>
      </div>
      
      <Link 
        href="/products" 
        className="inline-flex items-center justify-center gap-2 text-sm font-bold bg-mint-800 hover:bg-mint-900 text-white px-5 py-3 rounded-xl transition-all shadow-sm w-fit"
      >
        View All Deals <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export function FlashSaleProducts() {
  const allProducts = useDBValue<Product[]>("greenmart_products") || [];
  const products = allProducts.slice(2, 6);
  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 h-full">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <Link href="/products" aria-label="View all deals" className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-mint-100 text-mint-800 hover:scale-105 transition-transform z-10 hidden xl:flex">
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
