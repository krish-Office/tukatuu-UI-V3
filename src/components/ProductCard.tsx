"use client";

import Link from "next/link";
import { Star, ShoppingCart, Leaf } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = !product.inStock || product.stockCount <= 0;

  return (
    <div className={`group flex flex-col bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full relative p-4 border border-mint-100 shadow-sm ${
      isOutOfStock ? "opacity-65" : ""
    }`}>
      
      {/* Discount/Stock Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {product.discount && !isOutOfStock && (
          <span className="bg-mint-800 text-white text-[11px] font-bold px-2 py-1 rounded">
            -{product.discount}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-slate-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded shadow-sm tracking-wider uppercase">
            Sold Out
          </span>
        )}
      </div>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative h-48 mb-4 flex items-center justify-center overflow-hidden bg-mint-50/20 rounded-2xl border border-mint-100/30 w-full">
        {imageError ? (
          <div className="flex flex-col items-center justify-center text-mint-500 gap-2 h-full w-full select-none">
            <Leaf size={32} className="stroke-[1.5] text-mint-500 fill-mint-100" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-mint-600/40">GreenMart Choice</span>
          </div>
        ) : (
          <img 
            src={product.image} 
            alt={product.name} 
            onError={() => setImageError(true)}
            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
          />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center pointer-events-none"></div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1">
        
        <Link href={`/product/${product.slug}`} className="block flex-1">
          <h3 className="font-bold text-mint-900 text-sm mb-1 hover:text-mint-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 text-amber-400 mb-3">
            <Star size={12} className=" fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-mint-900">{product.rating}</span>
            <span className="text-[11px] text-mint-600/70">({product.reviews})</span>
          </div>
        </Link>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-end gap-2">
            <span className="text-base font-extrabold text-mint-900">
              ${product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-[11px] text-mint-700 line-through mb-0.5">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              if (!isOutOfStock) {
                addItem(product); 
              }
            }}
            disabled={isOutOfStock}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              isOutOfStock
                ? "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed"
                : "border-mint-700 text-mint-700 hover:bg-mint-700 hover:text-white"
            }`}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
