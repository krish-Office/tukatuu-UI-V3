"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, Check } from "lucide-react";
import { Category } from "@/lib/types";

export interface FilterState {
  selectedCategories: string[];
  selectedBrands: string[];
  minPrice: number;
  maxPrice: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableBrands: string[];
  availableCategories: Category[];
  hideCategoryFilter?: boolean;
}

export function FilterSidebar({ filters, setFilters, availableBrands, availableCategories, hideCategoryFilter }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (slug: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(slug)
        ? prev.selectedCategories.filter(c => c !== slug)
        : [...prev.selectedCategories, slug]
    }));
  };

  const handleBrandToggle = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter(b => b !== brand)
        : [...prev.selectedBrands, brand]
    }));
  };

  const handleMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }));
  };

  const handleMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }));
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 bg-white border border-mint-200 px-4 py-2 rounded-lg text-mint-800 font-bold w-full justify-center mb-4 shadow-sm"
      >
        <Filter size={18} />
        Filter Products
      </button>

      {/* Filter Sidebar overlay (mobile) */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl border-r border-mint-200 p-6 overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0 lg:w-64 lg:bg-transparent lg:border-none lg:p-0 lg:block lg:z-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between lg:hidden mb-6">
          <h2 className="text-xl font-bold text-mint-900">Filters</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-mint-100 rounded-full text-mint-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Categories */}
          {!hideCategoryFilter && (
            <div>
              <h3 className="font-bold text-mint-900 mb-4 flex items-center justify-between">
                Categories
                <ChevronDown size={16} className="text-mint-400" />
              </h3>
              <div className="space-y-2">
                {availableCategories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 border border-mint-300 rounded bg-white group-hover:border-mint-500 transition-all has-[:checked]:bg-mint-800 has-[:checked]:border-mint-800">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={filters.selectedCategories.includes(cat.slug)}
                        onChange={() => handleCategoryToggle(cat.slug)}
                      />
                      <div className="hidden peer-checked:block text-white">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                    <span className="text-sm text-mint-700 group-hover:text-mint-900 transition-colors">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <h3 className="font-bold text-mint-900 mb-4 flex items-center justify-between">
              Price Range
              <ChevronDown size={16} className="text-mint-400" />
            </h3>
            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="500" 
                value={filters.maxPrice}
                onChange={handleMaxPrice}
                className="w-full accent-mint-600" 
              />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-xs text-mint-700 mb-1 block">Min ($)</span>
                  <input 
                    type="number" 
                    value={filters.minPrice}
                    onChange={handleMinPrice}
                    className="w-full bg-white border border-mint-200 rounded p-2 text-sm text-mint-900 focus:outline-none focus:ring-1 focus:ring-mint-500" 
                  />
                </div>
                <div className="text-mint-400 mt-5">-</div>
                <div className="flex-1">
                  <span className="text-xs text-mint-700 mb-1 block">Max ($)</span>
                  <input 
                    type="number" 
                    value={filters.maxPrice}
                    onChange={handleMaxPrice}
                    className="w-full bg-white border border-mint-200 rounded p-2 text-sm text-mint-900 focus:outline-none focus:ring-1 focus:ring-mint-500" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-bold text-mint-900 mb-4 flex items-center justify-between">
              Brands
              <ChevronDown size={16} className="text-mint-400" />
            </h3>
            <div className="space-y-2">
              {availableBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border border-mint-300 rounded bg-white group-hover:border-mint-500 transition-all has-[:checked]:bg-mint-800 has-[:checked]:border-mint-800">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={filters.selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <div className="hidden peer-checked:block text-white">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                  <span className="text-sm text-mint-700 group-hover:text-mint-900 transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
