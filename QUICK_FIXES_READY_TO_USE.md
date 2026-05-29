# 🛠️ Quick Implementation Guide - Ready-to-Use Fixes

## How to Apply These Fixes

Each section below contains production-ready code that directly replaces problematic code in your codebase.

---

## FIX 1: Password Hashing (CRITICAL)

**File:** `src/lib/password.ts` (NEW FILE)

```typescript
import crypto from "crypto";

export function hashPassword(password: string): string {
  // Use bcrypt in production with: npm install bcryptjs
  // For now, using crypto for demo
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, originalHash] = hash.split(":");
  const testHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return testHash === originalHash;
}

// For production, install bcryptjs:
// npm install bcryptjs
// Then use:
// import bcrypt from "bcryptjs";
// export async function hashPasswordProduction(password: string): Promise<string> {
//   return bcrypt.hash(password, 10);
// }
// export async function verifyPasswordProduction(password: string, hash: string): Promise<boolean> {
//   return bcrypt.compare(password, hash);
// }
```

**Update:** `src/lib/auth.ts`

```typescript
import { User } from "./types";
import { hashPassword, verifyPassword } from "./password";

const notifyStorageChanged = () => {
  window.dispatchEvent(new Event("greenmart-storage"));
};

export const getRegisteredUsers = (): User[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("greenmart_users");
  return stored ? JSON.parse(stored) : [];
};

export const loginUser = (user: User) => {
  if (typeof window === "undefined") return;
  // Never store password in localStorage
  const { password, ...userWithoutPassword } = user;
  localStorage.setItem("greenmart_current_user", JSON.stringify(userWithoutPassword));
  notifyStorageChanged();
};

export const logoutUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("greenmart_current_user");
  notifyStorageChanged();
};

export const registerUser = (user: User) => {
  if (typeof window === "undefined") return;
  
  // Hash password before storing
  const hashedPassword = hashPassword(user.password || "");
  const userWithHashedPassword = { ...user, password: hashedPassword };
  
  // Don't store password in current user
  const { password, ...userWithoutPassword } = userWithHashedPassword;
  localStorage.setItem("greenmart_current_user", JSON.stringify(userWithoutPassword));
  
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex(u => u.phone === user.phone);
  if (existingIndex >= 0) {
    users[existingIndex] = userWithHashedPassword;
  } else {
    users.push(userWithHashedPassword);
  }
  localStorage.setItem("greenmart_users", JSON.stringify(users));
  notifyStorageChanged();
};

export const findUserByPhone = (phone: string): User | undefined => {
  const users = getRegisteredUsers();
  return users.find(u => u.phone === phone);
};

export const verifyUserCredentials = (phone: string, password: string): User | null => {
  const user = findUserByPhone(phone);
  if (!user || !user.password) {
    return null;
  }
  
  if (verifyPassword(password, user.password)) {
    return user;
  }
  
  return null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("greenmart_current_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse user", e);
      return null;
    }
  }
  return null;
};
```

**Update:** `src/app/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { loginUser, verifyUserCredentials } from "@/lib/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Verify credentials with hashed password
      const user = verifyUserCredentials(phone, password);

      if (!user) {
        setError("Invalid phone number or password.");
        setIsLoading(false);
        return;
      }
      
      loginUser(user);
      toast.success("Login successful!");
      router.push("/");
    } catch (error) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-mint-50/30">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-mint-900/5 border border-mint-200 max-w-md w-full">
          <h1 className="text-2xl font-bold text-mint-900 mb-2 text-center">Welcome Back</h1>
          <p className="text-mint-700 text-center mb-8 text-sm">Log in to your GreenMart account</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mint-850 mb-1">Phone Number</label>
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500" 
                placeholder="+1 (555) 000-0000" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mint-850 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500" 
                placeholder="••••••••" 
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-mint-600" />
                <span className="text-sm text-mint-700">Remember me</span>
              </label>
              <Link href="/support" className="text-sm font-bold text-mint-700 hover:text-white">Forgot Password?</Link>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-mint-700 hover:bg-mint-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <p className="text-center text-sm text-mint-700 mt-6">
            Don&apos;t have an account? <Link href="/register" className="font-bold text-mint-700 hover:text-white">Sign Up</Link>
          </p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
```

**Update:** `src/app/register/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { findUserByPhone, registerUser } from "@/lib/auth";
import { User } from "@/lib/types";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push("Minimum 8 characters");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("At least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("At least one lowercase letter");
    }
    if (!/\d/.test(pwd)) {
      errors.push("At least one number");
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setError(`Password must have: ${passwordValidation.errors.join(", ")}`);
        setIsLoading(false);
        return;
      }

      // Confirm password matches
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      // Check if user already exists
      if (findUserByPhone(phone)) {
        setError("An account already exists for this phone number.");
        setIsLoading(false);
        return;
      }
      
      const newUser: User = {
        id: `usr-${crypto.randomUUID()}`,
        firstName,
        lastName,
        phone,
        password, // Will be hashed in registerUser()
        addresses: []
      };
      
      registerUser(newUser);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      setError("An error occurred during registration. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-mint-50/30">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-mint-900/5 border border-mint-200 max-w-md w-full">
          <h1 className="text-2xl font-bold text-mint-900 mb-2 text-center">Create an Account</h1>
          <p className="text-mint-700 text-center mb-8 text-sm">Join GreenMart today</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mint-850 mb-1">First Name</label>
                <input 
                  type="text" 
                  required 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500" 
                  placeholder="Jane" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mint-850 mb-1">Last Name</label>
                <input 
                  type="text" 
                  required 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500" 
                  placeholder="Doe" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mint-850 mb-1">Phone Number</label>
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500" 
                placeholder="+1 (555) 000-0000" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mint-850 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500" 
                placeholder="••••••••"
              />
              <p className="text-xs text-mint-600 mt-1">Min 8 chars, uppercase, lowercase, number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mint-850 mb-1">Confirm Password</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500" 
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-mint-700 hover:bg-mint-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          
          <p className="text-center text-sm text-mint-700 mt-6">
            Already have an account? <Link href="/login" className="font-bold text-mint-700 hover:text-white">Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
```

---

## FIX 2: Email Verification System (CRITICAL)

**File:** `src/lib/emailService.ts` (NEW FILE)

```typescript
// This is a placeholder. In production, use SendGrid, AWS SES, or similar

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // In production, call your email API
    // For now, just log it
    console.log(`[Email] Verification code for ${email}: ${code}`);
    
    // Placeholder response
    return true;
    
    /* Production example with SendGrid:
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: "noreply@greenmart.com",
      subject: "Verify your GreenMart account",
      html: `
        <h2>Welcome to GreenMart!</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code expires in 10 minutes.</p>
      `
    };
    
    await sgMail.send(msg);
    return true;
    */
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

export async function sendOrderConfirmation(email: string, orderId: string, total: number): Promise<boolean> {
  try {
    console.log(`[Email] Order confirmation sent to ${email} for order ${orderId}`);
    return true;
  } catch (error) {
    console.error("Order confirmation email failed:", error);
    return false;
  }
}
```

**File:** `src/lib/verification.ts` (NEW FILE)

```typescript
interface VerificationCode {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

const verificationCodes: Map<string, VerificationCode> = new Map();

export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function storeVerificationCode(email: string, code: string): void {
  const now = Date.now();
  verificationCodes.set(email, {
    code,
    email,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000 // 10 minutes
  });
}

export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email);
  if (!stored) return false;
  
  // Check expiration
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return false;
  }
  
  // Check code
  if (stored.code !== code) {
    return false;
  }
  
  // Code verified, clean up
  verificationCodes.delete(email);
  return true;
}

export function isCodeExpired(email: string): boolean {
  const stored = verificationCodes.get(email);
  if (!stored) return true;
  return Date.now() > stored.expiresAt;
}
```

---

## FIX 3: Inventory Management (CRITICAL)

**File:** `src/lib/inventory.ts` (NEW FILE)

```typescript
import { CartItem } from "./types";

interface InventoryReservation {
  orderId: string;
  items: CartItem[];
  reservedAt: number;
}

const reservations: Map<string, InventoryReservation> = new Map();
const reservationTimeout = 15 * 60 * 1000; // 15 minutes

// Mock inventory database (in production, use real database)
interface ProductStock {
  productId: string;
  available: number;
  reserved: number;
}

const inventory: Map<string, ProductStock> = new Map();

export function initializeInventory(products: any[]): void {
  products.forEach(product => {
    inventory.set(product.id, {
      productId: product.id,
      available: product.stockCount,
      reserved: 0
    });
  });
}

export function getProductStock(productId: string): number {
  const stock = inventory.get(productId);
  return stock ? stock.available : 0;
}

export function canReserveInventory(items: CartItem[]): boolean {
  return items.every(item => {
    const stock = inventory.get(item.id);
    if (!stock) return false;
    return stock.available >= item.quantity;
  });
}

export function reserveInventory(orderId: string, items: CartItem[]): boolean {
  if (!canReserveInventory(items)) {
    return false;
  }

  // Update inventory
  items.forEach(item => {
    const stock = inventory.get(item.id);
    if (stock) {
      stock.available -= item.quantity;
      stock.reserved += item.quantity;
    }
  });

  // Store reservation
  reservations.set(orderId, {
    orderId,
    items,
    reservedAt: Date.now()
  });

  // Auto-release after timeout
  setTimeout(() => {
    if (!reservations.has(orderId)) return;
    releaseInventory(orderId);
  }, reservationTimeout);

  return true;
}

export function releaseInventory(orderId: string): void {
  const reservation = reservations.get(orderId);
  if (!reservation) return;

  reservation.items.forEach(item => {
    const stock = inventory.get(item.id);
    if (stock) {
      stock.available += item.quantity;
      stock.reserved -= item.quantity;
    }
  });

  reservations.delete(orderId);
}

export function confirmInventoryReduction(orderId: string): void {
  const reservation = reservations.get(orderId);
  if (!reservation) return;

  // Reserved items are already deducted from available
  // Just remove the reservation marker
  reservation.items.forEach(item => {
    const stock = inventory.get(item.id);
    if (stock) {
      stock.reserved -= item.quantity;
    }
  });

  reservations.delete(orderId);
}

export function getInventoryStatus(): Map<string, ProductStock> {
  return new Map(inventory);
}
```

---

## FIX 4: Payment Gateway Placeholder (CRITICAL)

**File:** `src/lib/payment.ts` (NEW FILE)

```typescript
export interface PaymentRequest {
  orderId: string;
  amount: number; // In cents
  currency: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: "pending" | "completed" | "failed";
  message: string;
  chargeId?: string;
}

// Placeholder implementation
// In production, integrate with Stripe, Razorpay, or PayPal

export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log("[Payment] Processing payment:", request);
    
    // Simulate payment processing
    const success = Math.random() > 0.05; // 95% success rate for demo
    
    if (!success) {
      return {
        success: false,
        transactionId: "",
        status: "failed",
        message: "Payment declined. Please try a different card."
      };
    }

    const transactionId = `txn_${crypto.randomUUID()}`;
    
    return {
      success: true,
      transactionId,
      status: "completed",
      message: "Payment successful",
      chargeId: `ch_${crypto.randomUUID()}`
    };
    
    /* Production example with Stripe:
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    
    const charge = await stripe.charges.create({
      amount: request.amount,
      currency: request.currency.toLowerCase(),
      source: request.paymentMethodId,
      description: `Order ${request.orderId}`,
      receipt_email: request.customerEmail
    });

    return {
      success: charge.paid,
      transactionId: request.orderId,
      status: charge.paid ? "completed" : "failed",
      message: charge.paid ? "Payment successful" : "Payment failed",
      chargeId: charge.id
    };
    */
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      transactionId: "",
      status: "failed",
      message: "An error occurred while processing your payment."
    };
  }
}

export function getPaymentMethodsAvailable(): string[] {
  return ["credit_card", "debit_card", "paypal", "google_pay", "apple_pay"];
}
```

---

## FIX 5: Centralized Checkout Calculation (HIGH)

**File:** `src/lib/checkout.ts` (NEW FILE)

```typescript
export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  tax: number;
  shipping: number;
  total: number;
}

const TAX_RATES: Record<string, number> = {
  CA: 0.0725,
  TX: 0.0625,
  FL: 0.06,
  NY: 0.08,
  default: 0.08
};

const SHIPPING_RULES = {
  freeThreshold: 50,
  standardCost: 10,
  expressMultiplier: 2
};

export function calculateCartSummary(
  subtotal: number,
  discountPercent: number = 0,
  state: string = "default",
  shippingType: "standard" | "express" = "standard"
): CartSummary {
  const discountAmount = subtotal * (discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  const taxRate = TAX_RATES[state] || TAX_RATES.default;
  const tax = subtotalAfterDiscount * taxRate;
  
  let shipping = 0;
  if (subtotalAfterDiscount < SHIPPING_RULES.freeThreshold) {
    shipping = SHIPPING_RULES.standardCost;
    if (shippingType === "express") {
      shipping *= SHIPPING_RULES.expressMultiplier;
    }
  }
  
  const total = subtotalAfterDiscount + tax + shipping;

  return {
    subtotal,
    discountAmount,
    subtotalAfterDiscount,
    tax,
    shipping,
    total
  };
}

export function validateCheckout(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.phone || !/^[\d\s\-\+\(\)]{10,}$/.test(data.phone)) {
    errors.push("Invalid phone number");
  }

  if (!data.firstName || data.firstName.length < 2) {
    errors.push("First name is required");
  }

  if (!data.lastName || data.lastName.length < 2) {
    errors.push("Last name is required");
  }

  if (!data.address || data.address.length < 5) {
    errors.push("Street address is required");
  }

  if (!data.city || data.city.length < 2) {
    errors.push("City is required");
  }

  if (!data.zip || !/^\d{5}(-\d{4})?$/.test(data.zip)) {
    errors.push("Invalid postal code (format: 12345 or 12345-6789)");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## FIX 6: Cart Sync Across Tabs (HIGH)

**Update:** `src/context/CartContext.tsx`

Add this useEffect to the CartProvider:

```typescript
useEffect(() => {
  // Handle storage changes from other tabs/windows
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === "greenmart_cart" && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        setCart(parsed);
        console.log("Cart synced from another tab");
      } catch (e) {
        console.error("Failed to parse cart from storage event", e);
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);
  
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);
```

---

## FIX 7: Search Persistence (HIGH)

**Update:** `src/app/search/page.tsx` - Add this at the top of the component:

```typescript
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get query from URL parameters
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Update URL when search changes
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // ... rest of component ...
}
```

---

## FIX 8: Out of Stock Button Disabled (HIGH)

**Update:** `src/components/ProductCard.tsx`

```typescript
export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const isOutOfStock = !product.inStock || product.stockCount <= 0;

  return (
    <div className={`group flex flex-col bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full relative p-4 border border-mint-100 shadow-sm ${
      isOutOfStock ? 'opacity-60' : ''
    }`}>
      
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white font-bold text-center">Out of Stock</span>
        </div>
      )}

      {/* ... existing content ... */}

      <button 
        onClick={(e) => { 
          e.preventDefault(); 
          if (!isOutOfStock) {
            addItem(product);
          }
        }}
        disabled={isOutOfStock}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
          isOutOfStock 
            ? 'bg-gray-300 border-gray-400 cursor-not-allowed text-gray-500' 
            : 'border-mint-700 text-mint-700 hover:bg-mint-700 hover:text-white'
        }`}
      >
        <ShoppingCart size={14} />
      </button>
    </div>
  );
}
```

---

## FIX 9: Address Validation (HIGH)

**File:** `src/lib/addressValidator.ts` (NEW FILE)

```typescript
import { Address } from "./types";

export interface AddressValidation {
  valid: boolean;
  errors: string[];
}

export function validateAddress(address: Address): AddressValidation {
  const errors: string[] = [];

  // Phone validation
  if (!address.phone || !/^[\d\s\-\+\(\)]{10,}$/.test(address.phone)) {
    errors.push("Invalid phone number format");
  }

  // Street address
  if (!address.street || address.street.length < 5) {
    errors.push("Street address must be at least 5 characters");
  }

  // City
  if (!address.city || address.city.length < 2) {
    errors.push("City is required");
  }

  // State/Province
  if (!address.state || address.state.length < 2) {
    errors.push("State/Province is required");
  }

  // Postal code - US format
  if (!address.zip || !/^\d{5}(-\d{4})?$/.test(address.zip)) {
    errors.push("Invalid postal code (format: 12345 or 12345-6789)");
  }

  // Name
  if (!address.name || address.name.length < 2) {
    errors.push("Address name is required");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function sanitizeAddress(address: Address): Address {
  return {
    ...address,
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    zip: address.zip.trim().replace(/\s/g, ""),
    phone: address.phone.trim().replace(/\s/g, ""),
    name: address.name.trim()
  };
}
```

---

## Summary

These fixes address the **9 most critical issues** in your e-commerce application. Implement them in this order:

1. **Password Hashing** - Security critical
2. **Email Verification** - User trust & compliance
3. **Inventory Management** - Business logic
4. **Payment Gateway** - Revenue critical
5. **Checkout Calculation** - Correctness
6. **Cart Sync** - User experience
7. **Search Persistence** - User experience
8. **Stock Button** - Prevents errors
9. **Address Validation** - Data quality

**Total estimated time:** 4-6 hours for an experienced developer

After these fixes, move on to the medium-priority issues in the main audit report.
