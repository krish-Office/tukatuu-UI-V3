"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useDBValue } from "@/lib/db";
import { Product } from "@/lib/types";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Terminal, 
  Copy, 
  Check, 
  Info, 
  Zap, 
  Star, 
  ShoppingCart,
  Filter,
  RotateCcw
} from "lucide-react";
import { executeElasticSearch, ElasticSearchRequest, ElasticSearchResponse } from "@/lib/elastic";

export default function SearchPage() {
  const allProducts = useDBValue<Product[]>("greenmart_products") || [];
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("q") || "";

  // Search state
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("_score"); // _score, price_asc, price_desc, rating_desc
  const [enableFuzzy, setEnableFuzzy] = useState<boolean>(true);

  // Sync state if URL search param changes (e.g. from header search)
  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  // UI state
  const [devToolsOpen, setDevToolsOpen] = useState<boolean>(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"request" | "response">("request");
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // 1. Build Elasticsearch Query DSL Request Payload
  const elasticQuery = useMemo((): ElasticSearchRequest => {
    const request: ElasticSearchRequest = {
      query: {
        bool: {
          must: [],
          filter: []
        }
      },
      size: 50,
      from: 0,
      highlight: {
        pre_tags: ["<mark class='bg-amber-200 text-amber-950 font-bold px-1 rounded not-italic border border-amber-300 shadow-sm'>"],
        post_tags: ["</mark>"],
        fields: {
          name: {},
          description: {},
          tags: {}
        }
      },
      aggs: {
        categories: {
          terms: {
            field: "category",
            size: 10
          }
        },
        brands: {
          terms: {
            field: "brand",
            size: 10
          }
        }
      }
    };

    // Text search multi-match
    if (searchQuery.trim()) {
      request.query!.bool!.must!.push({
        multi_match: {
          query: searchQuery,
          fields: ["name^3", "tags^2", "description^1"],
          fuzziness: enableFuzzy ? "AUTO" : undefined
        }
      });
    }

    // Category filter
    if (selectedCategory) {
      request.query!.bool!.filter!.push({
        term: { category: selectedCategory }
      });
    }

    // Brand filter
    if (selectedBrand) {
      request.query!.bool!.filter!.push({
        term: { brand: selectedBrand }
      });
    }

    // Price range filters
    const gte = minPrice ? parseFloat(minPrice) : undefined;
    const lte = maxPrice ? parseFloat(maxPrice) : undefined;
    if (gte !== undefined || lte !== undefined) {
      request.query!.bool!.filter!.push({
        range: {
          price: { gte, lte }
        }
      });
    }

    // Sorting
    if (sortBy === "price_asc") {
      request.sort = [{ price: { order: "asc" } }];
    } else if (sortBy === "price_desc") {
      request.sort = [{ price: { order: "desc" } }];
    } else if (sortBy === "rating_desc") {
      request.sort = [{ rating: { order: "desc" } }];
    } else {
      request.sort = ["_score"];
    }

    return request;
  }, [searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, enableFuzzy]);

  // 2. Execute simulated Elasticsearch query
  const elasticResponse = useMemo((): ElasticSearchResponse => {
    return executeElasticSearch(allProducts, elasticQuery);
  }, [allProducts, elasticQuery]);

  // 3. Extract results and aggregated facets from response
  const searchResults = elasticResponse.hits.hits;
  const totalResults = elasticResponse.hits.total.value;
  const searchTimeMs = elasticResponse.took;
  const maxScore = elasticResponse.hits.max_score;

  const categoryAggs = elasticResponse.aggregations?.categories?.buckets || [];
  const brandAggs = elasticResponse.aggregations?.brands?.buckets || [];

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("_score");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-mint-50/20">
      <Header />

      {/* Banner & Global Input */}
      <div className="bg-gradient-to-r from-mint-100 to-mint-50 border-b border-mint-200 py-10 shadow-sm relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 bg-mint-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Zap size={12} className="fill-white" /> Elasticsearch Mode
            </span>
            <h1 className="text-4xl font-extrabold text-mint-900 tracking-tight">Search Catalog</h1>
            <p className="text-mint-700 font-medium text-sm mt-1">Full-text search, multi-field boosts, fuzzy typo-tolerance, and dynamic aggs.</p>
          </div>

          <div className="relative max-w-3xl mx-auto shadow-md rounded-2xl bg-white p-2 flex flex-col md:flex-row gap-2 border border-mint-100">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (typeof window !== "undefined") {
                    const params = new URLSearchParams(window.location.search);
                    if (val.trim()) {
                      params.set("q", val);
                    } else {
                      params.delete("q");
                    }
                    window.history.replaceState(null, "", `?${params.toString()}`);
                  }
                }}
                placeholder="Search products, ingredients, organic qualities..."
                className="w-full bg-transparent py-3.5 pl-11 pr-4 text-mint-900 text-lg placeholder:text-mint-500/60 focus:outline-none"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mint-600" size={22} />
            </div>

            <div className="flex items-center justify-between border-t md:border-t-0 md:border-l border-mint-100 pt-2 md:pt-0 md:pl-4 px-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={enableFuzzy}
                  onChange={(e) => setEnableFuzzy(e.target.checked)}
                  className="w-4 h-4 rounded text-mint-800 focus:ring-mint-500 accent-mint-800"
                />
                <span className="text-xs font-bold text-mint-800 uppercase tracking-wider">Fuzzy Match</span>
              </label>

              <button
                onClick={() => setDevToolsOpen(!devToolsOpen)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  devToolsOpen 
                    ? "bg-mint-800 text-white" 
                    : "bg-mint-100 hover:bg-mint-200 text-mint-800"
                }`}
              >
                <Terminal size={14} /> DevTools
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mt-4 text-[13px] text-mint-700/80 font-semibold bg-white/40 backdrop-blur px-4 py-2 rounded-full w-fit mx-auto border border-white/40">
            <span>Took: <strong className="text-mint-900">{searchTimeMs}ms</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint-300"></span>
            <span>Total Hits: <strong className="text-mint-900">{totalResults}</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint-300"></span>
            <span>Max Score: <strong className="text-mint-900">{maxScore.toFixed(2)}</strong></span>
            {searchQuery.trim() && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-mint-300"></span>
                <span className="italic">DSL query generated live</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Body Layout */}
      <main className="flex-grow container mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Sidebar Filters */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
            
            {/* Header & Reset */}
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-mint-100 shadow-sm">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-mint-800" />
                <h3 className="font-bold text-mint-900 text-sm">Filter Options</h3>
              </div>
              <button 
                onClick={resetFilters} 
                className="text-xs font-bold text-mint-700 hover:text-mint-900 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Category facet from aggs */}
            <div className="bg-white p-5 rounded-3xl border border-mint-100 shadow-sm">
              <h4 className="font-bold text-mint-900 text-sm mb-4 border-b border-mint-100 pb-2">Category Facets</h4>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`text-left text-sm font-semibold py-1.5 px-3 rounded-lg flex justify-between items-center ${
                    !selectedCategory ? "bg-mint-800 text-white" : "text-mint-800 hover:bg-mint-50"
                  }`}
                >
                  <span>All Categories</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${!selectedCategory ? "bg-white/20 text-white" : "bg-mint-100 text-mint-800"}`}>
                    {allProducts.length}
                  </span>
                </button>

                {categoryAggs.map((bucket) => (
                  <button
                    key={bucket.key}
                    onClick={() => setSelectedCategory(bucket.key)}
                    className={`text-left text-sm font-semibold py-1.5 px-3 rounded-lg flex justify-between items-center capitalize ${
                      selectedCategory === bucket.key ? "bg-mint-800 text-white" : "text-mint-800 hover:bg-mint-50"
                    }`}
                  >
                    <span>{bucket.key.replace("-", " ")}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === bucket.key ? "bg-white/20 text-white" : "bg-mint-100 text-mint-800"}`}>
                      {bucket.doc_count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand facet from aggs */}
            <div className="bg-white p-5 rounded-3xl border border-mint-100 shadow-sm">
              <h4 className="font-bold text-mint-900 text-sm mb-4 border-b border-mint-100 pb-2">Brand Facets</h4>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedBrand("")}
                  className={`text-left text-sm font-semibold py-1.5 px-3 rounded-lg flex justify-between items-center ${
                    !selectedBrand ? "bg-mint-800 text-white" : "text-mint-800 hover:bg-mint-50"
                  }`}
                >
                  <span>All Brands</span>
                </button>

                {brandAggs.map((bucket) => (
                  <button
                    key={bucket.key}
                    onClick={() => setSelectedBrand(bucket.key)}
                    className={`text-left text-sm font-semibold py-1.5 px-3 rounded-lg flex justify-between items-center ${
                      selectedBrand === bucket.key ? "bg-mint-800 text-white" : "text-mint-800 hover:bg-mint-50"
                    }`}
                  >
                    <span>{bucket.key}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedBrand === bucket.key ? "bg-white/20 text-white" : "bg-mint-100 text-mint-800"}`}>
                      {bucket.doc_count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter range */}
            <div className="bg-white p-5 rounded-3xl border border-mint-100 shadow-sm">
              <h4 className="font-bold text-mint-900 text-sm mb-4 border-b border-mint-100 pb-2">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-mint-50 border border-mint-200 rounded-xl px-3 py-2 text-sm text-mint-900 placeholder:text-mint-400 focus:outline-none focus:border-mint-500"
                />
                <span className="text-mint-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-mint-50 border border-mint-200 rounded-xl px-3 py-2 text-sm text-mint-900 placeholder:text-mint-400 focus:outline-none focus:border-mint-500"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Search Results & DevTools */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Toolbar controls */}
            <div className="bg-white p-4 rounded-2xl border border-mint-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm font-semibold text-mint-900">
                {searchQuery.trim() ? (
                  <span>
                    Showing <strong className="text-mint-900">{totalResults}</strong> result{totalResults !== 1 && "s"} for "{searchQuery}"
                  </span>
                ) : (
                  <span>Showing all catalog products ({totalResults})</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-mint-700 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown size={14} /> Sort By
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-mint-50 border border-mint-200 rounded-xl py-1.5 px-3 text-sm font-semibold text-mint-900 focus:outline-none focus:border-mint-500"
                >
                  <option value="_score">Relevance Score</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Top Rated</option>
                </select>
              </div>
            </div>

            {/* DevTools DSL Console Drawer */}
            {devToolsOpen && (
              <div className="bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col h-[480px]">
                
                {/* Console tabs */}
                <div className="bg-slate-950 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-sm font-bold tracking-tight text-slate-200 font-mono">Elasticsearch DevTools Query Console</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(
                        activeConsoleTab === "request"
                          ? JSON.stringify(elasticQuery, null, 2)
                          : JSON.stringify(elasticResponse, null, 2)
                      )}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 flex items-center gap-1.5 text-xs font-bold"
                    >
                      {copiedText ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      {copiedText ? "Copied" : "Copy"}
                    </button>
                    <button 
                      onClick={() => setDevToolsOpen(false)}
                      className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800/50 hover:bg-slate-800"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex border-b border-slate-800 bg-slate-950/40">
                  <button
                    onClick={() => setActiveConsoleTab("request")}
                    className={`px-6 py-3 font-mono text-xs font-bold transition-all border-b-2 ${
                      activeConsoleTab === "request"
                        ? "border-amber-500 text-amber-400 bg-slate-900/80"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    POST /greenmart_products/_search (Query DSL)
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("response")}
                    className={`px-6 py-3 font-mono text-xs font-bold transition-all border-b-2 ${
                      activeConsoleTab === "response"
                        ? "border-amber-500 text-amber-400 bg-slate-900/80"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    HTTP/1.1 200 OK (Response JSON)
                  </button>
                </div>

                {/* Console editor body */}
                <div className="flex-1 p-6 overflow-auto font-mono text-[13px] leading-relaxed bg-slate-950/10">
                  {activeConsoleTab === "request" ? (
                    <pre className="text-amber-300/90 whitespace-pre-wrap">
                      {JSON.stringify(elasticQuery, null, 2)}
                    </pre>
                  ) : (
                    <pre className="text-cyan-400 whitespace-pre-wrap">
                      {JSON.stringify(elasticResponse, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Results rendering */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.map((hit) => {
                  const product = hit._source;
                  const highlightedName = hit.highlight?.name?.[0] || product.name;
                  const highlightedDesc = hit.highlight?.description?.[0] || product.description;

                  return (
                    <div 
                      key={product.id} 
                      className="group flex flex-col bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full relative p-5 border border-mint-100 shadow-sm"
                    >
                      {/* Elastic Score Badge */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
                        <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Zap size={10} className="fill-amber-600 text-amber-600" />
                          score: {hit._score.toFixed(2)}
                        </span>
                        
                        {product.discount && (
                          <span className="bg-mint-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      <div className="relative h-44 mb-4 flex items-center justify-center overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1">
                        
                        {/* Highlights rendered as html safely */}
                        <h3 
                          className="font-bold text-mint-900 text-base mb-1 hover:text-mint-700 transition-colors line-clamp-1"
                          dangerouslySetInnerHTML={{ __html: highlightedName }}
                        />

                        {/* Brand info */}
                        <div className="text-xs text-mint-600/70 font-semibold mb-2 capitalize">
                          by <strong className="text-mint-800">{product.brand}</strong> in <strong className="text-mint-800">{product.category.replace("-", " ")}</strong>
                        </div>
                        
                        <div className="flex items-center gap-1 text-amber-400 mb-3">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span className="text-[11px] font-bold text-mint-900">{product.rating}</span>
                          <span className="text-[11px] text-mint-600/70">({product.reviews} reviews)</span>
                        </div>

                        {/* Description highlighted */}
                        <p 
                          className="text-xs text-mint-700/80 mb-4 line-clamp-2 leading-relaxed flex-1"
                          dangerouslySetInnerHTML={{ __html: highlightedDesc }}
                        />
                        
                        {/* Tags highlight */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {product.tags.map((tag, idx) => {
                              const highlightedTag = hit.highlight?.tags?.[0] && hit.highlight.tags[0].includes(tag) 
                                ? hit.highlight.tags[0] 
                                : tag;
                              return (
                                <span 
                                  key={idx} 
                                  className="text-[10px] bg-mint-50/80 text-mint-800 font-semibold px-2 py-0.5 rounded border border-mint-100/50"
                                  dangerouslySetInnerHTML={{ __html: highlightedTag }}
                                />
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-mint-100/40">
                          <div className="flex items-end gap-2">
                            <span className="text-lg font-extrabold text-mint-900">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.oldPrice && (
                              <span className="text-xs text-mint-700 line-through mb-0.5">
                                ${product.oldPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => addItem(product)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-mint-700 text-xs font-bold text-mint-700 hover:bg-mint-700 hover:text-white transition-colors"
                          >
                            <ShoppingCart size={13} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-mint-100/30 rounded-3xl border border-mint-200/40 max-w-3xl mx-auto w-full px-6 shadow-sm">
                <Search size={48} className="mx-auto text-mint-300 mb-4" />
                <h2 className="text-xl font-bold text-mint-900 mb-2">No products found</h2>
                <p className="text-mint-700/80 mb-6 max-w-md mx-auto">
                  We couldn't find anything matching your query using Elasticsearch fuzzy logic. Try using spelling suggestions or resetting filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-mint-800 hover:bg-mint-900 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all"
                >
                  Reset All Filters
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
