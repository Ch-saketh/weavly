"use client";

import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Scissors,
  ShieldCheck,
  Settings,
  Lock,
  Eye,
  ExternalLink,
  LogOut
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
        label: "Studio",
        items: [
          { id: "designs", label: "Lookbooks", icon: Palette },
          { id: "commissions", label: "Commissions", icon: Scissors },
          { id: "escrow", label: "Escrow Vault", icon: ShieldCheck },
          { id: "profile", label: "Studio Profile", icon: Settings },
          { id: "security", label: "Security", icon: Lock },
        ],
      },
    ],
    []
  );

  const allItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const handleTabClick = useCallback(
    (idx, label, item) => {
      const targetId = item?.id || allItems[idx]?.id;
      if (targetId) onTabChange?.(targetId);
    },
    [allItems, onTabChange]
  );

  return (
    <>
      {/* ── MOBILE HORIZONTAL SCROLLABLE BAR (< md) ── */}
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
                    : "bg-white text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
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
      <nav className="hidden md:block w-full bg-[#F5EFEB] border border-[#183B56] p-5 shadow-xs text-[#183B56] font-sans">
        {/* Header Index Badge */}
        <div className="mb-4 pb-3 border-b border-[#183B56]/20 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-[0.25em] text-[#5A7184] uppercase block">
              Menu Index
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B56] mt-0.5">
              Creator Studio
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#183B56] bg-white border border-[#183B56] px-2 py-0.5">
            05 TABS
          </span>
        </div>

        {/* LineSidebar Component */}
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
            maxShift={10}
            markerLength={28}
            markerGap={6}
            itemGap={15}
            fontSize={0.8125}
            smoothing={70}
            onItemClick={handleTabClick}
          />
        </div>

        {/* Storefront & Sign Out Actions */}
        <div className="mt-6 pt-5 border-t border-[#183B56]/15 space-y-2">
          {designerId && (
            <button
              type="button"
              onClick={() => router.push(`/designers/${designerId}`)}
              className="w-full py-2.5 px-3 bg-white hover:bg-[#183B56] text-[#183B56] hover:text-white border border-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between shadow-2xs"
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
            className="w-full py-2.5 px-3 bg-[#F5EFEB] hover:bg-red-50 text-[#5A7184] hover:text-red-700 border border-[#183B56]/30 hover:border-red-400 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
          >
            <LogOut size={13} />
            <span>Sign Out Securely</span>
          </button>
        </div>
      </nav>
    </>
  );
}
