"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingCart, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useDBValue } from "@/lib/db";

export function MobileNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const currentUser = useDBValue<any>("greenmart_current_user");

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: Grid },
    { name: "Cart", href: "/cart", icon: ShoppingCart, badge: cartCount },
    ...(currentUser ? [{ name: "Wishlist", href: "/account/marked", icon: Heart, badge: wishlist.length }] : []),
    { name: "Account", href: "/account", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-mint border-t border-mint-300 pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${isActive ? 'text-mint-100' : 'text-mint-600/70 hover:text-mint-700'}`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'fill-mint-200/50' : ''} />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 bg-mint-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-mint-100">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
