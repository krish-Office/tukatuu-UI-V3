"use client";

import { use, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { ProductCard } from "@/components/ProductCard";
import { useDBValue } from "@/lib/db";
import { Product, Category } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  
  const allProducts = useDBValue<Product[]>("greenmart_products") || [];
  const categories = useDBValue<Category[]>("greenmart_categories") || [];
  
  const categoryProducts = useMemo(() => {
    return allProducts.filter(p => p.category === resolvedParams.slug);
  }, [allProducts, resolvedParams.slug]);

  const category = categories.find(c => c.slug === resolvedParams.slug);

  const [filters, setFilters] = useState<FilterState>({
    selectedCategories: [],
    selectedBrands: [],
    minPrice: 0,
    maxPrice: 500
  });

  const [sortBy, setSortBy] = useState<string>("Featured");

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    categoryProducts.forEach(p => brands.add(p.brand));
    return Array.from(brands);
  }, [categoryProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

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
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [categoryProducts, filters, sortBy]);

  if (allProducts.length > 0 && categories.length > 0 && !category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-mint-900 mb-4">Category Not Found</h1>
            <Link href="/products" className="text-mint-700 hover:underline">View All Products</Link>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-mint-100/50 border-b border-mint-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-mint-900 mb-2">{category?.name || "Category"}</h1>
          <p className="text-mint-700/80">Explore our premium selection of {category?.name?.toLowerCase() || "these"} products.</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters}
            availableBrands={availableBrands}
            availableCategories={categories}
            hideCategoryFilter={true}
          />
          
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
            
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-mint-200 shadow-sm py-16">
                <h2 className="text-xl font-bold text-mint-900 mb-2">No products found</h2>
                <p className="text-mint-700 mb-6">We couldn&apos;t find any products matching your filters.</p>
                <button 
                  onClick={() => setFilters({ selectedCategories: [], selectedBrands: [], minPrice: 0, maxPrice: 500 })}
                  className="bg-mint-700 hover:bg-mint-800 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
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
