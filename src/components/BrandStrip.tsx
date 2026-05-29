"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Verified } from "lucide-react";

const BRANDS = [
  {
    name: "NaturePure",
    subtitle: "100% Organic Essentials",
    tag: "Certified Organic",
    image: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?q=80&w=800&auto=format&fit=crop",
    color: "#166534",
    featured: true,
  },
  {
    name: "ZenTea",
    subtitle: "Kyoto Ceremony Matchas",
    tag: "Premium",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop",
    color: "#14532d",
    featured: false,
  },
  {
    name: "EcoSmile",
    subtitle: "Sustainable Hygiene Care",
    tag: "Eco-Friendly",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop",
    color: "#0f766e",
    featured: false,
  },
  {
    name: "HomeVibe",
    subtitle: "Cozy Wellness Planters",
    tag: "Home & Living",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop",
    color: "#92400e",
    featured: false,
  },
  {
    name: "FitTech",
    subtitle: "Active Fitness Wearables",
    tag: "Active",
    image: "https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?q=80&w=800&auto=format&fit=crop",
    color: "#1e3a8a",
    featured: false,
  },
  {
    name: "Wanderlust",
    subtitle: "Premium Outdoor Bags",
    tag: "Outdoor",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    color: "#9a3412",
    featured: false,
  },
  {
    name: "ZenYoga",
    subtitle: "Non-slip Eco-Alignment",
    tag: "Wellness",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?q=80&w=800&auto=format&fit=crop",
    color: "#166534",
    featured: false,
  },
  {
    name: "EcoStyle",
    subtitle: "Organic Cotton Attire",
    tag: "Fashion",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
    color: "#9d174d",
    featured: false,
  },
];

export function BrandStrip() {
  const router = useRouter();

  const go = (name: string) =>
    router.push(`/products?brand=${encodeURIComponent(name)}`);

  return (
    <section className="mb-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-mint-600 mb-1">
            Curated Partners
          </p>
          <h2 className="text-3xl font-black text-mint-900 leading-tight">
            Shop by{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg,#44a565 0%,#2d7345 50%,#0f766e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Trusted Brand
            </span>
          </h2>
        </div>
        <button
          onClick={() => go("")}
          className="hidden md:flex items-center gap-1.5 text-sm font-bold text-mint-700 hover:text-mint-900 transition-colors group"
        >
          View all
          <ArrowUpRight
            size={15}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Single scrollable row */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2">
        {BRANDS.map((brand) => (
          <BrandCard key={brand.name} brand={brand} onClick={() => go(brand.name)} />
        ))}
      </div>
    </section>
  );
}

function BrandCard({
  brand,
  onClick,
}: {
  brand: (typeof BRANDS)[0];
  onClick: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      onClick={onClick}
      className="relative flex-none w-[200px] h-[260px] rounded-2xl overflow-hidden group cursor-pointer text-left snap-start shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-1.5"
    >
      {/* Background image */}
      {!failed ? (
        <img
          src={brand.image}
          alt={brand.name}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(160deg, ${brand.color} 0%, #1a1a1a 100%)` }}
        />
      )}

      {/* Gradient scrim — stronger at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

      {/* Colored tint on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-400"
        style={{ background: brand.color }}
      />

      {/* Top: Tag badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span
          className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full text-white backdrop-blur-sm border border-white/15"
          style={{ background: brand.color + "cc" }}
        >
          {brand.featured && <Verified size={8} />}
          {brand.tag}
        </span>

        {/* Arrow — reveals on hover */}
        <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
          <ArrowUpRight size={13} />
        </div>
      </div>

      {/* Bottom: Glass pill info */}
      <div className="absolute bottom-0 inset-x-0 p-3">
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-3 group-hover:bg-white/18 transition-colors duration-300">
          <h3 className="text-white font-black text-[15px] leading-tight tracking-tight">
            {brand.name}
          </h3>
          <p className="text-white/65 text-[10.5px] font-medium mt-0.5 leading-snug line-clamp-1">
            {brand.subtitle}
          </p>

          {/* Animated CTA line */}
          <div className="flex items-center gap-1 mt-2 overflow-hidden">
            <div
              className="h-[1.5px] flex-1 rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300"
              style={{ background: "white" }}
            />
            <span className="text-[9px] font-extrabold tracking-widest text-white/70 group-hover:text-white transition-colors duration-300 uppercase">
              Shop
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
