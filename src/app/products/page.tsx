"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { ProductCard } from "@/components/ProductCard";
import { useDBValue } from "@/lib/db";
import { Product, Category } from "@/lib/types";
import { ChevronDown } from "lucide-react";

export default function ProductsPage() {
  const products = useDBValue<Product[]>("greenmart_products") || [];
  const categories = useDBValue<Category[]>("greenmart_categories") || [];
  
  const [filters, setFilters] = useState<FilterState>({
    selectedCategories: [],
    selectedBrands: [],
    minPrice: 0,
    maxPrice: 500
  });

  // Parse brand and category query parameters from URL safely on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const brandParam = params.get("brand");
      const categoryParam = params.get("category");
      
      if (brandParam || categoryParam) {
        setFilters(prev => ({
          ...prev,
          selectedBrands: brandParam ? [brandParam] : prev.selectedBrands,
          selectedCategories: categoryParam ? [categoryParam] : prev.selectedCategories
        }));
      }
    }
  }, []);

  const [sortBy, setSortBy] = useState<string>("Featured");

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => brands.add(p.brand));
    return Array.from(brands);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Categories
    if (filters.selectedCategories.length > 0) {
      result = result.filter(p => filters.selectedCategories.includes(p.category));
    }

    // Filter by Brands
    if (filters.selectedBrands.length > 0) {
      result = result.filter(p => filters.selectedBrands.includes(p.brand));
    }

    // Filter by Price
    result = result.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    // Sorting
    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Customer Rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "Newest Arrivals":
        // Fallback for newest (using isNew or ID)
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, filters, sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-mint-100/50 border-b border-mint-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-mint-900 mb-2">All Products</h1>
          <p className="text-mint-700/80">Browse our complete collection of natural and organic products.</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters}
            availableBrands={availableBrands}
            availableCategories={categories}
          />
          
          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-mint-700/80 font-medium">
                Showing <span className="font-bold text-mint-900">{filteredProducts.length}</span> results
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mint-700">Sort by:</span>
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-mint-200 rounded-lg py-2 pl-3 pr-10 text-sm text-mint-900 font-medium focus:outline-none focus:ring-1 focus:ring-mint-500 cursor-pointer"
                    >
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest Arrivals</option>
                      <option>Customer Rating</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-mint-700 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-mint-100/50 rounded-2xl border border-mint-100">
                <h3 className="text-xl font-bold text-mint-900 mb-2">No products found</h3>
                <p className="text-mint-700">Try adjusting your filters to find what you&apos;re looking for.</p>
                <button 
                  onClick={() => setFilters({ selectedCategories: [], selectedBrands: [], minPrice: 0, maxPrice: 500 })}
                  className="mt-4 bg-mint-700 hover:bg-mint-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
