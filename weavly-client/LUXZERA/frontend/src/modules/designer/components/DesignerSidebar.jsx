"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Scissors,
  ShieldCheck,
  Settings,
  Lock,
  Eye,
  ExternalLink,
  LogOut,
  Mail
} from "lucide-react";
import LineSidebar from "@/shared/components/ui/LineSidebar";

export default function DesignerSidebar({
  activeTab = "designs",
  onTabChange,
  designerId,
  onLogout
}) {
  const router = useRouter();

  const sections = useMemo(
    () => [
      {
        group: "STUDIO",
        items: [
          { id: "designs", label: "Lookbooks", icon: Palette },
          { id: "commissions", label: "Commissions", icon: Scissors },
          { id: "escrow", label: "Escrow & Payouts", icon: ShieldCheck },
          { id: "profile", label: "Studio Profile", icon: Settings },
          { id: "security", label: "Security & Credentials", icon: Lock },
        ],
      },
    ],
    []
  );

  const allItems = useMemo(() => {
    return sections.flatMap((sec) =>
      sec.items.map((it) => ({
        id: it.id,
        label: it.label,
        icon: it.icon,
      }))
    );
  }, [sections]);

  const handleTabClick = (index, label, item) => {
    if (item && item.id) {
      onTabChange?.(item.id);
    }
  };

  return (
    <div className="border border-[#183B56] bg-white p-5 sm:p-6 shadow-xs w-full text-[#183B56] font-sans">
      {/* Header Index Badge */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#183B56]/20">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
            STUDIO INDEX
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
            CREATOR WORKSPACE
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
          05 TABS
        </span>
      </div>

      {/* LineSidebar Component (Matching Account section) */}
      <div className="py-1">
        <LineSidebar
          items={allItems}
          activeId={activeTab}
          accentColor="#183B56"
          textColor="#5A7184"
          markerColor="#183B56"
          showIndex={true}
          showMarker={true}
          scaleTick={false}
          proximityRadius={90}
          maxShift={12}
          markerLength={30}
          markerGap={6}
          itemGap={15}
          fontSize={0.8125}
          smoothing={70}
          onItemClick={handleTabClick}
        />
      </div>

      {/* Bottom Storefront & Support Quick Actions */}
      <div className="mt-6 pt-5 border-t border-[#183B56]/15 space-y-2">
        {designerId && (
          <button
            type="button"
            onClick={() => router.push(`/designers/${designerId}`)}
            className="w-full py-2.5 px-3 bg-[#F5EFEB] hover:bg-white text-[#183B56] border border-[#183B56]/30 hover:border-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Eye size={13} />
              <span>Public Storefront</span>
            </div>
            <ExternalLink size={11} />
          </button>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-3 bg-white hover:bg-red-50 text-[#5A7184] hover:text-red-700 border border-[#183B56]/20 hover:border-red-300 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
        >
          <LogOut size={13} />
          <span>Sign Out Securely</span>
        </button>
      </div>
    </div>
  );
}
