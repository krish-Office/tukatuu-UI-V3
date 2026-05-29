import { ChevronRight } from "lucide-react";

interface ProductRowProps {
  title: string;
  children: React.ReactNode;
}

export default function ProductRow({ title, children }: ProductRowProps) {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
    </section>
  );
}
