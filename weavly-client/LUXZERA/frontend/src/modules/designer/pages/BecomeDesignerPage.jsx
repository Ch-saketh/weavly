"use client";

// src/pages/BecomeDesignerPage.jsx
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Play, CheckCircle2, ChevronDown, ChevronRight, ChevronLeft,
  Shield, Star, TrendingUp, Users, Package, BarChart2, CreditCard,
  Megaphone, Heart, Award, Lock
} from "lucide-react";

/* ─── tiny helpers ─────────────────────────────────── */
const Tag = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#F07020] border border-[#F07020]/30 bg-[#F07020]/8 px-3 py-1.5 rounded-full">
    <span className="w-1.5 h-1.5 rounded-full bg-[#F07020] inline-block" />
    {children}
  </span>
);

const SectionLabel = ({ children }) => (
  <p className="text-[9px] font-extrabold uppercase tracking-[0.38em] text-[#C6A15B] mb-4">{children}</p>
);

/* ─── data ──────────────────────────────────────────── */
const HOW_IT_WORKS = [
  { n: "1", title: "Post Your Creations", desc: "Upload photos and lookbooks of your designer creations in 2 minutes." },
  { n: "2", title: "Custom Tailoring or Ready Buy", desc: "Customers can purchase ready sizes or send custom body measurements for bespoke fit." },
  { n: "3", title: "Weavly Branded Packaging", desc: "Ship your garment in official Weavly garment covers or co-branded luxury boxes." },
  { n: "4", title: "100% Escrow Protection", desc: "Customer pays 50% upfront or 100% in escrow. Funds are held safely until delivery." },
  { n: "5", title: "Satisfied Customer Payout", desc: "Once the customer receives and confirms satisfaction with their garment, your payout is instantly released." },
  { n: "6", title: "Nominal Ad Campaigns", desc: "Boost your sales with optional ad campaigns starting at nominal charges up to ₹2,000." },
];

const POWERFUL_FEATURES = [
  { title: "Bespoke Measurement Tool", desc: "Accept custom customer body measurements directly into your order queue." },
  { title: "Escrow & Milestone Payouts", desc: "50% deposit on order finalization, 50% on delivery receipt with 100% satisfaction guarantee." },
  { title: "Weavly Packaging Covers", desc: "Complimentary Weavly luxury garment bags and branded tissue paper provided to all creators." },
  { title: "Nominal Advertising (Up to ₹2,000)", desc: "Spotlight your designs in homepage hero banners with nominal ad spend limits." },
  { title: "Designer Identity Studio", desc: "Build your creator story, logo, lookbook galleries, and verified atelier badge." },
  { title: "Multi-Currency Checkout", desc: "Automatic real-time currency conversion for buyers across 100+ countries." },
  { title: "Order & Inventory Control", desc: "Manage bespoke commissions, stock alerts, and production timelines seamlessly." },
  { title: "Real-time Sales Analytics", desc: "Track views, revenue, customer demographics, and order satisfaction scores." },
];

const MORE_SUPPORT = [
  { title: "24/7 Creator Support", desc: "Direct concierge support for custom measurement queries & shipments." },
  { title: "Weavly Packaging Logistics", desc: "Free delivery of Weavly garment bags & co-branded packaging boxes." },
  { title: "Escrow Settlement Support", desc: "Dedicated dispute resolution team protecting creators and buyers." },
  { title: "Global PR & Showcases", desc: "Get featured in seasonal Weavly luxury runway campaigns." },
];

const TESTIMONIALS = [
  {
    quote: "The custom measurement workflow changed everything. Customers send exact sizing, pay 50% upfront in escrow, and funds land in my account immediately upon delivery satisfaction!",
    name: "Meera Sharma",
    role: "Founder, Meera Studio",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    stats: [
      { label: "Bespoke Orders", value: "850+" },
      { label: "Escrow Payouts",  value: "₹14,50,000+" },
      { label: "Satisfaction Rate",  value: "99.4%" },
    ],
  },
];

const TRUST = [
  { title: "100% Escrow Protection", desc: "Funds held securely until customer receipt" },
  { title: "Zero Registration Fee", desc: "Free to join and publish collections" },
  { title: "Weavly Packaging Included", desc: "Branded garment covers delivered to you" },
  { title: "Nominal Ad Spend (Up to ₹2k)", desc: "High ROI marketing at affordable rates" },
];

const FAQS = [
  { q: "How do custom body measurement orders work?", a: "When a customer selects your design, they can choose a standard size (S, M, L) or submit custom body measurements (bust, waist, hips, shoulder, length). You receive exact specs in your Designer Studio order queue." },
  { q: "How does the Escrow and Payment system work?", a: "Weavly holds the payment in escrow. Customers can pay a 50% deposit upon order finalization and 50% upon delivery, or 100% upfront in escrow. Once the customer receives the garment and confirms satisfaction, funds are instantly released to your bank account." },
  { q: "What packaging do I use for shipping?", a: "Weavly provides premium co-branded garment covers and packaging boxes. If you prefer using your own brand boxes, simply include the 'Powered by Weavly' brand tag included in your welcome kit." },
  { q: "Can I run ads to boost my sales?", a: "Yes! Designers can activate nominal ad packages (ranging from ₹200 up to a maximum cap of ₹2,000) to feature their collections in top marketplace banners and curated spotlight carousels." },
  { q: "Does Weavly support international multi-currency pricing?", a: "Yes! Prices automatically convert into the customer's local currency (INR, USD, EUR, GBP, AED, JPY, etc.) based on their location." },
];


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function BecomeDesignerPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq]           = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [modalOpen, setModalOpen]           = useState(false);
  const successRef = useRef(null);

  const closeModal   = () => { setModalOpen(false); };

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="bg-white text-[#1D1D1F] overflow-x-hidden pt-[64px] relative" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>



      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-0 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* LEFT */}
        <div className="flex flex-col gap-5 pb-6 z-10">

          <h1 className="text-[46px] sm:text-[58px] font-medium leading-[1.08] tracking-[-0.02em] text-[#1D1D1F] font-serif">
            Launch Your<br />
            Designs. <span style={{ color: "#F07020" }}>Inspire the World.</span>
          </h1>

          <p className="text-[14.5px] text-[#515154] leading-relaxed max-w-[420px] font-medium">
            Turn your creativity into a brand people love. Showcase your collections, reach the right audience, and earn what you deserve.
          </p>

          <div className="flex flex-wrap gap-4 mt-3">
            <button
              onClick={() => router.push("/designer/register")}
              className="px-6 py-3.5 rounded-full bg-[#F07020] hover:bg-[#1D1D1F] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_6px_20px_rgba(240,112,32,0.25)] flex items-center gap-2"
            >
              Register as a Designer <ArrowRight size={13} />
            </button>
            <button
              onClick={() => router.push("/designer/login")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#1D1D1F]/20 hover:border-[#1D1D1F] text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#1D1D1F] transition-all duration-300"
            >
              Sign In to Studio
            </button>
          </div>

          {/* Sub-Hero Trust Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 w-full">
            {[
              {
                title: "No Joining Fees", desc: "Start for free",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                )
              },
              {
                title: "Verified Designers", desc: "Build trust",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                )
              },
              {
                title: "Secure Payments", desc: "On-time payouts",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                )
              },
              {
                title: "Global Reach", desc: "Customers worldwide",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                )
              }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#C6A15B] mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-[10px] font-extrabold text-[#1D1D1F] leading-tight">{item.title}</p>
                  <p className="text-[9px] text-[#86868B] font-semibold mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT — editorial photo with floating widgets */}
        <div className="relative flex justify-end items-center overflow-visible w-full max-w-[580px] mx-auto lg:mx-0">
          
          {/* Main photo container */}
          <div className="relative w-full aspect-[5/4] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-[#FAFAF8]">
            <img
              src="https://images.unsplash.com/photo-1760022638435-aad7c1e684b6?w=900&q=85"
              alt="Designer at work"
              className="w-full h-full object-cover object-center"
            />
            {/* dark-to-transparent gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />

            {/* Organic wavy bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none fill-[#FAFAF8] z-10">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 C 30 1, 70 9, 100 5 L 100 10 L 0 10 Z" />
              </svg>
            </div>
          </div>

          {/* Floating — earnings card (top-right of photo) */}
          <div className="absolute -top-6 -right-4 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] px-4 py-3 min-w-[155px] border border-[#F0EDE8]/60 z-20">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#86868B] mb-0.5">Total Earnings</p>
            <p className="text-[23px] font-black text-[#1D1D1F] leading-none tracking-tight">₹2,45,000</p>
            
            {/* Mini Sparkline Chart */}
            <div className="h-6 mt-2 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                <path d="M0 25 Q 15 12, 30 18 T 60 8 T 90 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M0 25 Q 15 12, 30 18 T 60 8 T 90 14 L 100 30 L 0 30 Z" fill="url(#sparkline-glow)" />
                <defs>
                  <linearGradient id="sparkline-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-[9.5px] text-[#10B981] font-bold mt-1.5 flex items-center gap-1">
              <span>↑ 35% this month</span>
            </p>
          </div>

          {/* Floating — new collection card (middle-left) */}
          <div className="absolute top-[25%] -left-8 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] px-3 py-2.5 border border-[#F0EDE8]/60 flex items-center gap-3 max-w-[195px] z-20">
            <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F5F5F7]">
              <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=120&q=80" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[8.5px] font-extrabold text-[#86868B] uppercase tracking-wider">New Collection</p>
              <p className="text-[12px] font-extrabold text-[#1D1D1F] mt-0.5">Urban Dream</p>
            </div>
          </div>

          {/* Floating — order card bottom-right */}
          <div className="absolute bottom-10 -right-4 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] px-4 py-3.5 border border-[#F0EDE8]/60 min-w-[165px] z-20">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#86868B]">Order Completed</p>
            </div>
            <p className="text-[14px] font-black text-[#1D1D1F]">You earned ₹3,850</p>
          </div>

          {/* Handwritten label */}
          <div className="absolute bottom-16 -left-4 text-[#1D1D1F]/50 text-[13px] flex items-center gap-2 z-20" style={{ fontFamily:"'Georgia',serif", fontStyle:"italic" }}>
            <span>Your design,<br />Their favorite ♡</span>
            <svg width="40" height="25" viewBox="0 0 40 25" fill="none" className="rotate-[-10deg] opacity-40">
              <path d="M2,2 Q18,15 35,5" stroke="#1D1D1F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M30,2 L36,5 L32,10" stroke="#1D1D1F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="bg-white py-24 mt-4">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <p className="text-center text-[9px] font-extrabold uppercase tracking-[0.38em] text-[#C6A15B] mb-10">How it Works</p>

          {/* Desktop horizontal row with illustrated SVG icons */}
          <div className="hidden md:flex items-start gap-0">
            {[
              {
                n:"1", title:"Apply", desc:"Tell us about yourself and your brand.",
                svg: (
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="14" y="10" width="44" height="52" rx="5" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1.5"/>
                    <rect x="22" y="22" width="28" height="3" rx="1.5" fill="#C6A15B" opacity="0.5"/>
                    <rect x="22" y="30" width="20" height="3" rx="1.5" fill="#C6A15B" opacity="0.35"/>
                    <rect x="22" y="38" width="24" height="3" rx="1.5" fill="#C6A15B" opacity="0.35"/>
                    <circle cx="18" cy="18" r="5" fill="#F07020" opacity="0.15"/>
                    <path d="M16 18l1.5 1.5L20 16" stroke="#F07020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              {
                n:"2", title:"Get Verified", desc:"We review your profile and verify your brand.",
                svg: (
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="36" cy="36" r="22" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1.5"/>
                    <path d="M26 36l7 7 13-14" stroke="#F07020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M36 14v4M36 54v4M14 36h4M54 36h4" stroke="#C6A15B" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                  </svg>
                )
              },
              {
                n:"3", title:"Upload Collection", desc:"Add your designs, photos, details and pricing.",
                svg: (
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M36 16 C28 16 22 22 22 30 C22 38 28 44 36 44 C44 44 50 38 50 30 C50 22 44 16 36 16Z" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1.5"/>
                    <path d="M29 44 L24 58 M43 44 L48 58" stroke="#C6A15B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M21 58 L51 58" stroke="#C6A15B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M30 12 Q36 8 42 12" stroke="#F07020" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <circle cx="36" cy="11" r="2" fill="#F07020"/>
                  </svg>
                )
              },
              {
                n:"4", title:"Publish", desc:"Launch your collection on Weavly.",
                svg: (
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="16" width="48" height="34" rx="4" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1.5"/>
                    <rect x="18" y="22" width="14" height="16" rx="2" fill="#C6A15B" opacity="0.2"/>
                    <rect x="36" y="22" width="18" height="7" rx="2" fill="#F07020" opacity="0.2"/>
                    <rect x="36" y="32" width="18" height="6" rx="2" fill="#C6A15B" opacity="0.15"/>
                    <path d="M28 50 L28 58 M44 50 L44 58 M20 58 L52 58" stroke="#C6A15B" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="54" cy="18" r="6" fill="#F07020"/>
                    <path d="M52 18l1.5 1.5L56 16" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              {
                n:"5", title:"Reach Customers", desc:"Shoppers discover, love and buy your designs.",
                svg: (
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="30" r="14" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1.5"/>
                    <path d="M42 40 L54 52" stroke="#C6A15B" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="32" cy="30" r="8" fill="#F07020" opacity="0.1"/>
                    <path d="M28 30 C28 27 30 25 32 25" stroke="#F07020" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="20" cy="50" r="6" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1"/>
                    <path d="M17 50 Q20 47 23 50" stroke="#C6A15B" strokeWidth="1" strokeLinecap="round" fill="none"/>
                  </svg>
                )
              },
              {
                n:"6", title:"Earn & Grow", desc:"You earn. We support your growth.",
                svg: (
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="36" cy="54" rx="12" ry="5" fill="#C6A15B" opacity="0.2"/>
                    <circle cx="36" cy="44" r="10" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1.5"/>
                    <circle cx="36" cy="34" r="8" fill="#FFF5EE" stroke="#C6A15B" strokeWidth="1.5"/>
                    <circle cx="36" cy="26" r="6" fill="#F07020" opacity="0.15" stroke="#F07020" strokeWidth="1.5"/>
                    <path d="M22 40 L28 34 L34 38 L44 24" stroke="#F07020" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M44 24 L44 29 M44 24 L39 24" stroke="#F07020" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )
              },
            ].map((step, i, arr) => (
              <div key={i} className="flex-1 flex flex-col items-center text-center relative">
                {/* dashed connector */}
                {i < arr.length - 1 && (
                  <div className="absolute top-9 left-[calc(50%+40px)] right-0 flex items-center" style={{ zIndex:0 }}>
                    <svg width="100%" height="12" viewBox="0 0 80 12" preserveAspectRatio="none">
                      <path d="M0 6 Q20 2 40 6 Q60 10 80 6" stroke="#C6A15B" strokeWidth="1.2" fill="none" strokeDasharray="4 3" opacity="0.6"/>
                      <path d="M74 3 L80 6 L74 9" stroke="#C6A15B" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className="relative z-10 mb-3">{step.svg}</div>
                <p className="text-[13px] font-extrabold text-[#1D1D1F] mb-1">{step.n}. {step.title}</p>
                <p className="text-[11px] text-[#86868B] leading-snug px-3 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile vertical */}
          <div className="md:hidden flex flex-col gap-8">
            {[
              { n:"1", title:"Apply", desc:"Tell us about yourself and your brand." },
              { n:"2", title:"Get Verified", desc:"We review your profile and verify your brand." },
              { n:"3", title:"Upload Collection", desc:"Add your designs, photos, details and pricing." },
              { n:"4", title:"Publish", desc:"Launch your collection on Weavly." },
              { n:"5", title:"Reach Customers", desc:"Shoppers discover, love and buy your designs." },
              { n:"6", title:"Earn & Grow", desc:"You earn. We support your growth." },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-[#FFF5EE] border border-[#C6A15B]/40 flex items-center justify-center text-[12px] font-black text-[#F07020] shrink-0">{step.n}</div>
                <div>
                  <p className="text-[13px] font-extrabold text-[#1D1D1F]">{step.title}</p>
                  <p className="text-[12px] text-[#86868B] font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          POWERFUL FEATURES TO GROW YOUR BRAND
      ══════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-24">
        <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.38em] text-[#C6A15B] mb-2">Features</p>
        <h2 className="text-center text-[30px] sm:text-[36px] font-black tracking-tight text-[#1D1D1F] mb-12 font-serif">
          Powerful Features to Grow Your Brand
        </h2>

        {/* Doodle Canvas Filter */}
        <svg width="0" height="0" className="hidden" aria-hidden="true">
          <filter id="doodle-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10 mt-16">
          {[
            {
              title: "Designer Profile", desc: "Create your own designer identity with story, logo, social links and more.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )
            },
            {
              title: "Collection Builder", desc: "Create unlimited collections with multiple products, variants and sizes.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <line x1="22" y1="12" x2="2" y2="12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  <line x1="6" y1="16" x2="6.01" y2="16" />
                  <line x1="10" y1="16" x2="10.01" y2="16" />
                </svg>
              )
            },
            {
              title: "Advanced Analytics", desc: "Track views, sales, revenue, customer behavior and performance in real-time.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              )
            },
            {
              title: "Order Management", desc: "Manage orders, shipments and returns from one simple dashboard.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )
            },
            {
              title: "Inventory Control", desc: "Manage stock, set alerts and avoid overselling with smart inventory tools.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
              )
            },
            {
              title: "Marketing Tools", desc: "Promote your collections with banners, discounts, limited offers and more.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.5 7.5" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              )
            },
            {
              title: "Payouts & Earnings", desc: "Secure payments, automatic payouts and clear earning breakdown.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
              )
            },
            {
              title: "Customer Insights", desc: "Understand your customers and create designs they will love.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )
            },
            {
              title: "Discount & Offers", desc: "Run seasonal sales, early access, and exclusive designer offers.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              )
            },
            {
              title: "Bulk Upload", desc: "Add multiple products at once with easy bulk upload via CSV.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-3.8-3.9-6.8-7.7-7-4.4-.3-8.1 3-8.2 7.3C6 13 8 15.5 10.5 16h8.5" />
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="22" />
                </svg>
              )
            },
            {
              title: "Reviews & Ratings", desc: "Build trust with verified reviews and ratings on your collections.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )
            },
            {
              title: "Mobile App Access", desc: "Manage your store on the go with our designer mobile app.",
              svg: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F07020]">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              )
            }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-3 transition-all duration-300 group">
              <div 
                className="w-10 h-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 text-[#F07020] opacity-80 [&>svg]:w-8 [&>svg]:h-8 [&>svg]:stroke-[2.5px]"
                style={{ filter: "url(#doodle-filter)" }}
              >
                {item.svg}
              </div>
              <div className="pt-0.5">
                <p className="text-[13px] font-extrabold text-[#1D1D1F] mb-1">{item.title}</p>
                <p className="text-[11.5px] text-[#86868B] leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── More Tools & Support ─────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.38em] text-[#C6A15B] mb-2">More Tools & Support</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8">
            {[
              {
                title: "24/7 Support", desc: "We're here whenever you need help.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                )
              },
              {
                title: "Community Access", desc: "Connect with designers and grow together.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )
              },
              {
                title: "Learning Resources", desc: "Guides, tutorials and tips to grow your brand.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                )
              },
              {
                title: "Exclusive Opportunities", desc: "Get featured, join challenges and special campaigns.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                )
              },
              {
                title: "Design Challenges", desc: "Participate in challenges and win exciting rewards.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M6 8H5a4 4 0 0 0 0 8h1" />
                    <path d="M15 2H9v14h6V2z" />
                    <path d="M12 16v4" />
                    <path d="M9 20h6" />
                  </svg>
                )
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <span className="text-[#C6A15B] mb-2">{item.icon}</span>
                <p className="text-[11.5px] font-extrabold text-[#1D1D1F] mb-1">{item.title}</p>
                <p className="text-[10px] text-[#86868B] leading-normal font-medium max-w-[150px] mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SUCCESS STORIES + EARNINGS (split)
      ══════════════════════════════════════════ */}
      <section ref={successRef} className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start border-t border-[#F0EDE8]/80">

        {/* LEFT — Success Stories */}
        <div>
          <SectionLabel>Success Stories</SectionLabel>
          
          <div className="bg-white border border-[#F0EDE8] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.03)] mt-6">
            <div className="p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-[#F0EDE8]/80 bg-[#FAFAF8]">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[14.5px] text-[#2B2B2B] leading-relaxed font-serif italic mb-4">
                  "{t.quote}"
                </p>
                <p className="text-[13px] font-extrabold text-[#1D1D1F]">— {t.name}</p>
                <p className="text-[10.5px] text-[#86868B] font-extrabold uppercase tracking-wider mt-1">{t.role}</p>
              </div>
            </div>

            {/* Stats Block */}
            <div className="border-t border-[#F0EDE8] grid grid-cols-3 bg-[#FAFAF8]/40">
              {t.stats.map((s, i) => (
                <div key={i} className="py-5 px-6 border-r last:border-r-0 border-[#F0EDE8] text-center sm:text-left">
                  <p className="text-[16px] font-black text-[#1D1D1F] tracking-tight">{s.value}</p>
                  <p className="text-[9px] text-[#86868B] font-extrabold uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Earn More with Every Sale Process */}
        <div className="flex flex-col gap-6">
          <SectionLabel>Earn More With Every Sale</SectionLabel>
          <p className="text-[14.5px] text-[#515154] leading-relaxed max-w-[480px] font-medium">
            We believe in fair earnings and transparent policies. No hidden fees or listing charges.
          </p>

          {/* Process Pipeline */}
          <div className="flex items-center justify-between gap-2 mt-4 bg-white border border-[#F0EDE8] rounded-2xl p-6 relative flex-wrap sm:flex-nowrap">
            {[
              {
                title: "Customer buys your product",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                )
              },
              {
                title: "You receive the order",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                )
              },
              {
                title: "We deduct a small fee",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="5" x2="5" y2="19" />
                    <circle cx="6.5" cy="6.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                )
              },
              {
                title: "You get paid on time",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                )
              }
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-col items-center text-center flex-1 relative">
                {/* Arrow connector */}
                {i < arr.length - 1 && (
                  <div className="hidden sm:block absolute top-[12px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 border-t border-dashed border-[#C6A15B]/50" />
                )}
                <div className="w-8 h-8 rounded-full bg-[#FFF5EE] flex items-center justify-center text-[#F07020] mb-2 relative z-10 shrink-0">
                  {step.icon}
                </div>
                <p className="text-[9.5px] font-extrabold text-[#1D1D1F] leading-tight max-w-[90px]">{step.title}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="self-start mt-2 px-6 py-3.5 rounded-full bg-[#F07020] hover:bg-[#1D1D1F] text-white text-[11px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_6px_20px_rgba(240,112,32,0.2)] flex items-center gap-2"
          >
            View Earnings Model <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 pb-24">
        <div className="bg-[#FFF8F2] border border-[#F0EDE8] rounded-[32px] overflow-hidden relative grid grid-cols-1 lg:grid-cols-2 items-center shadow-[0_10px_35px_rgba(240,112,32,0.04)]">

          {/* left image */}
          <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[340px] relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=80"
              alt="Designer workspace"
              className="w-full h-full object-cover"
            />
            {/* Soft gradient mask overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent" />
          </div>

          {/* right content */}
          <div className="p-10 lg:p-14 flex flex-col items-start gap-6 relative z-10">
            {/* Mannequin SVG overlay in background */}
            <svg className="absolute right-8 top-8 opacity-[0.06] text-[#F07020]" width="90" height="130" viewBox="0 0 70 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M35 10 C26 10 20 18 20 26 C20 34 26 40 35 40 C44 40 50 34 50 26 C50 18 44 10 35 10Z" />
              <path d="M15 50 C15 44 20 42 35 42 C50 42 55 44 55 50 L58 80 L12 80 Z" />
              <path d="M12 80 L10 95 M58 80 L60 95" />
            </svg>

            <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-[#1D1D1F] leading-tight font-serif">
              Ready to Turn Your Creativity<br />into a Global Brand?
            </h2>
            <p className="text-[14px] text-[#515154] leading-relaxed max-w-md font-medium">
              Join thousands of independent designers who are building the future of fashion with Weavly.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-1">
              <button
                onClick={() => router.push("/designer/register")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#F07020] hover:bg-[#1D1D1F] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_6px_20px_rgba(240,112,32,0.2)]"
              >
                Register as a Designer <ArrowRight size={13} />
              </button>
              <button
                onClick={() => router.push("/designer/login")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#1D1D1F]/20 hover:border-[#1D1D1F] text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#1D1D1F] transition-all duration-300 bg-white"
              >
                Sign In to Studio
              </button>
            </div>

            {/* trust badges */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4 pt-6 border-t border-[#F0EDE8] w-full">
              {TRUST.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FFF5EE] flex items-center justify-center text-[#F07020] shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[11.5px] font-extrabold text-[#1D1D1F] leading-tight">{item.title}</p>
                    <p className="text-[10.5px] text-[#86868B] font-semibold mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ (Orange Theme)
      ══════════════════════════════════════════ */}
      <section className="max-w-[800px] mx-auto px-6 pb-28">
        <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.38em] text-[#F07020] mb-2">FAQ</p>
        <h2 className="text-center text-[30px] sm:text-[36px] font-black tracking-tight text-[#1D1D1F] mb-12 font-serif">
          Common Questions
        </h2>
        
        <div className="flex flex-col gap-3 mt-6">
          {FAQS.map((faq, i) => {
            const open = activeFaq === i;
            return (
              <div
                key={i}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  open ? "border-[#F07020] shadow-[0_8px_24px_rgba(240,112,32,0.06)] border-l-4 border-l-[#F07020]" : "border-[#F0EDE8] hover:border-[#F07020]/40"
                }`}
              >
                <button
                  onClick={() => setActiveFaq(open ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 transition-colors duration-200"
                >
                  <span className={`text-[14.5px] font-extrabold transition-colors duration-200 ${open ? "text-[#F07020]" : "text-[#1D1D1F]"}`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-all duration-300 ${
                      open ? "text-[#F07020] rotate-180" : "text-[#86868B]"
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48" : "max-h-0"}`}>
                  <p className="px-6 pb-6 text-[13px] text-[#515154] leading-relaxed font-medium border-t border-[#F5F5F5]/60 pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EARNINGS MODEL MODAL
      ══════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl border border-[#F0EDE8] animate-fade-in-up">

            {/* header */}
            <div className="bg-[#FAFAF8] px-6 py-5 border-b border-[#F0EDE8] flex items-center justify-between">
              <div>
                <p className="text-[14px] font-black text-[#1D1D1F] uppercase tracking-wide">Earnings Model</p>
                <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider mt-0.5">Fair, transparent payouts</p>
              </div>
              <button onClick={closeModal} className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] hover:text-[#1D1D1F] transition-colors">Close</button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 bg-[#FFF5EE] rounded-2xl border border-[#F07020]/15">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#F07020]">Your Share</p>
                  <p className="text-[26px] font-black text-[#1D1D1F]">85%</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#86868B]">Platform Fee</p>
                  <p className="text-[26px] font-black text-[#86868B]">15%</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[12px] text-[#515154] leading-relaxed font-semibold">
                  What does the 15% platform fee cover?
                </p>
                <div className="flex flex-col gap-2.5">
                  {[
                    "Secure payment processing & merchant fees",
                    "Targeted marketing & social media showcases",
                    "Global logistics support & shipping facilitation",
                    "Dedicated designer support team available 24/7"
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[11.5px] text-[#86868B] font-medium">
                      <span className="w-4 h-4 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">✓</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#F0EDE8] pt-4 mt-1">
                <p className="text-[11.5px] text-[#86868B] leading-relaxed font-medium">
                  <strong>Payout Schedule:</strong> Earnings are automatically deposited directly to your bank account weekly. Payments are triggered exactly 7 days after lookup order delivery confirmation.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-full py-3.5 rounded-full bg-[#1D1D1F] hover:bg-[#F07020] text-white text-[11px] font-black uppercase tracking-[0.18em] transition-colors mt-2"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
