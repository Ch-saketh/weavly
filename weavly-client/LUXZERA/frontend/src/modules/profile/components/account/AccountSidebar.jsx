import React from "react";
import { User, Lock, MapPin, Sliders, Sparkles, CreditCard, Package, LifeBuoy, ChevronRight } from "lucide-react";

const AccountSidebar = ({ activeTab = 'profile', onTabChange }) => {
  const sections = [
    {
      label: "PROFILE",
      items: [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'measurements', label: 'Fit & Style', icon: Sliders },
        { id: 'recommendations', label: 'Style Inspiration', icon: Sparkles },
      ]
    },
    {
      label: "ACCOUNT",
      items: [
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'password', label: 'Security', icon: Lock },
        { id: 'payments', label: 'Payments', icon: CreditCard },
      ]
    },
    {
      label: "HELP",
      items: [
        { id: 'support', label: 'Customer Care', icon: LifeBuoy },
      ]
    }
  ];

  return (
    <nav className="w-full font-satoshi bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="space-y-5">
        {sections.map((section, sIdx) => (
          <div key={section.label}>
            {/* Section Category Label - Increased contrast & weight */}
            <p className="text-[11px] font-black tracking-[0.16em] text-slate-700 font-satoshi uppercase mb-2.5 px-2">
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
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[14.5px] transition-all duration-200 text-left font-satoshi relative group ${
                      isActive
                        ? "bg-[#F5EDE4] text-slate-950 font-extrabold border border-[#E8DFD4] shadow-xs"
                        : "text-slate-800 hover:bg-slate-100/80 hover:text-slate-950 font-bold border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Left accent indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-5 bg-[#C8702A] rounded-r-full" />
                      )}
                      
                      <Icon 
                        size={19} 
                        strokeWidth={isActive ? 2.4 : 2.0}
                        className={`transition-colors duration-200 flex-shrink-0 ${
                          isActive ? "text-[#C8702A]" : "text-slate-600 group-hover:text-slate-950"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {isActive && (
                      <ChevronRight size={16} strokeWidth={2.5} className="text-[#C8702A]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Section Divider */}
            {sIdx < sections.length - 1 && (
              <div className="mt-4 border-b border-slate-200/80" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default AccountSidebar;