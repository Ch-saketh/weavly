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

  return (
    <nav className="w-full bg-white rounded-2xl border border-neutral-200/80 p-2.5 sm:p-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] overflow-y-auto max-h-[calc(100vh-120px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="space-y-4">
        {sections.map((section, sIdx) => (
          <div key={section.label}>
            {/* Section Category Label */}
            <p className="text-[10px] font-bold tracking-[0.14em] text-neutral-400 uppercase mb-1.5 px-3">
              {section.label}
            </p>

            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange?.(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-150 text-left relative group ${
                      isActive
                        ? "bg-neutral-900 text-white font-semibold shadow-xs"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon 
                        size={16} 
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className={`transition-colors duration-150 shrink-0 ${
                          isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-900"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {isActive && (
                      <ChevronRight size={14} strokeWidth={2.4} className="text-neutral-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Subtle Divider */}
            {sIdx < sections.length - 1 && (
              <div className="mt-3.5 mb-1 border-b border-neutral-100" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default AccountSidebar;