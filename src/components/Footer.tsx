import Link from "next/link";
import { 
  Leaf, 
  ShieldCheck, 
  HeadphonesIcon, 
  Award, 
  Mail, 
  Send, 
  ArrowUpRight 
} from "lucide-react";
import { useDBValue } from "@/lib/db";

// Inline SVG components for social icons supporting the custom size prop
const FacebookIcon = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
);

export function Footer() {
  const currentUser = useDBValue<any>("greenmart_current_user");

  const socials = [
    { name: "Facebook", icon: FacebookIcon, href: "https://facebook.com" },
    { name: "Instagram", icon: InstagramIcon, href: "https://instagram.com" },
    { name: "Twitter", icon: TwitterIcon, href: "https://twitter.com" },
    { name: "Youtube", icon: YoutubeIcon, href: "https://youtube.com" }
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "All Products", href: "/products" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Contact Us", href: "/support" }
  ];

  const accountLinks = [
    { name: "Dashboard", href: "/account" },
    { name: "Order History", href: "/account/orders" },
    { name: "Shopping Cart", href: "/cart" },
    ...(currentUser ? [{ name: "Wishlist", href: "/account/marked" }] : [])
  ];

  return (
    <footer className="relative bg-gradient-to-b from-mint-900 to-mint-950 text-white pt-10 pb-16 md:pb-8 mt-12 overflow-hidden border-t border-mint-850">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-mint-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-mint-400/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="group p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:border-mint-500/20 hover:bg-white/[0.03] transition-all duration-300 flex items-center gap-3 shadow-md hover:-translate-y-0.5">
            <div className="p-2 bg-mint-500/10 text-mint-400 rounded-xl group-hover:bg-mint-500 group-hover:text-mint-950 transition-all duration-300 shrink-0">
              <Leaf size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Sustainable Choice</h4>
              <p className="text-[10px] text-mint-200/50 leading-tight">Eco-friendly and organic packaging.</p>
            </div>
          </div>

          <div className="group p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:border-mint-500/20 hover:bg-white/[0.03] transition-all duration-300 flex items-center gap-3 shadow-md hover:-translate-y-0.5">
            <div className="p-2 bg-mint-500/10 text-mint-400 rounded-xl group-hover:bg-mint-500 group-hover:text-mint-950 transition-all duration-300 shrink-0">
              <HeadphonesIcon size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Customer Care</h4>
              <p className="text-[10px] text-mint-200/50 leading-tight">Dedicated support active 24/7.</p>
            </div>
          </div>

          <div className="group p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:border-mint-500/20 hover:bg-white/[0.03] transition-all duration-300 flex items-center gap-3 shadow-md hover:-translate-y-0.5">
            <div className="p-2 bg-mint-500/10 text-mint-400 rounded-xl group-hover:bg-mint-500 group-hover:text-mint-950 transition-all duration-300 shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Secure Checkout</h4>
              <p className="text-[10px] text-mint-200/50 leading-tight">Encrypted transactions & safety.</p>
            </div>
          </div>

          <div className="group p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:border-mint-500/20 hover:bg-white/[0.03] transition-all duration-300 flex items-center gap-3 shadow-md hover:-translate-y-0.5">
            <div className="p-2 bg-mint-500/10 text-mint-400 rounded-xl group-hover:bg-mint-500 group-hover:text-mint-950 transition-all duration-300 shrink-0">
              <Award size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Premium Quality</h4>
              <p className="text-[10px] text-mint-200/50 leading-tight">100% natural organic goods.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand Info Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-br from-mint-400 to-mint-600 text-mint-950 rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-sm shadow-mint-500/10">
                <Leaf size={16} className="fill-mint-950" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Green<span className="text-mint-400 font-extrabold">Mart</span>
              </span>
            </Link>
            <p className="text-mint-200/60 text-xs leading-relaxed">
              Your trusted marketplace for premium organic and eco-friendly products. Delivering nature's finest directly to your doorstep.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2.5 pt-1">
              {socials.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.015] border border-white/[0.05] text-mint-300 flex items-center justify-center hover:bg-mint-500 hover:border-mint-500 hover:text-mint-950 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-md hover:shadow-mint-500/20"
                  title={social.name}
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 relative pl-2.5 border-l-2 border-mint-500">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-mint-200/60 font-medium">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-mint-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-1 group/link w-fit">
                    <span>{link.name}</span>
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-0.5 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all duration-200 text-mint-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links Column */}
          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 relative pl-2.5 border-l-2 border-mint-500">
              Customer Hub
            </h4>
            <ul className="space-y-2 text-xs text-mint-200/60 font-medium">
              {accountLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-mint-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-1 group/link w-fit">
                    <span>{link.name}</span>
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-0.5 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all duration-200 text-mint-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Subfooter */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-mint-200/40">
            &copy; {new Date().getFullYear()} GreenMart Inc. Organic living. All rights reserved.
          </p>

          {/* Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {["VISA", "MC", "STRIPE", "PP", "APPLE"].map((badge) => (
              <div 
                key={badge} 
                className="h-6 px-2 rounded bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-mint-200/30 hover:text-mint-400 hover:border-mint-500/20 hover:bg-white/[0.03] transition-all duration-300 select-none cursor-default"
                title={`${badge} Secured`}
              >
                <span className="text-[9px] font-black tracking-widest">{badge}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
