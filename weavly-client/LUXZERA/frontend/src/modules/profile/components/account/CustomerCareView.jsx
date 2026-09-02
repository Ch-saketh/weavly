"use client";

import React, { useState } from "react";
import { LifeBuoy, Mail, ChevronDown, Send, Check, Copy, MessageSquare, Clock, ShieldCheck, ExternalLink } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "fit-guarantee",
    category: "Fit & Alterations",
    question: "What happens if my made-to-measure garment does not fit perfectly?",
    answer: "Every order on Weavly is protected by our 100% Escrow Fit Guarantee. If any dimension requires adjustment, you have two options within 72 hours of delivery: 1) We provide complimentary reimbursement for local alterations (up to $100), or 2) The designer will recraft the piece at zero additional cost."
  },
  {
    id: "production-shipping",
    category: "Delivery & Tracking",
    question: "How long does bespoke crafting and international shipping take?",
    answer: "Independent artisans require 7–14 business days to precision-cut and tailor your piece according to your fit profile. Once inspected at our quality checkpoint, expedited worldwide courier delivery takes 3–5 business days with insured step-by-step tracking."
  },
  {
    id: "escrow-payout",
    category: "Escrow & Payments",
    question: "How does the Escrow Vault protect my money?",
    answer: "When you place a commission, your funds are secured in the Weavly Escrow Vault. The artisan never receives payment upfront; escrow funds are only released to the designer once you physically receive the garment, try it on, and confirm your fit satisfaction."
  },
  {
    id: "designer-commissions",
    category: "Commissions",
    question: "Can I request custom fabric choices or alterations to a designer's lookbook?",
    answer: "Yes! Verified designers on Weavly welcome custom drape adjustments, bespoke lining selections, and personalized lapel/hem configurations. You can initiate a custom inquiry directly from any Lookbook capsule card."
  },
  {
    id: "care-instructions",
    category: "Garment Care",
    question: "How should I care for hand-draped linen, raw cotton, and bespoke silk?",
    answer: "Each garment arrives with an individual artisan care booklet and QR code detailing the exact textile mill, yarn weight, and dry-cleaning or hand-steaming guidelines. Most tailored wools and silks should be professionally dry-cleaned only."
  }
];

const CustomerCareView = () => {
  const [activeTab, setActiveTab] = useState("faq"); // "faq" or "email"
  const [expandedFaq, setExpandedFaq] = useState("fit-guarantee");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [formState, setFormState] = useState({
    subject: "Order & Sizing Assistance",
    message: "",
    orderId: ""
  });
  const [sentSuccess, setSentSuccess] = useState(false);

  const SUPPORT_EMAIL = "chokkapusaketh@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!formState.message.trim()) return;

    const subjectLine = encodeURIComponent(
      `[Weavly Support] ${formState.subject}${formState.orderId ? ` - Order #${formState.orderId}` : ""}`
    );
    const bodyContent = encodeURIComponent(
      `Inquiry Category: ${formState.subject}\n` +
      `${formState.orderId ? `Order Reference: ${formState.orderId}\n` : ""}` +
      `\nMessage:\n${formState.message}\n\n--\nSent from Weavly Account Concierge`
    );

    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subjectLine}&body=${bodyContent}`, "_blank");
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 6000);
  };

  return (
    <div className="space-y-8">
      {/* ── Main Header ── */}
      <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#183B56]/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center shrink-0">
              <LifeBuoy size={18} className="text-[#183B56]" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Support &amp; Assistance
              </span>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
                Customer Care &amp; Concierge Desk
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B56] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-1">
              CONCIERGE ACTIVE
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border border-[#183B56] bg-[#F5EFEB] p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "faq"
                ? "bg-[#183B56] text-white shadow-xs"
                : "bg-transparent text-[#183B56] hover:bg-white/60"
            }`}
          >
            <MessageSquare size={14} />
            <span>01 Common Inquiries (Instant Answers)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "email"
                ? "bg-[#183B56] text-white shadow-xs"
                : "bg-transparent text-[#183B56] hover:bg-white/60"
            }`}
          >
            <Mail size={14} />
            <span>02 Direct Concierge Mail</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: PRE-PREPARED INSTANT FAQ ANSWERS ── */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#183B56]/20">
              <h3 className="text-sm font-bold uppercase text-[#183B56]">
                Frequently Answered Scenarios
              </h3>
              <span className="text-[10px] font-mono text-[#5A7184] uppercase">
                5 Topics Prepared
              </span>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((faq) => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`border transition-all ${
                      isExpanded ? "border-[#183B56] bg-[#F5EFEB]/40" : "border-[#183B56]/30 bg-white hover:border-[#183B56]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                      className="w-full text-left p-4.5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5A7184] bg-[#DFE7ED] px-2 py-0.5 inline-block">
                          {faq.category}
                        </span>
                        <h4 className="text-sm font-bold text-[#183B56] uppercase">
                          {faq.question}
                        </h4>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-[#183B56] shrink-0 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-4.5 pt-0 text-xs text-[#5A7184] font-medium leading-relaxed border-t border-[#183B56]/15 mt-2 bg-white/70">
                        <p className="pt-3">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Need Further Help Prompt */}
          <div className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Still have a worry or unique inquiry?
              </span>
              <h4 className="text-sm font-bold uppercase text-[#183B56] mt-0.5">
                Send a direct message to our founder concierge.
              </h4>
              <p className="text-xs text-[#5A7184] font-medium mt-1">
                Direct email: <span className="font-mono font-bold text-[#183B56]">{SUPPORT_EMAIL}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className="px-6 py-3 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
            >
              <span>Write a Message</span>
              <Mail size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: DIRECT CONCIERGE EMAIL DISPATCHER ── */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#183B56]/20">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                  Direct Inquiries
                </span>
                <h3 className="text-base font-bold uppercase text-[#183B56]">
                  Message the Founder &amp; Concierge Desk
                </h3>
              </div>

              {/* Direct Mail Pill */}
              <div className="flex items-center gap-2 bg-[#F5EFEB] border border-[#183B56] px-3 py-1.5 self-start sm:self-auto">
                <Mail size={13} className="text-[#183B56]" />
                <span className="text-xs font-mono font-bold text-[#183B56]">
                  {SUPPORT_EMAIL}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="ml-2 text-[10px] uppercase font-bold text-[#183B56] hover:underline cursor-pointer flex items-center gap-1"
                >
                  {copiedEmail ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>{copiedEmail ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {sentSuccess && (
              <div className="px-4 py-3 mb-6 bg-[#F5EFEB] border border-[#183B56] text-xs font-bold text-[#183B56] flex items-center gap-2">
                <Check size={15} strokeWidth={2.5} />
                <span>Your email draft has been generated and opened in your email client. We reply within 2–4 hours!</span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A7184] mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full h-[44px] px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  >
                    <option value="Order & Sizing Assistance">Order &amp; Sizing Assistance</option>
                    <option value="Custom Alteration Request">Custom Alteration Request</option>
                    <option value="Bespoke Commission Inquiry">Bespoke Commission Inquiry</option>
                    <option value="Escrow Settlement & Payout">Escrow Settlement &amp; Payout</option>
                    <option value="General Patrons Question">General Patrons Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A7184] mb-1.5">
                    Order Reference # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LZ-94827"
                    value={formState.orderId}
                    onChange={(e) => setFormState({ ...formState, orderId: e.target.value })}
                    className="w-full h-[44px] px-4 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] placeholder-[#5A7184]/50 outline-none focus:ring-1 focus:ring-[#183B56]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A7184] mb-1.5">
                  Your Message or Concern
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your question or worry in detail. We will inspect your sizing and account records to provide a complete solution."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full p-4 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] placeholder-[#5A7184]/50 outline-none focus:ring-1 focus:ring-[#183B56] leading-relaxed resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Send size={13} />
                  <span>Send to chokkapusaketh@gmail.com</span>
                </button>

                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Weavly%20Concierge%20Inquiry`}
                  className="text-xs font-bold uppercase tracking-wider text-[#183B56] hover:underline flex items-center gap-1.5"
                >
                  <span>Open Mail App Directly</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </form>
          </div>

          {/* Concierge Guarantee Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: '2–4h Response Window', desc: 'Direct assistance directly from founder & head stylist.' },
              { icon: ShieldCheck, title: '100% Escrow Protection', desc: 'All issues handled with full patron financial security.' },
              { icon: Mail, title: 'Archived Correspondence', desc: 'All inquiries logged to your registered email account.' },
            ].map((box, i) => {
              const Icon = box.icon;
              return (
                <div key={i} className="border border-[#183B56] bg-[#F5EFEB] p-5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-[#183B56]" />
                    <span className="text-xs font-bold uppercase text-[#183B56]">{box.title}</span>
                  </div>
                  <p className="text-[11px] text-[#5A7184] font-medium leading-relaxed">{box.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCareView;
