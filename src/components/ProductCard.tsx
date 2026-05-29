"use client";

import Link from "next/link";
import { Star, ShoppingCart, Heart, Check, Leaf } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const GLOWS = [
  "radial-gradient(ellipse at 60% 40%, #bbf7d0 0%, #dcfce7 50%, #f0fdf4 100%)",
  "radial-gradient(ellipse at 60% 40%, #a5f3fc 0%, #cffafe 50%, #f0fdff 100%)",
  "radial-gradient(ellipse at 60% 40%, #fde68a 0%, #fef3c7 50%, #fffbeb 100%)",
  "radial-gradient(ellipse at 60% 40%, #c4b5fd 0%, #ede9fe 50%, #faf5ff 100%)",
  "radial-gradient(ellipse at 60% 40%, #fbcfe8 0%, #fce7f3 50%, #fdf2f8 100%)",
  "radial-gradient(ellipse at 60% 40%, #fed7aa 0%, #ffedd5 50%, #fff7ed 100%)",
];

function glowFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return GLOWS[h % GLOWS.length];
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imgErr, setImgErr] = useState(false);
  const [liked, setLiked] = useState(false);
  const [done, setDone] = useState(false);

  const oos = !product.inStock || product.stockCount <= 0;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (oos || done) return;
    addItem(product);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  return (
    /* Fixed total card size — never grows or shrinks */
    <div
      className={`group relative flex flex-col rounded-[22px] overflow-hidden bg-white
        transition-all duration-300
        hover:-translate-y-2
        hover:shadow-[0_20px_60px_-10px_rgba(68,165,101,0.25)]
        shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]
        border border-slate-100
        ${oos ? "opacity-60" : ""}
      `}
      style={{ width: "100%", height: "340px" }}
    >
      {/* ══ IMAGE ZONE — fixed 190px tall ══════════════════ */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block flex-none overflow-hidden"
        style={{ height: "190px" }}
      >
        {/* Ambient glow bg */}
        <div
          className="absolute inset-0"
          style={{ background: glowFor(product.id) }}
        />

        {/* Product image */}
        {imgErr ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none">
            <Leaf size={36} className="text-mint-300 fill-mint-100 stroke-[1.5]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-mint-400">
              GreenMart
            </span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgErr(true)}
            className="absolute inset-0 w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
          />
        )}

        {/* Sold-out overlay */}
        {oos && (
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/50 flex items-center justify-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/90 border border-slate-200 px-3 py-1 rounded-full shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNew && !oos && (
            <span className="text-[9px] font-black uppercase tracking-wider bg-mint-600 text-white px-2 py-0.5 rounded-full shadow">
              New
            </span>
          )}
          {product.discount && !oos && (
            <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shadow">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Wishlist — top right */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
          className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center border shadow transition-all duration-200 ${
            liked
              ? "bg-rose-500 border-rose-400 text-white scale-110"
              : "bg-white/80 backdrop-blur-sm border-slate-100 text-slate-400 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart size={12} className={liked ? "fill-white" : ""} />
        </button>

        {/* Quick-add slide-up — desktop hover only */}
        {!oos && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out px-3 pb-3 z-20">
            <button
              onClick={addToCart}
              className={`w-full py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-lg transition-colors duration-200 ${
                done
                  ? "bg-mint-600 text-white"
                  : "bg-slate-900 hover:bg-mint-800 text-white"
              }`}
            >
              {done
                ? <><Check size={12} strokeWidth={3} /> Added!</>
                : <><ShoppingCart size={12} /> Quick Add</>
              }
            </button>
          </div>
        )}
      </Link>

      {/* ══ INFO ZONE — fixed 150px tall ════════════════════ */}
      <div
        className="flex flex-col flex-none px-3.5 pt-3 pb-3.5 border-t border-slate-50"
        style={{ height: "150px" }}
      >
        {/* Brand — fixed 1 line */}
        <span className="block text-[9px] font-extrabold uppercase tracking-[0.2em] text-mint-500 truncate">
          {product.brand}
        </span>

        {/* Name — fixed 2 lines */}
        <Link href={`/product/${product.slug}`} className="block mt-1">
          <h3
            className="text-[12.5px] font-bold text-slate-800 leading-snug hover:text-mint-700 transition-colors overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              height: "36px",   /* exactly 2 lines */
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Stars — fixed 1 line */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={9}
                className={
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : i < product.rating
                    ? "fill-amber-200 text-amber-300"
                    : "fill-slate-100 text-slate-100"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            ({product.reviews})
          </span>
        </div>

        {/* Price + cart — pinned to bottom */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-black text-slate-900 leading-none">
              ${product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Mobile / non-hover fallback button */}
          <button
            onClick={addToCart}
            disabled={oos}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
              oos
                ? "border-slate-200 text-slate-300 cursor-not-allowed"
                : done
                ? "bg-mint-600 border-mint-600 text-white"
                : "border-mint-600 text-mint-600 hover:bg-mint-600 hover:text-white"
            }`}
          >
            {done
              ? <Check size={12} strokeWidth={3} />
              : <ShoppingCart size={12} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
