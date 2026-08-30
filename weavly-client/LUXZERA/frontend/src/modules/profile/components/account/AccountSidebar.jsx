import React from "react";
import { User, Lock, MapPin, Sliders, Sparkles, CreditCard, Package, LifeBuoy, ChevronRight } from "lucide-react";

const AccountSidebar = ({ activeTab = 'profile', onTabChange }) => {
  const sections = [
    {
      label: "Profile",
      items: [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'measurements', label: 'Fit & Style', icon: Sliders },
        { id: 'recommendations', label: 'Style Inspiration', icon: Sparkles },
      ]
    },
    {
      label: "Account",
      items: [
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'password', label: 'Security', icon: Lock },
        { id: 'payments', label: 'Payments', icon: CreditCard },
      ]
    },
    {
      label: "Help",
      items: [
        { id: 'support', label: 'Customer Care', icon: LifeBuoy },
      ]
    }
  ];

  const allItems = sections.flatMap(s => s.items);

  return (
    <>
      {/* ── MOBILE HORIZONTAL SCROLLABLE SEGMENTED BAR (< md) ── */}
      <div className="md:hidden w-full mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange?.(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                  isActive
                    ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                    : "bg-transparent text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                }`}
              >
                <Icon size={13} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP ARCHITECTURAL SIDEBAR BOX (>= md) ── */}
      <nav className="hidden md:block w-full bg-[#F5EFEB] border border-[#183B56] p-4 shadow-xs">
        <div className="space-y-4">
          {sections.map((section, sIdx) => (
            <div key={section.label}>
              {/* Section Category Label */}
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#5A7184] uppercase mb-1.5 px-2">
                {section.label}
              </p>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onTabChange?.(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-[13px] font-bold transition-all text-left border cursor-pointer ${
                        isActive
                          ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                          : "bg-transparent text-[#183B56] border-transparent hover:border-[#183B56]/40 hover:bg-[#183B56]/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon 
                          size={15} 
                          className={isActive ? "text-white" : "text-[#183B56]"}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {isActive && (
                        <span className="text-sm font-normal leading-none text-white">→</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Blueprint Divider */}
              {sIdx < sections.length - 1 && (
                <div className="mt-3.5 mb-1 border-b border-[#183B56]/20" />
              )}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default AccountSidebar;