"use client";

import Link from "next/link";
import { Play, Leaf } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      tag: "New Collection",
      title: "Natural. Pure. You.",
      description: "Discover organic and eco-friendly products for a better and healthier life.",
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1000&auto=format&fit=crop",
      link: "/products"
    },
    {
      tag: "Organic Living",
      title: "Organic Wellness.",
      description: "Nourish your body and mind with our curated collection of organic teas and botanicals.",
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1000&auto=format&fit=crop",
      link: "/products"
    },
    {
      tag: "Eco Friendly",
      title: "Eco Sustainable.",
      description: "High quality eco-friendly essentials designed to reduce waste and heal our planet.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
      link: "/products"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="flex-1 bg-gradient-to-br from-mint-200 to-mint-100 rounded-[32px] overflow-hidden relative shadow-sm h-[500px]">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative h-full w-full">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div 
              key={idx}
              className={`absolute inset-0 flex flex-col md:flex-row h-full transition-all duration-700 ease-in-out ${
                isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-98 pointer-events-none z-0"
              }`}
            >
              {/* Slide Content */}
              <div className="flex-grow md:w-1/2 p-8 md:p-12 lg:pl-16 lg:pr-8 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-1.5 rounded-full text-mint-900 text-xs font-bold w-fit mb-6 shadow-sm">
                  <Leaf size={14} className="text-mint-700" />
                  {slide.tag}
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black text-mint-900 leading-[1.1] tracking-tight mb-4">
                  {slide.title}
                </h1>
                
                <p className="text-mint-900/70 text-base lg:text-lg max-w-md mb-8 font-medium">
                  {slide.description}
                </p>
                
                <div className="flex items-center gap-6">
                  <Link 
                    href={slide.link} 
                    className="bg-mint-800 hover:bg-mint-900 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-mint-800/10 hover:shadow-mint-800/20 active:scale-98"
                  >
                    Shop Now
                  </Link>
                  
                  <Link href="/categories" className="flex items-center gap-3 text-mint-900 font-bold hover:text-mint-700 transition-colors group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                      <Play size={16} className="text-mint-800 fill-mint-800 ml-1" />
                    </div>
                    <span>View Collection</span>
                  </Link>
                </div>
              </div>
              
              {/* Slide Image */}
              <div className="flex-grow md:w-1/2 relative h-64 md:h-full overflow-hidden">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out scale-100"
                />
                
                {/* Visual Overlay to smooth edge boundary */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-mint-100/50 via-mint-100/10 to-transparent hidden md:block pointer-events-none"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Slider dots overlay */}
      <div className="absolute bottom-6 left-[50%] md:left-[75%] -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === activeSlide ? "w-8 h-2.5 bg-mint-800" : "w-2.5 h-2.5 bg-mint-300 hover:bg-mint-450"
            }`}
            title={`Go to Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
