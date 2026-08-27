"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";

export default function MobileBottomNav({ cartCount = 0, wardrobeCount = 0, currentUser, onAuthClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserLoggedIn = mounted && currentUser;

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Market",
      path: "/market",
      icon: Search,
      isActive: pathname.startsWith("/market") || pathname.startsWith("/men") || pathname.startsWith("/women") || pathname.startsWith("/unisex") || pathname.startsWith("/kids"),
    },
    {
      label: "Wardrobe",
      path: "/wardrobe",
      icon: Heart,
      badge: mounted ? wardrobeCount : 0,
      isActive: pathname === "/wardrobe",
    },
    {
      label: "Bag",
      path: "/cart",
      icon: ShoppingBag,
      badge: mounted ? cartCount : 0,
      isActive: pathname === "/cart",
    },
    {
      label: isUserLoggedIn ? "Account" : "Sign In",
      path: isUserLoggedIn ? "/account" : "#auth",
      icon: User,
      isActive: pathname === "/account" || pathname === "/orders",
      action: !isUserLoggedIn ? onAuthClick : null,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#ECECEC] pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                router.push(item.path);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] relative transition-all duration-200 cursor-pointer border-none bg-transparent ${
              item.isActive ? "text-[#F07020]" : "text-[#9B9B9B] hover:text-[#37352F]"
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={item.isActive ? 2.2 : 1.7} />
              {Boolean(item.badge) && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#F07020] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-1 font-medium ${
              item.isActive ? "font-bold text-[#F07020]" : "text-[#9B9B9B]"
            }`}>
              {item.label}
            </span>

            {item.isActive && (
              <span className="absolute bottom-0 w-8 h-[2px] bg-[#F07020] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
