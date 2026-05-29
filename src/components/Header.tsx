"use client";

import Link from "next/link";
import { Search, ShoppingBag, Heart, ShoppingCart, User, Menu, Truck, Star, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDBValue } from "@/lib/db";
import { Product, User as UserType } from "@/lib/types";
import { executeElasticSearch } from "@/lib/elastic";

export function Header() {
  const { cartCount, addItem } = useCart();
  const { wishlist } = useWishlist();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allProducts = useDBValue<Product[]>("greenmart_products") || [];
  const currentUser = useDBValue<UserType | null>("greenmart_current_user");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFocused(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Live search resolution via our simulated Elasticsearch engine
  const elasticResponse = useMemo(() => {
    if (!searchQuery.trim()) return null;

    return executeElasticSearch(allProducts, {
      query: {
        multi_match: {
          query: searchQuery,
          fields: ["name^3", "tags^2", "description^1"],
          fuzziness: "AUTO"
        }
      },
      size: 5,
      highlight: {
        pre_tags: ["<mark class='bg-amber-200 text-amber-950 font-bold px-0.5 rounded not-italic'>"],
        post_tags: ["</mark>"],
        fields: {
          name: {},
          description: {}
        }
      }
    });
  }, [allProducts, searchQuery]);

  const searchResults = elasticResponse?.hits.hits || [];
  const totalHits = elasticResponse?.hits.total.value || 0;
  const bestMatch = searchResults[0];
  const otherResults = searchResults.slice(1);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsFocused(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigateToProduct = (slug: string) => {
    setIsFocused(false);
    setSearchQuery("");
    router.push(`/product/${slug}`);
  };

  const handleViewAll = () => {
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="w-full pt-6 pb-2 z-50 relative">
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-6 mb-2">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="text-mint-800 transition-colors">
            <ShoppingBag size={28} className="fill-mint-800 text-white" />
          </div>
          <span className="text-2xl font-bold text-mint-900 hidden sm:block tracking-tight">GreenMart</span>
        </Link>

        {/* Live Search Bar Wrapper */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block relative" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative group flex items-center z-50">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search for products, brands and more..." 
              className="w-full bg-white rounded-full py-3 pl-6 pr-14 text-mint-900 placeholder:text-mint-600/50 focus:outline-none shadow-sm text-sm border border-transparent focus:border-mint-200 transition-all"
            />
            <button type="submit" className="absolute right-2 w-9 h-9 rounded-full bg-mint-800 hover:bg-mint-900 text-white flex items-center justify-center transition-colors">
              <Search size={16} />
            </button>
          </form>

          {/* Instant live dropdown search results */}
          {isFocused && searchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-3xl border border-mint-100 shadow-2xl z-40 overflow-hidden max-h-[580px] flex flex-col">
              
              {/* Header metrics */}
              <div className="bg-mint-50/50 px-6 py-2.5 border-b border-mint-100 flex justify-between items-center text-xs font-semibold text-mint-700/80">
                <span className="flex items-center gap-1">
                  <Zap size={12} className="text-amber-500 fill-amber-500" />
                  Live Elasticsearch Results
                </span>
                <span>Found {totalHits} hit{totalHits !== 1 && 's'} in {elasticResponse?.took || 0}ms</span>
              </div>

              {searchResults.length > 0 ? (
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-mint-100">
                  
                  {/* Left showcase: BEST MATCH */}
                  <div className="flex-1 p-5 bg-gradient-to-br from-mint-50/30 to-transparent flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider w-fit mb-3">
                        <Star size={10} className="fill-amber-500 text-amber-500" /> Best Match
                      </div>

                      <div 
                        onClick={() => navigateToProduct(bestMatch._source.slug)}
                        className="flex gap-4 cursor-pointer group/best"
                      >
                        <div className="w-20 h-20 rounded-xl bg-white p-2 border border-mint-100 shadow-sm shrink-0 flex items-center justify-center">
                          <img 
                            src={bestMatch._source.image} 
                            alt={bestMatch._source.name} 
                            className="max-h-full object-contain mix-blend-multiply group-hover/best:scale-105 transition-transform" 
                          />
                        </div>
                        <div>
                          <h4 
                            className="font-bold text-mint-900 text-sm group-hover/best:text-mint-700 transition-colors line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: bestMatch.highlight?.name?.[0] || bestMatch._source.name }}
                          />
                          <span className="text-[10px] text-mint-500 font-bold uppercase tracking-wider mt-0.5 block">{bestMatch._source.brand}</span>
                          
                          <div className="flex items-center gap-1 mt-1 text-amber-400">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold text-mint-900">{bestMatch._source.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-mint-100/50 flex justify-between items-center">
                      <span className="text-base font-extrabold text-mint-900">${bestMatch._source.price.toFixed(2)}</span>
                      <button
                        onClick={() => addItem(bestMatch._source)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint-800 hover:bg-mint-900 text-white text-[11px] font-bold transition-all shadow-sm"
                      >
                        <ShoppingCart size={12} /> Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Right list: OTHER SUGGESTIONS */}
                  {otherResults.length > 0 && (
                    <div className="w-full md:w-[280px] p-4 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-mint-600/70 uppercase tracking-wider px-2 mb-1">More Relevant Matches</span>
                      
                      <div className="flex flex-col gap-1.5">
                        {otherResults.map((hit) => (
                          <div 
                            key={hit._source.id}
                            onClick={() => navigateToProduct(hit._source.slug)}
                            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-mint-50/70 cursor-pointer transition-colors group/row"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white p-1 border border-mint-100 shrink-0 flex items-center justify-center">
                              <img src={hit._source.image} alt={hit._source.name} className="max-h-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 
                                className="text-xs font-bold text-mint-900 group-hover/row:text-mint-700 transition-colors line-clamp-1 min-w-0"
                                dangerouslySetInnerHTML={{ __html: hit.highlight?.name?.[0] || hit._source.name }}
                              />
                              <span className="text-[10px] font-bold text-mint-900/80">${hit._source.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-8 text-center bg-mint-50/10">
                  <Search size={32} className="mx-auto text-mint-300 mb-2" />
                  <h5 className="font-bold text-mint-900 text-sm">No results match your query</h5>
                  <p className="text-xs text-mint-700/80 mt-1">Check spelling or search for alternative items.</p>
                </div>
              )}

              {/* View all footer */}
              {searchResults.length > 0 && (
                <button
                  onClick={handleViewAll}
                  className="w-full py-3 bg-mint-800 hover:bg-mint-900 text-white font-bold text-xs uppercase tracking-wider text-center border-t border-mint-200 transition-all flex items-center justify-center gap-1.5"
                >
                  View All {totalHits} Result{totalHits !== 1 && 's'} <Search size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Icons Right */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/account/orders" className="hidden lg:flex items-center gap-2 text-mint-900 hover:text-mint-700 transition-colors">
            <Truck size={20} />
            <span className="text-sm font-semibold">Track Order</span>
          </Link>
          
          {currentUser && (
            <Link href="/account/marked" className="relative flex items-center gap-2 text-mint-900 hover:text-mint-700 transition-colors">
              <div className="relative">
                <Heart size={22} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-mint-800 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold hidden lg:block">Wishlist</span>
            </Link>
          )}
          
          <Link href="/cart" className="relative flex items-center gap-2 text-mint-900 hover:text-mint-700 transition-colors">
            <div className="relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-mint-800 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold hidden lg:block">Cart</span>
          </Link>

          <Link href="/account" className="hidden lg:block text-mint-900 hover:text-mint-700 transition-colors shrink-0">
            {currentUser?.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="w-7 h-7 rounded-full object-cover border border-mint-250 shadow-xs hover:scale-105 transition-transform"
              />
            ) : (
              <User size={22} />
            )}
          </Link>
          
          <Link href="/categories" className="md:hidden text-mint-900" aria-label="Browse categories">
            <Menu size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
}
