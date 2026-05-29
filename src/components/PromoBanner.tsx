import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  bgColor: string; // Tailiwind class like "bg-green-600" or a custom hex if handled dynamically
  textColor?: string;
  btnStyle?: string;
  image?: string;
}

export default function PromoBanner({ 
  title, 
  subtitle, 
  bgColor, 
  textColor = "text-mint-900 dark:text-slate-900",
  btnStyle = "bg-white dark:bg-slate-900 text-gray-900 dark:text-white",
  image
}: PromoBannerProps) {
  // Using custom inline style for dynamic glass colors or rely on Tailwind utility injection
  return (
    <div className={`glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[220px] group`}>
      <div className={`absolute inset-0 opacity-80 dark:opacity-40 pointer-events-none -z-10 ${bgColor}`}></div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent dark:from-black/40 pointer-events-none -z-10"></div>
      
      <div className="relative z-10 w-2/3">
        <p className={`text-sm font-bold mb-2 tracking-wide uppercase opacity-90 ${textColor}`}>{subtitle}</p>
        <h3 className={`text-3xl font-extrabold mb-6 leading-tight tracking-tight ${textColor}`}>{title}</h3>
        <button className={`${btnStyle} inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all`}>
          Shop Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Optional Image */}
      {image && (
        <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-end overflow-hidden z-0 pointer-events-none">
          <div className="relative w-[150%] h-[150%] translate-x-1/4 group-hover:scale-105 transition-transform duration-700">
            <Image
              src={image} 
              alt={title} 
              fill
              sizes="(max-width: 768px) 80vw, 400px"
              className="absolute inset-0 w-full h-full object-cover object-left-top opacity-90 mix-blend-multiply dark:mix-blend-screen" 
            />
            {/* Gradient mask to blend smoothly with background */}
            <div className={`absolute inset-0 bg-gradient-to-r from-[${bgColor}] to-transparent mix-blend-normal`}></div>
          </div>
        </div>
      )}
      
      {/* Abstract/Placeholder Decoration */}
      {!image && (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-4 opacity-50 mix-blend-overlay pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700">
           <div className="w-40 h-40 rounded-full bg-black/20 blur-2xl"></div>
           <div className="w-32 h-32 rounded-full bg-white/40 blur-xl -ml-16"></div>
        </div>
      )}
    </div>
  );
}
