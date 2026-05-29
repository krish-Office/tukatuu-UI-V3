import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { popularCategories } from "@/lib/data";

export default function CategoryCarousel() {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-mint-900 tracking-tight">Explore Popular Categories</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full border border-mint-200 flex items-center justify-center text-mint-600 hover:text-mint-900 hover:border-mint-300 transition-colors">
            <span className="sr-only">Previous</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full border border-mint-200 flex items-center justify-center text-mint-600 hover:text-mint-900 hover:border-mint-300 transition-colors">
            <span className="sr-only">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {popularCategories.map((category, index) => (
          <div key={index} className="flex flex-col items-center gap-3 min-w-[100px] cursor-pointer group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-mint-50/30 border border-mint-200 group-hover:border-mint-600 transition-all p-1 shadow-sm group-hover:shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-mint-100/50">
                <Image
                  src={category.image} 
                  alt={category.name}
                  fill
                  sizes="96px"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-mint-800 group-hover:text-mint-600 transition-colors text-center">
              {category.name}
            </span>
          </div>
        ))}
        
        {/* View All Button */}
        <div className="flex flex-col items-center justify-center gap-3 min-w-[100px] cursor-pointer group">
          <div className="w-24 h-24 rounded-full bg-mint-50/30 flex items-center justify-center border border-mint-200 group-hover:bg-mint-800 group-hover:border-mint-800 transition-all shadow-sm">
            <ChevronRight className="w-8 h-8 text-mint-650 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-semibold text-mint-800 group-hover:text-mint-600 transition-colors text-center">
            View All
          </span>
        </div>
      </div>
    </section>
  );
}
