"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Flame, Heart } from "lucide-react";
import { useState } from "react";

export function PromoBanners() {
  const [imagesFailed, setImagesFailed] = useState<Record<string, boolean>>({});

  const banners = [
    {
      id: "matcha",
      title: "ZenTea Ceremonial Matcha",
      subtitle: "Kyoto Sourced Green Tea Set",
      badge: "Limited Offer",
      badgeIcon: Sparkles,
      slug: "organic-green-tea",
      gradient: "from-mint-850 to-mint-950 border-mint-800/40",
      isDark: true,
      image: "https://images.unsplash.com/photo-1582793988951-9aed550cbe14?q=80&w=600&auto=format&fit=crop",
      tagColor: "bg-white/10 text-mint-100 border-white/20",
      btnClass: "bg-white hover:bg-mint-50 text-mint-950 shadow-mint-950/20",
      textClass: "text-white",
      descClass: "text-mint-100/70",
      leafColor: "stroke-mint-300"
    },
    {
      id: "aloe",
      title: "Pure Organic Aloe Vera",
      subtitle: "Hydrating skincare boost gel",
      badge: "Save 20% Off",
      badgeIcon: Flame,
      slug: "organic-aloe-vera-gel",
      gradient: "from-teal-50/90 to-emerald-100/40 border-emerald-200/50",
      isDark: false,
      image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=600&auto=format&fit=crop",
      tagColor: "bg-emerald-100 text-emerald-800 border-emerald-200/30",
      btnClass: "bg-mint-900 hover:bg-mint-950 text-white shadow-mint-950/10",
      textClass: "text-emerald-950",
      descClass: "text-emerald-800/70",
      leafColor: "stroke-mint-700"
    },
    {
      id: "diffuser",
      title: "Aromatherapy Diffuser",
      subtitle: "Essential oils wellness humidifier",
      badge: "Best Seller",
      badgeIcon: Heart,
      slug: "essential-oil-diffuser",
      gradient: "from-amber-50/90 to-orange-100/40 border-amber-200/60",
      isDark: false,
      image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?q=80&w=600&auto=format&fit=crop",
      tagColor: "bg-amber-100 text-amber-900 border-amber-200/40",
      btnClass: "bg-amber-900 hover:bg-amber-950 text-white shadow-amber-950/10",
      textClass: "text-amber-950",
      descClass: "text-amber-800/70",
      leafColor: "stroke-amber-700"
    }
  ];

  return (
    <section className="mb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-mint-900 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-mint-600 rounded-full inline-block"></span>
            Weekly Highlights & Promotions
          </h2>
          <p className="text-sm text-mint-800/70 font-medium mt-1">Handpicked organic deals and premium wellness products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => {
          const BadgeIcon = b.badgeIcon;
          const imageFailed = imagesFailed[b.id];

          return (
            <Link 
              key={b.id} 
              href={`/product/${b.slug}`}
              className={`relative rounded-[32px] border p-8 flex flex-col justify-between overflow-hidden group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 h-[250px] bg-gradient-to-br ${b.gradient}`}
            >
              {/* Decorative radial overlay */}
              <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              {/* Top Section */}
              <div className="relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${b.tagColor}`}>
                  <BadgeIcon size={12} className="animate-pulse" />
                  {b.badge}
                </span>

                <h3 className={`text-2xl font-extrabold tracking-tight mt-4 leading-tight group-hover:text-mint-600 transition-colors duration-300 ${b.textClass}`}>
                  {b.title}
                </h3>
                <p className={`text-sm font-semibold mt-1 tracking-wide ${b.descClass}`}>
                  {b.subtitle}
                </p>
              </div>

              {/* Bottom Section (Action) */}
              <div className="relative z-10 mt-auto">
                <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-300 group-hover:gap-2.5 ${b.btnClass}`}>
                  Shop Deal 
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Image side float */}
              {!imageFailed && b.image ? (
                <div className="absolute right-0 bottom-0 top-0 w-2/5 flex items-center justify-end overflow-hidden z-0 pointer-events-none">
                  <div className="relative w-[130%] h-[130%] translate-x-4 translate-y-6 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-700">
                    <img
                      src={b.image}
                      alt={b.title}
                      className={`w-full h-full object-cover object-center transition-all duration-700 rounded-2xl ${
                        b.isDark 
                          ? "mix-blend-screen opacity-85 brightness-110" 
                          : "mix-blend-multiply opacity-90 contrast-105"
                      }`}
                      onError={() => setImagesFailed(prev => ({ ...prev, [b.id]: true }))}
                    />
                  </div>
                </div>
              ) : (
                /* Beautiful Organic Leaf SVG Fallback on Failure */
                <div className="absolute right-4 bottom-4 w-28 h-28 opacity-25 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                    <path
                      d="M2 22C2 22 6.5 17.5 12 12C17.5 6.5 22 2 22 2M22 2C22 2 15 2 9 8C3 14 2 22 2 22M22 2C22 2 22 9 16 15C10 21 2 22 2 22"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={b.leafColor}
                    />
                    <path
                      d="M12 12C12 12 15 10 18 8M7.5 16.5C7.5 16.5 10 15 13 13.5"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={b.leafColor}
                    />
                  </svg>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
