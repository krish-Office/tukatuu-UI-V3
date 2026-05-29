"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "./types";

export const mockCategories: Category[] = [
  { id: "1", name: "Electronics", slug: "electronics", icon: "Laptop", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop" },
  { id: "2", name: "Fashion", slug: "fashion", icon: "Shirt", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop" },
  { id: "3", name: "Home & Living", slug: "home-living", icon: "Home", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop" },
  { id: "4", name: "Beauty & Health", slug: "beauty-health", icon: "Sparkles", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop" },
  { id: "5", name: "Grocery", slug: "grocery", icon: "Apple", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" },
  { id: "6", name: "Sports & Outdoors", slug: "sports-outdoors", icon: "Bike", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600&auto=format&fit=crop" },
  { id: "7", name: "Books & Stationery", slug: "books", icon: "BookOpen", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=600&auto=format&fit=crop" },
  { id: "8", name: "Toys & Games", slug: "toys-games", icon: "Gamepad2", image: "https://images.unsplash.com/photo-1566647387313-9fda80664848?q=80&w=600&auto=format&fit=crop" },
  { id: "9", name: "Automotive", slug: "automotive", icon: "Car", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop" }
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Organic Aloe Vera Gel",
    slug: "organic-aloe-vera-gel",
    description: "Pure and natural aloe vera gel for healthy skin and hair. Sourced from organic farms.",
    price: 15.99,
    oldPrice: 19.99,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=600&auto=format&fit=crop",
    category: "beauty-health",
    brand: "NaturePure",
    inStock: true,
    stockCount: 50,
    isNew: true,
    discount: 20,
    tags: ["organic", "skincare", "natural"]
  },
  {
    id: "p2",
    name: "Eco-Friendly Bamboo Toothbrush",
    slug: "bamboo-toothbrush",
    description: "Set of 4 biodegradable bamboo toothbrushes with charcoal bristles.",
    price: 12.50,
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1607613009820-a29f4bea3bd7?q=80&w=600&auto=format&fit=crop",
    category: "beauty-health",
    brand: "EcoSmile",
    inStock: true,
    stockCount: 200,
    tags: ["eco-friendly", "dental", "sustainable"]
  },
  {
    id: "p3",
    name: "Noise-Cancelling Wireless Headphones",
    slug: "wireless-headphones",
    description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 149.99,
    oldPrice: 199.99,
    rating: 4.9,
    reviews: 450,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    category: "electronics",
    brand: "AudioTech",
    inStock: true,
    stockCount: 15,
    discount: 25,
    tags: ["audio", "wireless", "premium"]
  },
  {
    id: "p4",
    name: "Ceramic Indoor Planter",
    slug: "ceramic-indoor-planter",
    description: "Minimalist ceramic planter for your indoor plants. Includes drainage hole and saucer.",
    price: 24.00,
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop",
    category: "home-living",
    brand: "HomeVibe",
    inStock: true,
    stockCount: 30,
    tags: ["decor", "plants", "home"]
  },
  {
    id: "p5",
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description: "Track your health, sleep, and workouts with this advanced smartwatch.",
    price: 89.99,
    oldPrice: 120.00,
    rating: 4.5,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
    category: "electronics",
    brand: "FitTech",
    inStock: true,
    stockCount: 40,
    discount: 25,
    tags: ["wearable", "fitness", "smart"]
  },
  {
    id: "p6",
    name: "Travel Backpack",
    slug: "travel-backpack",
    description: "Durable, water-resistant backpack perfect for hiking or daily commutes.",
    price: 55.00,
    oldPrice: 75.00,
    rating: 4.8,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
    category: "fashion",
    brand: "Wanderlust",
    inStock: true,
    stockCount: 120,
    discount: 26,
    tags: ["travel", "bag", "outdoor"]
  },
  {
    id: "p7",
    name: "Organic Green Tea Set",
    slug: "organic-green-tea",
    description: "Premium matcha green tea powder sourced from Kyoto, Japan.",
    price: 28.50,
    rating: 4.9,
    reviews: 85,
    image: "https://images.unsplash.com/photo-1582793988951-9aed550cbe14?q=80&w=600&auto=format&fit=crop",
    category: "grocery",
    brand: "ZenTea",
    inStock: true,
    stockCount: 60,
    isNew: true,
    tags: ["tea", "organic", "beverage"]
  },
  {
    id: "p8",
    name: "Reusable Glass Water Bottle",
    slug: "reusable-glass-bottle",
    description: "Eco-friendly glass bottle with silicone sleeve for protection.",
    price: 18.99,
    rating: 4.6,
    reviews: 140,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop",
    category: "sports-outdoors",
    brand: "AquaPure",
    inStock: true,
    stockCount: 85,
    tags: ["eco-friendly", "hydration", "sports"]
  },
  {
    id: "p9",
    name: "Yoga Mat with Alignment Lines",
    slug: "yoga-mat-alignment",
    description: "Non-slip eco-friendly yoga mat with alignment lines for perfect poses.",
    price: 35.00,
    rating: 4.7,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600&auto=format&fit=crop",
    category: "sports-outdoors",
    brand: "ZenYoga",
    inStock: true,
    stockCount: 45,
    tags: ["yoga", "fitness", "eco-friendly"]
  },
  {
    id: "p10",
    name: "100% Cotton Organic T-Shirt",
    slug: "cotton-organic-tshirt",
    description: "Comfortable and breathable organic cotton t-shirt for everyday wear.",
    price: 22.99,
    oldPrice: 29.99,
    rating: 4.5,
    reviews: 180,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
    category: "fashion",
    brand: "EcoStyle",
    inStock: true,
    stockCount: 150,
    discount: 23,
    tags: ["clothing", "organic", "cotton"]
  },
  {
    id: "p11",
    name: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    description: "Fast-charging wireless pad compatible with all Qi-enabled devices.",
    price: 29.99,
    rating: 4.4,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?q=80&w=600&auto=format&fit=crop",
    category: "electronics",
    brand: "ChargeTech",
    inStock: true,
    stockCount: 200,
    tags: ["charger", "wireless", "tech"]
  },
  {
    id: "p12",
    name: "Aromatherapy Essential Oil Diffuser",
    slug: "essential-oil-diffuser",
    description: "Ultrasonic humidifier and oil diffuser with 7 LED color lights.",
    price: 39.50,
    oldPrice: 49.99,
    rating: 4.8,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?q=80&w=600&auto=format&fit=crop",
    category: "home-living",
    brand: "HomeVibe",
    inStock: true,
    stockCount: 75,
    discount: 21,
    tags: ["home", "wellness", "aromatherapy"]
  },
  {
    id: "p13",
    name: "Organic Quinoa Grain",
    slug: "organic-quinoa",
    description: "High-protein, gluten-free organic quinoa. 2lbs bag.",
    price: 14.50,
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=600&auto=format&fit=crop",
    category: "grocery",
    brand: "NaturePure",
    inStock: true,
    stockCount: 120,
    tags: ["grocery", "organic", "food"]
  },
  {
    id: "p14",
    name: "Stainless Steel Chef Knife",
    slug: "stainless-chef-knife",
    description: "Professional grade 8-inch chef knife for precision cutting.",
    price: 45.00,
    oldPrice: 65.00,
    rating: 4.7,
    reviews: 134,
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=600&auto=format&fit=crop",
    category: "home-living",
    brand: "CuliCraft",
    inStock: true,
    stockCount: 40,
    discount: 30,
    tags: ["kitchen", "cooking", "professional"]
  },
  {
    id: "p15",
    name: "Hardcover Blank Journal",
    slug: "hardcover-blank-journal",
    description: "Premium lay-flat blank journal with acid-free paper.",
    price: 18.00,
    rating: 4.9,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
    category: "books",
    brand: "WriteWell",
    inStock: true,
    stockCount: 90,
    tags: ["stationery", "journal", "writing"]
  },
  {
    id: "p16",
    name: "Ultra-Wide Curved Gaming Monitor",
    slug: "curved-gaming-monitor",
    description: "34-inch ultra-wide curved gaming monitor with 144Hz refresh rate and HDR support.",
    price: 399.99,
    rating: 4.8,
    reviews: 150,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop",
    category: "electronics",
    brand: "ViewMax",
    inStock: true,
    stockCount: 25,
    tags: ["monitor", "gaming", "display"]
  },
  {
    id: "p17",
    name: "Portable Bluetooth Speaker",
    slug: "portable-bluetooth-speaker",
    description: "Waterproof portable speaker with 360-degree surround sound and 24-hour playtime.",
    price: 49.99,
    rating: 4.7,
    reviews: 185,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop",
    category: "electronics",
    brand: "SoundWave",
    inStock: true,
    stockCount: 80,
    tags: ["audio", "speaker", "bluetooth"]
  },
  {
    id: "p18",
    name: "Mechanical Backlit Keyboard",
    slug: "mechanical-backlit-keyboard",
    description: "Tactile mechanical gaming keyboard with customizable RGB backlighting and blue switches.",
    price: 79.99,
    rating: 4.6,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop",
    category: "electronics",
    brand: "KeyTech",
    inStock: true,
    stockCount: 45,
    tags: ["input", "keyboard", "gaming"]
  }
];

type DBKey = "greenmart_products" | "greenmart_categories" | "greenmart_current_user" | "greenmart_orders";

export function useDBValue<T>(key: DBKey): T {
  const [data, setData] = useState<T>(() => {
    if (key === "greenmart_products") return mockProducts as unknown as T;
    if (key === "greenmart_categories") return mockCategories as unknown as T;
    if (key === "greenmart_current_user") return null as unknown as T;
    if (key === "greenmart_orders") return [] as unknown as T;
    return null as unknown as T;
  });

  useEffect(() => {
    let isActive = true;

    const readStoredValue = () => {
      try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (key === "greenmart_products" && parsed.length < mockProducts.length) {
          localStorage.setItem(key, JSON.stringify(mockProducts));
          queueMicrotask(() => {
            if (isActive) {
              setData(mockProducts as unknown as T);
            }
          });
        } else if (key === "greenmart_categories" && (!parsed[0] || !parsed[0].image)) {
          localStorage.setItem(key, JSON.stringify(mockCategories));
          queueMicrotask(() => {
            if (isActive) {
              setData(mockCategories as unknown as T);
            }
          });
        } else {
          queueMicrotask(() => {
            if (isActive) {
              setData(parsed);
            }
          });
        }
      } else {
        if (key === "greenmart_products") {
          localStorage.setItem(key, JSON.stringify(mockProducts));
        } else if (key === "greenmart_categories") {
          localStorage.setItem(key, JSON.stringify(mockCategories));
        } else if (key === "greenmart_orders") {
          localStorage.setItem(key, JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error("Error reading DB value from localStorage", e);
    }
    };

    readStoredValue();
    window.addEventListener("storage", readStoredValue);
    window.addEventListener("greenmart-storage", readStoredValue);

    return () => {
      isActive = false;
      window.removeEventListener("storage", readStoredValue);
      window.removeEventListener("greenmart-storage", readStoredValue);
    };
  }, [key]);

  return data;
}

export const getProducts = () => mockProducts;
export const getProductBySlug = (slug: string) => mockProducts.find(p => p.slug === slug);
export const getProductsByCategory = (category: string) => mockProducts.filter(p => p.category === category);
