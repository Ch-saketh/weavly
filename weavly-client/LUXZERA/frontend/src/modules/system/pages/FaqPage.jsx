"use client";

// src/modules/system/pages/FaqPage.jsx
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Scissors,
  ShieldCheck,
  User,
  MessageCircle,
  Mail,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

const FAQ_DATA = [
  {
    category: "Zyra Virtual Stylist",
    icon: "Sparkles",
    items: [
      {
        q: "How does the Zyra recommendation engine personalize outfits?",
        a: "Zyra analyzes your selected style preferences, body definitions, and occasion affinities (such as Wedding, Formal, College, Party, Casual, or Sport) to generate personalized mathematical vector embeddings. It matches these vectors against our fashion catalog in real-time, strictly factoring in your gender and occasion compatibility while filtering out non-wearable products.",
        tag: "Algorithm"
      },
      {
        q: "Is my body measurement and photo data safe with Zyra?",
        a: "Yes, absolutely. Your biometric measurements and fitting photos are processed in encrypted memory solely to calibrate garment fit and styling scores. We never feed your private photos into public generative models, and we never sell your measurement profile to third-party data brokers.",
        tag: "Security"
      },
      {
        q: "How do I update or reset my Zyra styling preferences?",
        a: "You can update your sizing, body shape, preferred categories, and occasion affinities at any time by visiting your Profile settings. Updating your profile instantly invalidates outdated recommendation caches and generates fresh recommendations.",
        tag: "Profile"
      },
      {
        q: "Why do different occasion tabs show distinct fashion categories?",
        a: "Zyra uses semantic occasion affinity matching. For example, selecting 'Wedding' prioritizes kurtas, palazzos, lehengas, and sarees; 'Formal' curates blazers, trousers, and derbys; while 'College' focuses on premium denim jeans, tees, and hoodies.",
        tag: "Occasions"
      }
    ]
  },
  {
    category: "Bespoke Atelier & Designers",
    icon: "Scissors",
    items: [
      {
        q: "How do custom couture commissions work?",
        a: "Through the Designer Studio, patrons can commission custom garments directly from verified couturiers. You submit your design vision, fabric preferences, and exact body measurements. The designer creates tailored digital lookbooks and milestone sketches before handcrafting your bespoke garment.",
        tag: "Custom Couture"
      },
      {
        q: "How are patron funds protected during custom commissions?",
        a: "Weavly operates a milestone-based bespoke escrow system. Your payment is securely held by the platform and only released to the designer upon verified proof of crafting completion and garment inspection.",
        tag: "Escrow"
      },
      {
        q: "How do independent designers apply to sell on Weavly?",
        a: "Fashion designers and couture ateliers can apply through the 'Become a Designer' portal. Our curation committee reviews portfolio authenticity, fabric sourcing standards, and craftsmanship quality before granting verified atelier status.",
        tag: "Atelier"
      }
    ]
  },
  {
    category: "Orders, Shipping & Delivery",
    icon: "ShoppingBag",
    items: [
      {
        q: "How long does shipping take for ready-to-wear drops vs custom garments?",
        a: "Curated ready-to-wear drops are dispatched within 24–48 business hours with an estimated delivery window of 3–7 business days. Custom couture commissions require 10–21 business days to handcraft, depending on the complexity of hand-embroidery and tailoring.",
        tag: "Shipping"
      },
      {
        q: "Do you offer complimentary insured shipping?",
        a: "Yes. All domestic orders over ₹1,999 (or $150) include complimentary insured priority courier delivery with door-to-door GPS tracking and signature confirmation.",
        tag: "Complimentary"
      },
      {
        q: "How can I track my active order status?",
        a: "Once dispatched, tracking links are sent via email and updated live under the 'My Orders' section in your account dashboard.",
        tag: "Tracking"
      }
    ]
  },
  {
    category: "Returns, Refunds & Alterations",
    icon: "RotateCcw",
    items: [
      {
        q: "What is your return policy on standard ready-to-wear garments?",
        a: "We provide an unconditional 30-day return policy for ready-to-wear drops. Garments must be unworn, unwashed, and returned in their original luxury packaging with tags intact. Complimentary prepaid return labels are generated via your account.",
        tag: "30-Day Window"
      },
      {
        q: "What if a bespoke custom-made garment does not fit perfectly?",
        a: "All verified designers adhere to our Fit Integrity Standard. If a made-to-measure garment deviates by more than 1.5 inches from the agreed specifications, the designer will provide complimentary alterations or tailoring remakes.",
        tag: "Fit Guarantee"
      },
      {
        q: "How quickly are refunds processed?",
        a: "Following swift quality inspection at our atelier intake hub, refunds are credited back to your original payment method within 3–5 business days.",
        tag: "Refunds"
      }
    ]
  },
  {
    category: "Payments, Account & Privacy",
    icon: "ShieldCheck",
    items: [
      {
        q: "What payment gateways and methods are accepted?",
        a: "We accept Visa, Mastercard, American Express, Apple Pay, PayPal, and UPI. All checkout sessions are encrypted via 256-bit SSL and processed through PCI-DSS Level 1 compliant gateways.",
        tag: "PCI-DSS"
      },
      {
        q: "How do I permanently delete my account and data?",
        a: "Under our GDPR/CCPA Human-First Policy, you have unilateral right to erasure. You can permanently delete your account, uploaded fitting pictures, and styling vectors with one click inside Account Settings.",
        tag: "Privacy"
      },
      {
        q: "Are my payment details stored on Weavly servers?",
        a: "Never. We never store raw credit card numbers, expiration dates, or CVVs on our application databases. Transactions utilize encrypted tokens generated directly by our banking partners.",
        tag: "Security"
      }
    ]
  }
];

function FaqAccordionItem({ item, isOpen, onToggle }) {
  const [copied, setCopied] = useState(false);

  const copyAnswer = (e) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${item.q}\n\n${item.a}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-[#183B56]/15 rounded-xl bg-white transition-all duration-200 overflow-hidden shadow-2xs hover:border-[#183B56]/30">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer bg-transparent border-none"
        aria-expanded={isOpen}
      >
        <div className="space-y-1.5 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#183B56] bg-[#183B56]/10 px-2 py-0.5 rounded-xs">
              {item.tag}
            </span>
          </div>
          <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight leading-snug transition-colors
            ${isOpen ? "text-[#183B56]" : "text-[#183B56]/90 hover:text-[#183B56]"}`}>
            {item.q}
          </h3>
        </div>

        <div className="shrink-0 pt-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200
            ${isOpen ? "bg-[#183B56] text-white rotate-180" : "bg-[#E2EAEF] text-[#183B56]"}`}>
            <ChevronDown size={14} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-[#183B56]/10 bg-[#F5EFEB]/30 space-y-4">
          <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
            {item.a}
          </p>
          <div className="flex items-center justify-between pt-2 text-[11px] text-[#5A7184] border-t border-[#183B56]/10">
            <span className="flex items-center gap-1.5 font-semibold text-[#183B56]">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Verified Weavly Policy</span>
            </span>
            <button
              onClick={copyAnswer}
              className="inline-flex items-center gap-1 text-[#5A7184] hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer p-0 font-medium"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openQuestion, setOpenQuestion] = useState(null);

  const categories = ["All", ...FAQ_DATA.map((d) => d.category)];

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = [];

    FAQ_DATA.forEach((cat) => {
      if (activeCategory === "All" || activeCategory === cat.category) {
        cat.items.forEach((item) => {
          const matchQ = item.q.toLowerCase().includes(q);
          const matchA = item.a.toLowerCase().includes(q);
          const matchTag = item.tag.toLowerCase().includes(q);
          if (!q || matchQ || matchA || matchTag) {
            list.push({ ...item, categoryName: cat.category });
          }
        });
      }
    });

    return list;
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      
      {/* ── Editorial Header ── */}
      <div className="relative border-b border-[#183B56]/15 bg-gradient-to-b from-white/60 to-[#F5EFEB] pt-20 pb-16 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A7184]">
              <button 
                onClick={() => router.push("/")} 
                className="hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer p-0"
              >
                Weavly
              </button>
              <span>/</span>
              <span className="text-[#183B56]">Support &amp; Concierge</span>
              <span>/</span>
              <span className="text-[#183B56]">Help &amp; FAQs</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183B56]/10 border border-[#183B56]/20 text-[#183B56] text-[11px] font-semibold">
              <Sparkles size={13} className="text-[#183B56]" />
              <span>Atelier Concierge Active</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#183B56]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#183B56]">
                Patron Assistance &amp; Knowledge Base
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#183B56] leading-[0.92]">
              Frequently Asked<br />
              <span className="font-serif italic font-normal lowercase text-[#183B56]/90">questions &amp; answers.</span>
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#5A7184] leading-relaxed font-medium pt-2">
              Explore guidelines on Zyra styling, custom couture commissions, insured shipping timelines, fit integrity guarantees, and our 30-day return policy.
            </p>
          </div>

          {/* Real-time Search Input */}
          <div className="mt-8 max-w-2xl relative">
            <div className="relative flex items-center bg-white border border-[#183B56]/30 rounded-xl shadow-xs overflow-hidden focus-within:border-[#183B56] focus-within:ring-2 focus-within:ring-[#183B56]/10 transition-all">
              <Search size={18} className="text-[#5A7184] ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g., Zyra styling, returns, bespoke couture, measurements, fabrics)..."
                className="w-full py-3.5 pl-3 pr-4 text-xs font-medium text-[#183B56] placeholder-[#8E8E93] bg-transparent border-none outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-3 text-xs font-bold text-[#5A7184] hover:text-[#183B56] cursor-pointer border-none bg-transparent p-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Main Interactive Section ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border
                ${activeCategory === cat
                  ? "bg-[#183B56] text-white border-[#183B56] shadow-2xs"
                  : "bg-white text-[#5A7184] border-[#183B56]/15 hover:border-[#183B56] hover:text-[#183B56]"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#183B56]/15 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                {activeCategory} Articles ({filteredFaqs.length})
              </p>
              {searchQuery && (
                <p className="text-xs text-[#5A7184] font-medium">
                  Showing matches for "{searchQuery}"
                </p>
              )}
            </div>

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, index) => {
                const key = `${item.categoryName}-${index}`;
                return (
                  <FaqAccordionItem
                    key={key}
                    item={item}
                    isOpen={openQuestion === key}
                    onToggle={() => setOpenQuestion(openQuestion === key ? null : key)}
                  />
                );
              })
            ) : (
              <div className="text-center py-16 bg-white border border-[#183B56]/15 rounded-2xl p-8 space-y-3">
                <HelpCircle size={32} className="mx-auto text-[#5A7184]" />
                <h3 className="text-base font-bold text-[#183B56]">No answers matched your search</h3>
                <p className="text-xs text-[#5A7184] max-w-sm mx-auto font-medium">
                  Try adjusting your search terms or reach out directly to our 24/7 Atelier Concierge.
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#183B56] text-white rounded-md cursor-pointer border-none mt-2"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>

          {/* Quick Concierge Support Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Concierge Desk */}
            <div className="bg-[#183B56] text-white rounded-2xl p-6 shadow-xs space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                  <MessageCircle size={15} />
                  <span>Patron Concierge</span>
                </div>
                <h3 className="text-lg font-bold">Have a specific question?</h3>
                <p className="text-xs text-white/80 leading-relaxed font-normal">
                  Our dedicated styling consultants and order specialists are on standby to assist with bespoke commissions, garment measurements, and luxury drop inquiries.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-white/10 rounded-xl border border-white/15 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">Direct Email Assistance</p>
                    <p className="text-white/70 text-[11px]">support@weavly.com</p>
                  </div>
                  <a
                    href="mailto:support@weavly.com"
                    className="px-3 py-1.5 rounded-md bg-white text-[#183B56] font-bold text-[11px] uppercase tracking-wider hover:bg-white/90 transition-all text-decoration-none inline-block"
                  >
                    Email
                  </a>
                </div>

                <div className="p-3 bg-white/10 rounded-xl border border-white/15 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">Designer Studio Desk</p>
                    <p className="text-white/70 text-[11px]">atelier@weavly.com</p>
                  </div>
                  <a
                    href="mailto:atelier@weavly.com"
                    className="px-3 py-1.5 rounded-md bg-white text-[#183B56] font-bold text-[11px] uppercase tracking-wider hover:bg-white/90 transition-all text-decoration-none inline-block"
                  >
                    Atelier
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Policies Navigation */}
            <div className="bg-white border border-[#183B56]/20 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56] pb-2 border-b border-[#183B56]/10">
                Official Policy Documents
              </h4>
              <ul className="space-y-3 p-0 m-0 list-none text-xs">
                <li>
                  <button
                    onClick={() => router.push("/privacy")}
                    className="w-full flex items-center justify-between text-left font-medium text-[#5A7184] hover:text-[#183B56] cursor-pointer border-none bg-transparent p-0 transition-colors"
                  >
                    <span>Privacy &amp; Data Protection Vow</span>
                    <ArrowRight size={13} />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/terms")}
                    className="w-full flex items-center justify-between text-left font-medium text-[#5A7184] hover:text-[#183B56] cursor-pointer border-none bg-transparent p-0 transition-colors"
                  >
                    <span>Terms of Service &amp; Atelier Standards</span>
                    <ArrowRight size={13} />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/designer-studio")}
                    className="w-full flex items-center justify-between text-left font-medium text-[#5A7184] hover:text-[#183B56] cursor-pointer border-none bg-transparent p-0 transition-colors"
                  >
                    <span>Custom Couture Commission Guide</span>
                    <ArrowRight size={13} />
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}