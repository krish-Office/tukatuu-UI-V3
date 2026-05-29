"use client";

import { use, useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { getStoredOrders } from "@/lib/orders";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Truck, FileText, Package, MapPin, Home as HomeIcon, Briefcase, Map, Plus, Trash2, X, Heart, MessageSquare, Send } from "lucide-react";
import { Address, Order, Product, User } from "@/lib/types";
import { useWishlist } from "@/context/WishlistContext";
import { useDBValue } from "@/lib/db";

// --- LOCAL TYPES ---
type AddressType = "Home" | "Work" | "Other";

export interface SavedAddress {
  id: string;
  type: AddressType;
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  area: string;
  street: string;
  landmark: string;
  postalCode: string;
  isDefault: boolean;
}

function toSavedAddress(address: Address, currentUser: User | null): SavedAddress {
  const fullName = address.name || `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "Delivery Address";

  return {
    id: address.id,
    type: "Home",
    fullName,
    phone: address.phone || currentUser?.phone || "",
    email: currentUser?.email || "",
    province: address.state || "",
    city: address.city || "",
    area: "",
    street: address.street || "",
    landmark: "",
    postalCode: address.zip || "",
    isDefault: address.isDefault
  };
}

// --- LOCAL COMPONENTS ---

function MarkedProductPanel() {
  const { wishlist, toggleMarked } = useWishlist();
  const allProducts = useDBValue<Product[]>("greenmart_products") || [];
  
  const markedProducts = useMemo(() => {
    return allProducts.filter(p => wishlist.includes(p.id));
  }, [allProducts, wishlist]);

  return (
    <div className="bg-white rounded-2xl border border-mint-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-mint-900 mb-4 flex items-center gap-2">
        <Heart size={20} className="text-red-500 fill-red-500" /> Marked Products
      </h2>
      
      {markedProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-mint-700">No marked products yet.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {markedProducts.map(product => (
            <div key={product.id} className="flex gap-3 p-3 rounded-xl border border-mint-100 hover:border-mint-300 transition-colors bg-mint-50/30">
              <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-mint-900 line-clamp-1">{product.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-mint-700">${product.price.toFixed(2)}</span>
                  <span className="text-xs text-amber-500 font-bold">★ {product.rating}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Link href={`/product/${product.slug}`} className="text-[10px] font-bold bg-mint-100 text-mint-800 px-2 py-1 rounded hover:bg-mint-200 transition-colors">
                    View Product
                  </Link>
                  <button 
                    onClick={() => toggleMarked(product.id)}
                    className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressCard({ 
  address, 
  isSelected, 
  onSelect, 
  onDelete,
  readOnly = false
}: { 
  address: SavedAddress, 
  isSelected: boolean, 
  onSelect?: () => void, 
  onDelete?: () => void,
  readOnly?: boolean
}) {
  const Icon = address.type === "Home" ? HomeIcon : address.type === "Work" ? Briefcase : Map;
  
  return (
    <div 
      className={`relative p-4 rounded-xl border-2 transition-all ${
        readOnly 
        ? 'border-mint-600 bg-mint-50/50' 
        : isSelected 
          ? 'border-mint-600 bg-mint-50 cursor-pointer' 
          : 'border-mint-100 bg-white hover:border-mint-300 cursor-pointer'
      }`}
      onClick={readOnly ? undefined : onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-mint-700" />
          <span className="font-bold text-sm text-mint-900">{address.type}</span>
          {address.isDefault && (
            <span className="bg-mint-800 text-white hover:bg-mint-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>
          )}
        </div>
        {!readOnly && onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-mint-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      
      <div className="space-y-1 text-sm text-mint-700">
        <p className="font-bold text-mint-900">{address.fullName}</p>
        <p>{address.phone}</p>
        <p className="line-clamp-2 text-xs mt-2 text-mint-700">
          {address.street}, {address.area && `${address.area}, `}
          {address.city}, {address.province} {address.postalCode}
        </p>
      </div>
      
      {isSelected && !readOnly && (
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-mint-600 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white">
          <CheckCircle2 size={14} />
        </div>
      )}
    </div>
  );
}

function AddAddressModal({ 
  isOpen, 
  onClose, 
  onSave,
  currentUser
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (addr: SavedAddress) => void,
  currentUser: User | null
}) {
  const [formData, setFormData] = useState<Partial<SavedAddress>>({
    type: "Home",
    isDefault: false
  });

  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) return;

      setFormData({
        type: "Home",
        fullName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "",
        phone: currentUser?.phone || "",
        email: "",
        province: "",
        city: "",
        area: "",
        street: "",
        landmark: "",
        postalCode: "",
        isDefault: false
      });
    });

    return () => {
      isActive = false;
    };
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.city || !formData.street || !formData.type) return;
    
    onSave({
      id: "addr_" + Date.now(),
      type: formData.type as AddressType,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || "",
      province: formData.province || "",
      city: formData.city,
      area: formData.area || "",
      street: formData.street,
      landmark: formData.landmark || "",
      postalCode: formData.postalCode || "",
      isDefault: !!formData.isDefault
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex justify-between items-center p-6 border-b border-mint-100">
          <h2 className="text-xl font-bold text-mint-900">Add New Address</h2>
          <button onClick={onClose} className="p-2 text-mint-400 hover:text-mint-700 bg-mint-50 hover:bg-mint-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex gap-4 mb-2">
              {(["Home", "Work", "Other"] as AddressType[]).map(type => (
                <label key={type} className={`flex-1 flex items-center justify-center py-2 px-4 rounded-xl border cursor-pointer font-bold text-sm transition-colors ${formData.type === type ? 'bg-mint-600 text-white border-mint-600' : 'bg-white text-mint-700 border-mint-200 hover:bg-mint-50'}`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={formData.type === type}
                    onChange={() => setFormData(prev => ({ ...prev, type }))}
                  />
                  {type}
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-mint-850 mb-1">Full Name *</label>
              <input required value={formData.fullName || ""} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-mint-850 mb-1">Phone Number *</label>
              <input required type="tel" value={formData.phone || ""} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-mint-850 mb-1">Email</label>
              <input type="email" value={formData.email || ""} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-mint-850 mb-1">Province/State</label>
              <input value={formData.province || ""} onChange={e => setFormData(prev => ({ ...prev, province: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-mint-850 mb-1">City *</label>
              <input required value={formData.city || ""} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-mint-850 mb-1">Street Address *</label>
              <input required value={formData.street || ""} onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-mint-850 mb-1">Area / Suburb</label>
              <input value={formData.area || ""} onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-mint-850 mb-1">Landmark</label>
              <input value={formData.landmark || ""} onChange={e => setFormData(prev => ({ ...prev, landmark: e.target.value }))} className="w-full bg-mint-100/50 border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500" />
            </div>
            
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isDefault" 
                checked={formData.isDefault}
                onChange={e => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="w-4 h-4 text-mint-700 rounded border-mint-300 focus:ring-mint-500 accent-mint-600 cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-mint-900 cursor-pointer">Set as default delivery address</label>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-mint-700 font-bold hover:bg-mint-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-mint-700 text-white font-bold hover:bg-mint-800 transition-colors">
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentUser = useDBValue<User | null>("greenmart_current_user");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTraderTyping, setIsTraderTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getTraderResponse = (userMsg: string): string => {
    const text = userMsg.toLowerCase();
    if (text.includes("delivery") || text.includes("ship") || text.includes("arrive") || text.includes("track")) {
      return "Your shipment is on track to be hand-delivered. It typically takes 2-3 business days. I'll make sure the driver gives you a call once they are nearby!";
    }
    if (text.includes("fresh") || text.includes("quality") || text.includes("organic")) {
      return "Absolutely! All our produce is hand-picked directly from Golden Harvest farms this morning. We guarantee 100% freshness.";
    }
    if (text.includes("cancel") || text.includes("return") || text.includes("refund")) {
      return "Since your order is already being processed, we cannot cancel it directly here. However, once it arrives, you can decline delivery or contact support for a prompt return.";
    }
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      return "Hello! How can I help you today regarding your organic delivery? I am here to assist with any questions.";
    }
    if (text.includes("thank") || text.includes("awesome") || text.includes("perfect")) {
      return "You're very welcome! We really appreciate your business and hope you love our fresh organic selections.";
    }
    return "Thank you for reaching out! I've logged your request and our fulfillment team is reviewing it. We will make sure your delivery is handled with absolute care.";
  };

  useEffect(() => {
    if (!order) return;
    const storageKey = `greenmart_chat_${order.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      const initial = [
        {
          sender: "trader",
          text: `Hello! Thank you for purchasing from Golden Harvest Organics. We have received your order #${order.id} and are currently selecting the freshest organic items for you.`,
          timestamp: new Date(new Date(order.date).getTime()).toISOString()
        },
        {
          sender: "trader",
          text: "We are currently packing your items in sustainable materials and expect to dispatch them shortly.",
          timestamp: new Date(new Date(order.date).getTime() + 60000).toISOString()
        }
      ];
      setMessages(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  }, [order]);

  useEffect(() => {
    if (!order || messages.length === 0) return;
    const storageKey = `greenmart_chat_${order.id}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, order]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !order) return;

    const userMessage = {
      sender: "user",
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    setIsTraderTyping(true);
    setTimeout(() => {
      setIsTraderTyping(false);
      const replyText = getTraderResponse(userMessage.text);
      const traderMessage = {
        sender: "trader",
        text: replyText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, traderMessage]);
    }, 1800);
  };

  // Load Order
  useEffect(() => {
    let isActive = true;
    const orders = getStoredOrders();
    const found = orders.find(o => o.id === resolvedParams.orderId);

    queueMicrotask(() => {
      if (!isActive) return;

      if (found) setOrder(found);
      setLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [resolvedParams.orderId]);

  // Load Addresses
  useEffect(() => {
    let isActive = true;
    const stored = localStorage.getItem("greenmart_addresses");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const defaultAddr = parsed.find((a: SavedAddress) => a.isDefault);

        queueMicrotask(() => {
          if (!isActive) return;

          setSavedAddresses(parsed);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else if (parsed.length > 0) {
            setSelectedAddressId(parsed[0].id);
          }
        });
      } catch (e) {
        console.error("Failed to parse addresses", e);
      }
    }

    return () => {
      isActive = false;
    };
  }, []);

  const handleSaveAddress = (addr: SavedAddress) => {
    let updated = [...savedAddresses];
    if (addr.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }
    updated.push(addr);
    
    // If it's the only address, make it default automatically
    if (updated.length === 1 && !addr.isDefault) {
      updated[0].isDefault = true;
    }
    
    setSavedAddresses(updated);
    localStorage.setItem("greenmart_addresses", JSON.stringify(updated));
    setSelectedAddressId(addr.id);
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem("greenmart_addresses", JSON.stringify(updated));
    if (selectedAddressId === id) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const storedSelectedAddress = useMemo(() => {
    return savedAddresses.find(a => a.id === selectedAddressId) || null;
  }, [savedAddresses, selectedAddressId]);

  const orderSavedAddress = useMemo(() => {
    if (!order) return null;
    if (order.shippingAddressDetails) {
      return toSavedAddress(order.shippingAddressDetails, currentUser);
    }

    const currentUserAddress = currentUser?.addresses?.find(address => address.id === order.shippingAddressId);
    return currentUserAddress ? toSavedAddress(currentUserAddress, currentUser) : null;
  }, [currentUser, order]);

  const selectedAddress = orderSavedAddress || storedSelectedAddress;
  const shippingAddressText = order?.shippingAddress?.trim() || "";

  if (loading) return null;

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-mint-900 mb-4">Order Not Found</h1>
            <Link href="/account/orders" className="text-mint-700 hover:underline">Back to Orders</Link>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 10;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-mint-50/30 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/account/orders" className="inline-flex items-center gap-1 text-mint-700 hover:text-mint-950 mb-6 font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-mint-900 mb-2">Order {order.id}</h1>
              <p className="text-mint-700">Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 bg-mint-800 hover:bg-mint-950 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-mint-850/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageSquare size={18} /> Chat with Trader
              </button>
              <button className="flex items-center gap-2 bg-white border border-mint-200 hover:bg-mint-50 text-mint-850 px-4 py-2 rounded-lg font-medium transition-colors">
                <FileText size={18} /> Invoice
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Items, Timeline & Addresses */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Order Status Timeline */}
              <div className="bg-white rounded-2xl border border-mint-200 p-6 shadow-sm overflow-hidden">
                <h2 className="text-lg font-bold text-mint-900 mb-6">Order Status</h2>
                <div className="relative">
                  <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-mint-100"></div>
                  
                  <div className="relative flex gap-4 mb-6">
                    <div className="w-11 h-11 rounded-full bg-mint-600 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-mint-900">Order Confirmed</h4>
                      <p className="text-sm text-mint-700">{new Date(order.date).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="relative flex gap-4 mb-6">
                    <div className="w-11 h-11 rounded-full bg-mint-100 text-mint-400 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm">
                      <Package size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-mint-900 text-mint-400">Processing</h4>
                      <p className="text-sm text-mint-400">We are preparing your order</p>
                    </div>
                  </div>
                  
                  <div className="relative flex gap-4">
                    <div className="w-11 h-11 rounded-full bg-mint-100 text-mint-400 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm">
                      <Truck size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-mint-900 text-mint-400">Out for Delivery</h4>
                      <p className="text-sm text-mint-400">Estimated: 2-3 business days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="bg-white rounded-2xl border border-mint-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-mint-900 flex items-center gap-2">
                    <MapPin size={20} className="text-mint-700" /> Delivery Address
                  </h2>
                </div>
                
                {!selectedAddress && !shippingAddressText ? (
                  <div className="border-2 border-dashed border-mint-200 rounded-xl p-8 text-center bg-mint-100/50">
                    <MapPin size={32} className="mx-auto text-mint-400 mb-3" />
                    <h3 className="font-bold text-mint-900 mb-1">No Address Selected</h3>
                    <p className="text-sm text-mint-700">No delivery address is currently selected for this order.</p>
                  </div>
                ) : selectedAddress ? (
                  <div className="max-w-md">
                    <AddressCard 
                      address={selectedAddress}
                      isSelected={true}
                      readOnly={true}
                    />
                  </div>
                ) : (
                  <div className="max-w-md rounded-xl border-2 border-mint-600 bg-mint-50/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-mint-700" />
                      <span className="font-bold text-sm text-mint-900">Delivery Address</span>
                    </div>
                    <p className="text-sm text-mint-700 whitespace-pre-line">{shippingAddressText}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-mint-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-mint-900 mb-6">Items ({order.items.length})</h2>
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Link href={`/product/${item.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-mint-50 border border-mint-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/product/${item.slug}`} className="font-bold text-mint-900 hover:text-mint-700 transition-colors line-clamp-1 mb-1">
                              {item.name}
                            </Link>
                            <p className="text-sm text-mint-600/70 mb-2">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-mint-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column - Summary, Details & Marked Products */}
            <div className="space-y-8">
              
              {/* Order Summary */}
              <div className="bg-white rounded-2xl border border-mint-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-mint-900 mb-4">Summary</h2>
                <div className="space-y-3 text-sm text-mint-700 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-mint-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold text-mint-900">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-bold text-mint-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-mint-100 mt-3">
                    <span className="font-bold text-base text-mint-900">Total</span>
                    <span className="font-extrabold text-xl text-mint-900">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="bg-white rounded-2xl border border-mint-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-mint-900 mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-mint-900 mb-1">Address</h4>
                    {selectedAddress ? (
                      <p className="text-sm text-mint-700">
                        {selectedAddress.fullName}<br/>
                        {selectedAddress.street}{selectedAddress.area ? `, ${selectedAddress.area}` : ''}<br/>
                        {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}<br/>
                        Phone: {selectedAddress.phone}
                      </p>
                    ) : shippingAddressText ? (
                      <p className="text-sm text-mint-700 whitespace-pre-line">{shippingAddressText}</p>
                    ) : (
                      <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                        No delivery address selected. Please select an address from the Delivery Address section.
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-mint-900 mb-1">Shipping Method</h4>
                    <p className="text-sm text-mint-700">Standard Delivery (2-3 Business Days)</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-mint-900 mb-1">Payment Method</h4>
                    <p className="text-sm text-mint-700 flex items-center gap-2">
                      <span className="w-8 h-5 bg-mint-100 rounded flex items-center justify-center text-[10px] font-bold text-mint-700">CARD</span>
                      Ending in **** 4242
                    </p>
                  </div>
                </div>
              </div>

              {/* Marked Products Widget */}
              {currentUser && <MarkedProductPanel />}
              
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNav />

      {/* Modals */}
      <AddAddressModal 
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        currentUser={currentUser}
      />

      {/* Premium Trader Chat Widget */}
      {isChatOpen && order && (
        <div className="fixed bottom-6 right-6 z-[1000] w-full max-w-sm bg-white rounded-3xl border border-mint-200 shadow-2xl overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-300 md:max-w-[380px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-mint-850 to-mint-950 p-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-sm font-black text-white">GH</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-mint-900 animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Golden Harvest Organics</h4>
                <p className="text-[10px] text-mint-100/70 flex items-center gap-1">
                  <span>Trader</span> • <span className="text-emerald-400 font-semibold">Online</span>
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-grow p-4 overflow-y-auto bg-mint-50/20 space-y-4 pr-2 custom-scrollbar flex flex-col justify-end">
            <div className="flex-grow"></div>
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-30 slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      isUser 
                        ? 'bg-mint-800 text-white rounded-tr-none' 
                        : 'bg-white text-mint-900 border border-mint-100 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <span className={`text-[8px] mt-1 block text-right ${isUser ? 'text-mint-200/70' : 'text-mint-600/50'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTraderTyping && (
                <div className="flex justify-start animate-in fade-in-30 duration-200">
                  <div className="bg-white text-mint-900 border border-mint-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-mint-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-mint-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message input */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 border-t border-mint-100 bg-white flex items-center gap-2 shrink-0"
          >
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask the trader about shipping..."
              className="flex-1 bg-mint-50/50 border border-mint-150 rounded-xl px-4 py-2 text-xs text-mint-900 placeholder:text-mint-600/40 focus:outline-none focus:border-mint-300 transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-8 h-8 rounded-xl bg-mint-800 hover:bg-mint-900 active:bg-mint-950 text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={14} className="transform rotate-45 -translate-x-0.5 translate-y-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
