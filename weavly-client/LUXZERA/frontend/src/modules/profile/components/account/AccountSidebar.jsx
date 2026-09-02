import React from "react";
import { User, Lock, MapPin, Sliders, Sparkles, CreditCard, Package, LifeBuoy } from "lucide-react";
import LineSidebar from "@/shared/components/ui/LineSidebar";

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

      {/* ── DESKTOP ARCHITECTURAL LINE SIDEBAR (>= md) ── */}
      <nav className="hidden md:block w-full bg-[#F5EFEB] border border-[#183B56] p-5 shadow-xs">
        <div className="mb-4 pb-3 border-b border-[#183B56]/20 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-[0.25em] text-[#5A7184] uppercase block">
              Menu Index
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B56] mt-0.5">
              Account Studio
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#183B56] bg-white border border-[#183B56] px-2 py-0.5">
            08 TABS
          </span>
        </div>

        <LineSidebar
          items={allItems}
          activeId={activeTab}
          accentColor="#183B56"
          textColor="#5A7184"
          markerColor="#183B56"
          showIndex={true}
          showMarker={true}
          scaleTick={true}
          proximityRadius={90}
          maxShift={18}
          markerLength={34}
          markerGap={6}
          itemGap={14}
          fontSize={0.8125}
          smoothing={120}
          onItemClick={(idx, label, item) => {
            const targetId = item?.id || allItems[idx]?.id;
            if (targetId) onTabChange?.(targetId);
          }}
        />
      </nav>
    </>
  );
};

export default AccountSidebar;