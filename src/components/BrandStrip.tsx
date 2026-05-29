import { brandLogos } from "@/lib/data";

export default function BrandStrip() {
  const marqueeBrands = [...brandLogos, ...brandLogos];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl px-6 py-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-8 mb-8 overflow-hidden">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:block shrink-0">
        Top Brands
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden brand-marquee-mask">
        <div className="flex w-max items-center gap-10 md:gap-14 brand-marquee opacity-70 hover:opacity-100">
          {marqueeBrands.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="brand-display-font text-2xl md:text-3xl text-gray-700 dark:text-gray-200 whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              {brand.logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
