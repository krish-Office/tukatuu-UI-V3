"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Package, Heart, User as UserIcon, LogOut, MapPin } from "lucide-react";
import { useDBValue } from "@/lib/db";
import { User } from "@/lib/types";
import { useEffect, useState } from "react";
import { logoutUser, getCurrentUser } from "@/lib/auth";

export default function AccountPage() {
  const currentUser = useDBValue<User | null>("greenmart_current_user");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const user = getCurrentUser();
      if (user === null) {
        window.location.href = "/login";
      }
    }
  }, [mounted]);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/";
  };

  if (!mounted || !currentUser) return null; // Avoid flashing content while redirecting

  const menuItems = [
    { 
      icon: Package, 
      title: "My Orders", 
      desc: "View, track, and manage your current orders", 
      href: "/account/orders", 
      color: "text-mint-700 bg-mint-50/50 hover:bg-mint-100/50 border-mint-100" 
    },
    { 
      icon: Heart, 
      title: "Wishlist", 
      desc: "Products you've saved to purchase later", 
      href: "/account/marked", 
      color: "text-red-500 bg-red-50/30 hover:bg-red-50 border-red-100/40" 
    },
    { 
      icon: UserIcon, 
      title: "Profile", 
      desc: "Update your name, contact details, and password", 
      href: "/account/profile", 
      color: "text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50 border-emerald-100/40" 
    },
    { 
      icon: MapPin, 
      title: "Address Settings", 
      desc: "Manage your delivery addresses and static map pins", 
      href: "/account/settings", 
      color: "text-amber-600 bg-amber-50/30 hover:bg-amber-50 border-amber-100/40" 
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-mint-50/20 relative overflow-hidden">
      {/* Glow decorative spheres for modern glassmorphism feeling */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-mint-200/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[350px] h-[350px] bg-mint-300/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Header />
      
      <main className="flex-grow py-12 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-mint-200/80 overflow-hidden shadow-xl shadow-mint-900/5 animate-in fade-in duration-300">
            
            {/* Premium Header Banner Area */}
            <div className="bg-gradient-to-r from-mint-850 via-mint-750 to-mint-600 p-8 text-white flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-mint-500/20 rounded-full blur-xl"></div>
              
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={`${currentUser.firstName} ${currentUser.lastName}`} 
                  className="w-24 h-24 rounded-full object-cover shrink-0 relative z-10 border-4 border-white/20 shadow-md transform hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white text-3xl font-black shrink-0 relative z-10 border-4 border-white/25 uppercase shadow-md transform hover:scale-105 transition-transform duration-300">
                  {currentUser.firstName?.[0] || ""}{currentUser.lastName?.[0] || ""}
                </div>
              )}
              
              <div className="text-center sm:text-left relative z-10">
                <h1 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight">{currentUser.firstName} {currentUser.lastName}</h1>
                <p className="text-mint-100/90 text-sm font-medium">{currentUser.phone}</p>
                <div className="mt-3.5 inline-flex px-3.5 py-1 bg-white/15 backdrop-blur-xs border border-white/10 rounded-full text-xs font-black text-white/90 uppercase tracking-wider">
                  GreenMart Member
                </div>
              </div>

              {/* Dummy stats rows for highly professional look */}
              <div className="flex gap-4 shrink-0 sm:ml-auto relative z-10">
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[90px] shadow-sm">
                  <div className="text-xl font-black text-white">{currentUser.addresses?.length || 0}</div>
                  <div className="text-[9px] uppercase font-bold text-mint-150 tracking-wider">Addresses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[90px] shadow-sm">
                  <div className="text-xl font-black text-white">Active</div>
                  <div className="text-[9px] uppercase font-bold text-mint-150 tracking-wider">Status</div>
                </div>
              </div>
            </div>
            
            {/* Menu Dashboard Content */}
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-black text-mint-900 mb-6 uppercase tracking-wider border-b border-mint-100 pb-3">Dashboard Menu</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={index} 
                      href={item.href}
                      className="flex items-center gap-5 p-5 rounded-[24px] border border-mint-150 bg-white hover:border-mint-300 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-transparent shadow-xs transition-all duration-300 group-hover:scale-115 group-hover:shadow-sm ${item.color}`}>
                        <Icon size={24} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-mint-900 text-base mb-1 group-hover:text-mint-750 transition-colors">{item.title}</h3>
                        <p className="text-xs text-mint-650 font-medium line-clamp-1">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {/* Logout & Footer Row */}
              <div className="mt-10 pt-6 border-t border-mint-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-red-500 font-bold hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100/50 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider border border-red-100 cursor-pointer shadow-xs"
                >
                  <LogOut size={13} className="stroke-[2.5px]" />
                  Log Out
                </button>
                <span className="text-[10px] font-bold text-mint-500 uppercase tracking-widest">GreenMart Member Lounge v1.3</span>
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
