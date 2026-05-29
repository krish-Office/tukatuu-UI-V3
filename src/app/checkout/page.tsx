"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveOrder } from "@/lib/orders";
import { CheckCircle2 } from "lucide-react";
import { useDBValue } from "@/lib/db";
import { User } from "@/lib/types";

// Security & Transaction Integrations
import { calculateCheckoutSummary, validateCheckoutForm } from "@/lib/checkout";
import { reserveInventory, releaseInventory, confirmInventoryReduction } from "@/lib/inventory";
import { processPayment } from "@/lib/payment";
import { sendOrderConfirmation } from "@/lib/emailService";
import { getCurrentUser } from "@/lib/auth";
import toast from "react-hot-toast";

const COUPON_RATES: Record<string, number> = {
  GREEN10: 10,
  WELCOME15: 15
};

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const currentUser = useDBValue<User | null>("greenmart_current_user");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Authenticate user on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Please sign in to access checkout.");
      router.push("/login?redirect=/checkout");
    }
  }, [router]);

  const [formData, setFormData] = useState({
    phone: "",
    alternativePhone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: ""
  });

  // Load coupon discount rate on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCoupon = localStorage.getItem("greenmart_coupon");
      if (storedCoupon && COUPON_RATES[storedCoupon]) {
        setDiscountPercent(COUPON_RATES[storedCoupon]);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) return;

      const defaultAddr = currentUser.addresses?.find(a => a.isDefault) || currentUser.addresses?.[0];

      setFormData(prev => ({
        ...prev,
        phone: currentUser.phone || prev.phone,
        firstName: currentUser.firstName || prev.firstName,
        lastName: currentUser.lastName || prev.lastName,
        address: defaultAddr?.street || prev.address,
        city: defaultAddr?.city || prev.city,
        zip: defaultAddr?.zip || prev.zip
      }));

      if (defaultAddr) {
        setSelectedSavedAddressId(defaultAddr.id);
      }
    });

    return () => {
      isActive = false;
    };
  }, [currentUser]);

  // Centralized calculations replacing hardcoded formula
  const summary = calculateCheckoutSummary(cartTotal, discountPercent, formData.zip);
  const { discountAmount, taxAmount, shippingCost, total } = summary;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (["address", "city", "zip"].includes(name)) {
      setSelectedSavedAddressId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (cart.length === 0) {
      setFormError("Your shopping cart is empty.");
      return;
    }

    // Validate form inputs
    const { alternativePhone, ...validationData } = formData;
    const formCheck = validateCheckoutForm(validationData);
    if (!formCheck.valid) {
      setFormError(formCheck.errors[0]); // Show the first validation error
      return;
    }

    if (alternativePhone.trim()) {
      const cleanPhone = alternativePhone.trim().replace(/\s/g, "");
      if (!/^[\d\s\-\+\(\)]{10,}$/.test(cleanPhone)) {
        setFormError("Alternative phone number must be at least 10 digits.");
        return;
      }
    }

    setIsSubmitting(true);
    const tempOrderId = "ORD-" + crypto.randomUUID().slice(0, 8).toUpperCase();

    // 1. Inventory Locking Verification Gate
    const stockReserved = reserveInventory(tempOrderId, cart);
    if (!stockReserved) {
      setFormError("Some products in your cart are currently out of stock or sold out. Please review your quantities.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Stripe Gateway payment authorization processing
      const paymentResult = await processPayment({
        orderId: tempOrderId,
        amount: total,
        currency: "usd",
        customerEmail: currentUser?.email || "guest@example.com",
        customerPhone: formData.phone,
        customerName: `${formData.firstName} ${formData.lastName}`
      });

      if (!paymentResult.success) {
        // Release inventory back to available stock on failure
        releaseInventory(tempOrderId);
        setFormError(paymentResult.message);
        setIsSubmitting(false);
        return;
      }

      // 3. Complete Checkout transaction & Save order to Local Database
      const selectedSavedAddress = currentUser?.addresses?.find(address => address.id === selectedSavedAddressId);
      const fullAddress = [formData.address, formData.city, formData.zip].filter(Boolean).join(", ");

      saveOrder({
        id: tempOrderId,
        date: new Date().toISOString(),
        total,
        status: "Processing",
        items: [...cart],
        shippingAddress: fullAddress,
        shippingAddressId: selectedSavedAddress?.id ?? null,
        shippingAddressDetails: selectedSavedAddress,
        phone: formData.phone,
        alternativePhone: formData.alternativePhone || undefined
      });

      // 4. Confirm permanent reduction of reserved inventory
      confirmInventoryReduction(tempOrderId);

      // 5. Send order invoice confirmation email (emits detailed receipt logs in console)
      await sendOrderConfirmation(
        currentUser?.email || "guest@example.com",
        tempOrderId,
        total,
        cart,
        fullAddress
      );

      // 6. Final Clean up
      clearCart();
      localStorage.removeItem("greenmart_coupon"); // Consume coupon code
      setOrderId(tempOrderId);
      setIsSuccess(true);
      toast.success("Order placed and payment authorized!");
    } catch (error) {
      console.error("Critical order submission failure:", error);
      releaseInventory(tempOrderId); // Secure stock recovery
      setFormError("A system error occurred while submitting your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-mint-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-mint-900 mb-2">Order Confirmed!</h2>
            <p className="text-mint-700 mb-6">Thank you for your purchase. Your order <span className="font-bold text-mint-900">{orderId}</span> is being processed.</p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push(`/order/${orderId}`)}
                className="w-full bg-mint-700 hover:bg-mint-800 text-white py-3 rounded-xl font-bold transition-colors"
              >
                View Order Details
              </button>
              <button 
                onClick={() => router.push("/")}
                className="w-full bg-mint-800 hover:bg-mint-900 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
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
      
      <main className="flex-grow bg-mint-50/30 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl md:text-3xl font-bold text-mint-900 mb-8">Checkout</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="flex-1">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Contact Info */}
                <div className="bg-white p-6 rounded-2xl border border-mint-200 shadow-sm">
                  <h2 className="text-lg font-bold text-mint-900 mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mint-850 mb-1">Primary Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange} required type="tel" className="w-full border border-mint-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mint-850 mb-1">Alternative Phone Number (Optional)</label>
                      <input name="alternativePhone" value={formData.alternativePhone} onChange={handleInputChange} type="tel" className="w-full border border-mint-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </div>
                
                {/* Shipping Info */}
                <div className="bg-white p-6 rounded-2xl border border-mint-200 shadow-sm">
                  <h2 className="text-lg font-bold text-mint-900 mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mint-850 mb-1">First Name</label>
                      <input name="firstName" value={formData.firstName} onChange={handleInputChange} required type="text" className="w-full border border-mint-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mint-850 mb-1">Last Name</label>
                      <input name="lastName" value={formData.lastName} onChange={handleInputChange} required type="text" className="w-full border border-mint-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-mint-850 mb-1">Address</label>
                      <input name="address" value={formData.address} onChange={handleInputChange} required type="text" className="w-full border border-mint-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mint-850 mb-1">City</label>
                      <input name="city" value={formData.city} onChange={handleInputChange} required type="text" className="w-full border border-mint-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mint-850 mb-1">Postal Code</label>
                      <input name="zip" value={formData.zip} onChange={handleInputChange} required type="text" className="w-full border border-mint-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-500" />
                    </div>
                  </div>
                </div>
                
                {/* Payment Info */}
                <div className="bg-white p-6 rounded-2xl border border-mint-200 shadow-sm">
                  <h2 className="text-lg font-bold text-mint-900 mb-4">Payment Method</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border border-mint-500 bg-mint-50 rounded-lg cursor-pointer">
                      <input type="radio" name="payment" defaultChecked className="w-4 h-4 accent-mint-600" />
                      <span className="font-medium text-mint-900">Credit Card</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 border border-mint-200 rounded-lg cursor-pointer">
                      <input type="radio" name="payment" className="w-4 h-4 accent-mint-600" />
                      <span className="font-medium text-mint-900">PayPal</span>
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {formError}
                  </p>
                )}
                
              </form>
            </div>
            
            {/* Order Summary sidebar */}
            <div className="lg:w-96">
              <div className="bg-white rounded-3xl border border-mint-200 p-6 sticky top-28 shadow-sm">
                <h2 className="text-lg font-bold text-mint-900 mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-mint-50 shrink-0 border border-mint-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-mint-900 truncate">{item.name}</h4>
                        <p className="text-xs text-mint-700">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-mint-900 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-mint-200 pt-4 space-y-3 mb-6 text-sm text-mint-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-mint-900">${cartTotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold text-mint-900">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes ({Math.round(summary.taxRate * 1000) / 10}%)</span>
                    <span className="font-bold text-mint-900">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-mint-100">
                    <span className="font-bold text-base text-mint-900">Total</span>
                    <span className="font-extrabold text-xl text-mint-900">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-mint-700 hover:bg-mint-800 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex justify-center items-center h-14"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
