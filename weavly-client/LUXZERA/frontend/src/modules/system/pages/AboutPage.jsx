// src/pages/AboutPage.jsx
import { ArrowRight, Zap, Shield, Globe, Users, Mail } from "lucide-react";

const STATS = [
  { value: "0", label: "Middlemen (Direct to Consumer)" },
  { value: "100%", label: "Curated Wardrobes" },
  { value: "NO", label: "Artificial Markups" },
  { value: "Emerging", label: "Independent Creators Only" },
];

const TEAM = [
  { 
    name: "Saketh Chokkapu", 
    role: "Founder & CTO", 
    bio: "The technical mind and strategist behind Weavly. Building the future of curated digital fashion.",
    img: "/saketh_ch.jpeg",
    email: "chokkapusaketh@gmail.com",
    github: "https://github.com/Ch-saketh",
    username: "ch-saketh"
  },
  { 
    name: "Vivek", 
    role: "Co-Founder & CFO", 
    bio: "Heading business operations, finance, and logistics to make seamless designer commerce possible.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    email: "vivek@Weavly.com",
    github: "https://github.com",
    username: "vivek-cfo"
  },
];

const VALUES = [
  { 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-float">
        <circle cx="10" cy="10" r="6" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" />
        <path d="M10 6 L10 14 M6 10 L14 10" stroke="#F07020" strokeWidth="1" />
      </svg>
    ),
    title: "Discovery First",
    body: "Every piece on Weavly is curated. We surface fashion you won't find anywhere else — from independent designers to exclusive drops." 
  },
  { 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-float">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 11l2 2 4-4" stroke="#F07020" />
      </svg>
    ),
    title: "Verified Quality",
    body: "No fake reviews, no inflated prices. Every designer on the platform is verified. Every product is what it says it is." 
  },
  { 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-float">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8 M3.6 15h16.8" />
        <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" stroke="#F07020" />
      </svg>
    ),
    title: "Global Reach",
    body: "Designers from London, Paris, Tokyo, and beyond — all accessible in one marketplace. World-class fashion, wherever you are." 
  },
  { 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-float">
        <circle cx="6" cy="6" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="18" cy="18" r="3" fill="currentColor" fillOpacity="0.1" stroke="#F07020" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <line x1="9" y1="6" x2="16" y2="6" />
        <line x1="6" y1="9" x2="6" y2="16" />
        <line x1="8" y1="8" x2="16" y2="16" stroke="#F07020" strokeDasharray="2 2" />
      </svg>
    ),
    title: "Creator Ecosystem",
    body: "Built for both shoppers and creators. Independent designers, fashion students, and emerging labels can launch and grow here." 
  },
];

export default function AboutPage({ onShopNow }) {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Subtle, Professional Animations */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.5deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        .animate-float {
          animation: float-gentle 6s ease-in-out infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 4s ease-in-out infinite;
        }
        .doodle-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .doodle-card:hover {
          transform: translateY(-2px);
          border-color: rgba(91, 110, 245, 0.3);
        }
        .svg-container {
          transition: all 0.3s ease;
        }
        .doodle-card:hover .svg-container {
          transform: scale(1.03);
          background-color: #FAF9F7;
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative bg-white border-b border-[#E7E3DD] py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-premium-grid opacity-[0.025] pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-px w-5 bg-[#C6A15B]" />
              <p className="text-[8.5px] font-extrabold uppercase tracking-[0.38em] text-[#C6A15B]">
                Who We Are
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.88] tracking-[-0.025em] text-[#2B2B2B]">
              Built<br />
              <span style={{ color: "#5B6EF5" }}>Different.</span><br />
              <span style={{ color: "#1E2D4A" }}>Always.</span>
            </h1>
            <p className="mt-8 text-[13px] text-[#2B2B2B]/55 leading-[1.75] max-w-lg font-medium">
              Weavly is a premium fashion marketplace built for discovery — where independent designers, established labels, and emerging talent meet modern shoppers who want something real.
            </p>
          </div>

          {/* Large Hero Illustration (Orbit & Diamond) */}
          <div className="relative shrink-0 w-44 h-44 bg-[#F2EFEA] rounded-full border border-[#E7E3DD] flex items-center justify-center animate-float hidden lg:flex">
            <div className="absolute inset-2 border border-dashed border-[#2B2B2B]/10 rounded-full animate-pulse-soft" />
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="#2B2B2B" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="50" cy="50" r="32" strokeDasharray="4 4" className="text-[#2B2B2B]/20" />
              <circle cx="50" cy="50" r="20" />
              {/* Intersecting diamond */}
              <path d="M50 15 L80 50 L50 85 L20 50 Z" stroke="#F07020" />
              {/* Central node */}
              <circle cx="50" cy="50" r="4" fill="#2B2B2B" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-[#5B6EF5]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-8 px-4 border-r border-[#FAF9F7]/15 last:border-0 text-center">
              <p className="text-3xl md:text-4xl font-black text-[#FAF9F7]">{value}</p>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#FAF9F7]/55 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story ── */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-b border-[#E7E3DD]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-5 bg-[#C97A5A]" />
            <p className="text-[8.5px] font-extrabold uppercase tracking-[0.38em] text-[#C97A5A]">The Origin</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase leading-[0.9] tracking-tight text-[#2B2B2B] mb-8">
            Tired of<br />
            <span style={{ color: "#F07020" }}>the ordinary.</span>
          </h2>
          <div className="space-y-4 text-[13px] text-[#2B2B2B]/55 leading-[1.75] font-medium">
            <p>
              In 2024, our founder walked away from traditional fashion retail — the markups, the gatekeeping, the 12-week lead times. He asked a simple question: why can't great fashion be accessible and discoverable at the same time?
            </p>
            <p>
              Weavly was built on that principle: <span className="font-extrabold text-[#2B2B2B]">a marketplace where discovery wins.</span> We connect independent designers and brands directly with shoppers who want something genuinely original — no middlemen, no mass-market noise.
            </p>
            <p>
              Today we host 150+ verified designers, ship to customers across the country, and run exclusive weekly drops for our community.
            </p>
          </div>
        </div>

        {/* Image collage */}
        <div className="relative h-[420px]">
          <div className="absolute left-0 top-0 w-[58%] h-[78%] overflow-hidden rounded-2xl border border-[#E7E3DD] bg-[#F2EFEA]">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80"
              alt="Weavly fashion"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute right-0 bottom-0 w-[42%] h-[60%] overflow-hidden rounded-2xl border border-[#E7E3DD] bg-[#F2EFEA]">
            <img
              src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80"
              alt="Weavly product"
              className="w-full h-full object-cover object-top"
            />
          </div>
          {/* Accent block */}
          <div className="absolute right-[39%] top-8 w-10 h-10 rounded-xl z-10 animate-float" style={{ backgroundColor: "#F07020" }} />
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-[#F2EFEA] py-20 px-6 border-b border-[#E7E3DD]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-5 bg-[#C6A15B]" />
            <p className="text-[8.5px] font-extrabold uppercase tracking-[0.38em] text-[#C6A15B]">What We Stand For</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase leading-[0.9] tracking-tight text-[#2B2B2B] mb-12">
            Our Values.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon, title, body }) => (
              <div key={title}
                className="doodle-card bg-white border border-[#E7E3DD] rounded-2xl p-7 transition-all duration-300"
              >
                <div className="svg-container w-11 h-11 bg-[#F2EFEA] rounded-xl flex items-center justify-center text-[#2B2B2B] mb-5 border border-[#E7E3DD] shrink-0">
                  {icon}
                </div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#2B2B2B] mb-2">{title}</h3>
                <p className="text-[11.5px] text-[#2B2B2B]/50 leading-[1.7] font-medium">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-b border-[#ECECEC]">
        
        {/* Minimal Section Header */}
        <div className="flex flex-col items-start mb-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#F07020] mb-2">The Visionaries</p>
          <h2 className="text-[32px] font-black uppercase tracking-tight text-[#37352F]">
            Behind The Drop.
          </h2>
        </div>

        {/* Minimal Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {TEAM.map(({ name, role, bio, img, email, github }) => (
            <div key={name} className="flex gap-6 group">
              
              {/* Minimal Avatar (80px) */}
              <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-white border border-[#ECECEC] relative">
                <img 
                  src={img} 
                  alt={name} 
                  className="w-full h-full object-cover object-center transition-transform duration-[1.2s] group-hover:scale-105" 
                />
              </div>

              {/* Founder Details */}
              <div className="flex flex-col items-start pt-1">
                <h3 className="text-[20px] font-bold text-[#37352F] tracking-tight leading-none">
                  {name}
                </h3>
                <p className="text-[12px] font-bold text-[#F07020] uppercase tracking-[0.05em] mt-2 mb-3">
                  {role}
                </p>
                <p className="text-[14px] text-[#9B9B9B] leading-[1.6] font-medium max-w-sm">
                  {bio}
                </p>
                
                {/* Minimal Links */}
                <div className="flex items-center gap-4 mt-4">
                  {email && (
                    <a 
                      href={`mailto:${email}`} 
                      className="text-[12px] font-bold text-[#37352F] hover:text-[#F07020] transition-colors"
                    >
                      Email
                    </a>
                  )}
                  {github && (
                    <a 
                      href={github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[12px] font-bold text-[#37352F] hover:text-[#F07020] transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="bg-[#1E2D4A] py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "repeating-linear-gradient(-45deg, #FAF9F7 0, #FAF9F7 1px, transparent 0, transparent 50%)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tight text-[#FAF9F7]">
            Ready to<br /><span style={{ color: "#F07020" }}>Shop?</span>
          </h2>
          <button
            onClick={onShopNow}
            className="shrink-0 flex items-center gap-3 bg-[#F07020] hover:bg-white hover:text-[#F07020] text-[#FAF9F7] text-[11px] font-extrabold uppercase tracking-[0.28em] px-10 py-5 rounded-full transition-all duration-300 group"
          >
            Browse the Drop
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}