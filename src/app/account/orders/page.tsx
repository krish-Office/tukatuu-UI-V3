"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { getStoredOrders } from "@/lib/orders";
import Link from "next/link";
import { ChevronRight, Package, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Order, User } from "@/lib/types";
import { useDBValue } from "@/lib/db";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const currentUser = useDBValue<User | null>("greenmart_current_user");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const activeUser = getCurrentUser();
      if (activeUser === null) {
        window.location.href = "/login";
      }
    }
  }, [mounted]);

  useEffect(() => {
    setOrders(getStoredOrders());
  }, []);

  if (!mounted || !currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-mint-50/30 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/account" className="inline-flex items-center gap-1 text-mint-700 hover:text-mint-950 mb-6 font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-mint-900">My Orders</h1>
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-mint-200 shadow-sm">
              <Package size={48} className="mx-auto text-mint-400 mb-4" />
              <h2 className="text-xl font-bold text-mint-900 mb-2">No orders yet</h2>
              <p className="text-mint-700 mb-6">You haven't placed any orders with us yet.</p>
              <Link href="/products" className="bg-mint-700 hover:bg-mint-800 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 border border-mint-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-mint-100">
                    <div>
                      <h3 className="font-bold text-mint-900">Order {order.id}</h3>
                      <p className="text-sm text-mint-700">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-mint-700">Total</span>
                        <span className="font-bold text-mint-900">${order.total.toFixed(2)}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-mint-50">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-white bg-mint-100 text-xs font-semibold text-mint-800">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      href={`/order/${order.id}`}
                      className="text-mint-700 font-bold hover:text-mint-950 flex items-center gap-1 text-sm transition-colors"
                    >
                      View Details <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
