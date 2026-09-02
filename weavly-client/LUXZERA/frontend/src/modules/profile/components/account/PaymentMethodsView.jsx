"use client";

import React, { useState } from "react";
import { CreditCard, Shield, Clock, Check, Bell, Lock, ArrowRight } from "lucide-react";

const PaymentMethodsView = () => {
  const [notified, setNotified] = useState(false);

  return (
    <div className="space-y-8">
      {/* ── Main Header ── */}
      <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#183B56]/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-[#183B56]" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Billing &amp; Settlement
              </span>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
                Payment Methods &amp; Escrow
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B56] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-1">
              IN ACTIVE DEVELOPMENT
            </span>
          </div>
        </div>

        {/* Development Status Notice */}
        <div className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#183B56]">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Payment Gateway Integration in Progress
            </span>
          </div>

          <p className="text-sm text-[#183B56] font-medium leading-relaxed max-w-2xl">
            Our multi-currency escrow payment infrastructure is currently undergoing regulatory compliance audits and direct banking integration. Online automated card payments and instant wallet settlements will debut in our upcoming release.
          </p>

          <div className="pt-2 border-t border-[#183B56]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-[#5A7184] font-medium">
              ✦ Made-to-measure orders are currently settled via Concierge Bank Wire &amp; Verified Escrow Invoices.
            </p>

            <button
              onClick={() => setNotified(true)}
              disabled={notified}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#183B56] transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                notified
                  ? "bg-[#183B56] text-white"
                  : "bg-white text-[#183B56] hover:bg-[#183B56] hover:text-white"
              }`}
            >
              {notified ? (
                <>
                  <Check size={13} />
                  <span>Notification Saved</span>
                </>
              ) : (
                <>
                  <Bell size={13} />
                  <span>Notify Me at Launch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Upcoming Features & Escrow Architecture ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Shield,
            step: '01',
            title: '100% Escrow Vault',
            desc: 'Funds are securely locked in smart escrow vaults. Artisans only receive payout once you receive the garment and confirm fit.'
          },
          {
            icon: CreditCard,
            step: '02',
            title: 'Global Multi-Currency',
            desc: 'Direct card checkout supporting USD, EUR, GBP, and INR with zero foreign transaction markups for international patrons.'
          },
          {
            icon: Lock,
            step: '03',
            title: 'Vault Security',
            desc: 'End-to-end PCI-DSS Level 1 compliant tokenization. Your financial credentials are never exposed or stored in plain text.'
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="border border-[#183B56] bg-white p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center">
                    <Icon size={15} className="text-[#183B56]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#5A7184] bg-[#F5EFEB] border border-[#183B56]/20 px-2 py-0.5">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold uppercase text-[#183B56]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5A7184] font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#183B56]/10 text-[10px] font-bold uppercase text-[#183B56] flex items-center gap-1">
                <span>Phase 2 Feature</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Direct Invoicing Assistance ── */}
      <div className="border border-[#183B56] bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="text-sm font-bold uppercase text-[#183B56]">
            Have an immediate bespoke order or commission?
          </h4>
          <p className="text-xs text-[#5A7184] font-medium mt-1">
            Our Concierge Support team will prepare an instant verified escrow invoice for your order.
          </p>
        </div>

        <a
          href="mailto:chokkapusaketh@gmail.com?subject=Weavly%20Bespoke%20Order%20Payment%20Inquiry"
          className="px-6 py-3 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs no-underline"
        >
          <span>Request Invoicing</span>
          <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
};

export default PaymentMethodsView;
