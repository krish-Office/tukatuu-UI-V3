export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  discount?: number;
  tags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: CartItem[];
  shippingAddress: string;
  shippingAddressId?: string | null;
  shippingAddressDetails?: Address;
  trackingNumber?: string;
  phone?: string;
  alternativePhone?: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addresses: Address[];
  email?: string;
  emailVerified?: boolean;
  avatar?: string;
  password?: string;
}
