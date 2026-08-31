// src/modules/system/pages/PrivacyPolicyPage.jsx
import { ArrowRight, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans pb-20 select-none">
      
      {/* Subtle, Professional Animations */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.5deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
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
          border-color: rgba(24, 59, 86, 0.6);
        }
        .svg-container {
          transition: all 0.3s ease;
        }
        .doodle-card:hover .svg-container {
          transform: scale(1.03);
          background-color: #E2EAEF;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="relative border-b border-[#183B56]/20 py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-px w-5 bg-[#183B56]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-[#183B56]">
                Human First Policy
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold uppercase leading-[0.88] tracking-tight text-[#183B56]">
              Our Privacy<br />
              <span className="text-[#183B56]">Vow.</span>
            </h1>
            <p className="mt-8 text-[13px] text-[#5A7184] leading-[1.75] max-w-lg font-medium">
              We believe in clarity and minimalism. Here is our promise to you in plain English, with a formal legalese translation next to it.
            </p>
          </div>

          {/* Large Hero Illustration (Padlock with Blueprint Theme) */}
          <div className="relative shrink-0 w-44 h-44 bg-[#E2EAEF] rounded-full border border-[#183B56]/30 flex items-center justify-center animate-float">
            <div className="absolute inset-2 border border-dashed border-[#183B56]/20 rounded-full animate-pulse-soft" />
            <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="#183B56" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              {/* Shackle */}
              <path d="M36 45 V34 C36 24 42 18 50 18 C58 18 64 24 64 34 V45" stroke="#183B56" />
              {/* Body */}
              <rect x="25" y="45" width="50" height="38" rx="3.5" fill="white" stroke="#183B56" />
              {/* Keyhole */}
              <circle cx="50" cy="62" r="3.5" fill="#183B56" />
              <path d="M50 65.5 L50 73 M47.5 73 L52.5 73" stroke="#183B56" />
              {/* Sparkle */}
              <path d="M80 20 L82 24 L86 26 L82 28 L80 32 L78 28 L74 26 L78 24 Z" fill="#183B56" stroke="#183B56" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Core Promises Grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Promise 1 — No Sneaky Trackers */}
          <div className="doodle-card border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 flex flex-col md:flex-row gap-6 items-start shadow-xs">
            <div className="svg-container shrink-0 w-20 h-20 bg-[#E2EAEF] rounded-xl border border-[#183B56]/30 flex items-center justify-center overflow-hidden">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" stroke="#183B56" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 50 C30 33, 70 33, 80 50 C70 67, 30 67, 20 50 Z" fill="white" />
                <circle cx="50" cy="50" r="8" stroke="#183B56" fill="white" />
                <line x1="18" y1="22" x2="82" y2="78" stroke="#183B56" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">01 / Cookies &amp; Trackers</span>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56] mt-2.5 mb-2">No Sneaky Trackers</h3>
              <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
                We only use cookies to keep you logged in and save your wardrobe layout. No cross-site ad retargeting, no tracking what you buy elsewhere.
              </p>
              <div className="mt-4 border-t border-[#183B56]/15 pt-3 text-[10px] text-[#5A7184] font-mono italic leading-relaxed">
                Legalese: Strictly necessary session management cookies are deployed pursuant to GDPR Article 6(1)(f). We perform zero behavioral ad tracking.
              </div>
            </div>
          </div>

          {/* Promise 2 — We Don't Sell Data */}
          <div className="doodle-card border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 flex flex-col md:flex-row gap-6 items-start shadow-xs">
            <div className="svg-container shrink-0 w-20 h-20 bg-[#E2EAEF] rounded-xl border border-[#183B56]/30 flex items-center justify-center overflow-hidden">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" stroke="#183B56" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <rect x="30" y="24" width="40" height="12" rx="2" fill="white" />
                <rect x="30" y="44" width="40" height="12" rx="2" fill="white" />
                <rect x="30" y="64" width="40" height="12" rx="2" fill="white" />
                <circle cx="38" cy="30" r="1.5" fill="#183B56" stroke="none" />
                <circle cx="38" cy="50" r="1.5" fill="#183B56" stroke="none" />
                <circle cx="38" cy="70" r="1.5" fill="#183B56" stroke="none" />
                <path d="M68 28 L82 32 V44 C82 54 75 60 68 64 C61 60 54 54 54 44 V32 Z" fill="white" stroke="#183B56" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">02 / Third Parties</span>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56] mt-2.5 mb-2">We Don't Sell Data</h3>
              <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
                Your details belong to you. We do not sell your preferences, email, or order history to data brokers or third-party marketing companies. Period.
              </p>
              <div className="mt-4 border-t border-[#183B56]/15 pt-3 text-[10px] text-[#5A7184] font-mono italic leading-relaxed">
                Legalese: Personal identifying data is strictly processed for ecommerce fulfillment and is never commoditized, sold, or shared with data brokers.
              </div>
            </div>
          </div>

          {/* Promise 3 — Secret Wardrobe */}
          <div className="doodle-card border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 flex flex-col md:flex-row gap-6 items-start shadow-xs">
            <div className="svg-container shrink-0 w-20 h-20 bg-[#E2EAEF] rounded-xl border border-[#183B56]/30 flex items-center justify-center overflow-hidden">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" stroke="#183B56" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <rect x="25" y="25" width="50" height="50" rx="2.5" fill="white" />
                <line x1="50" y1="25" x2="50" y2="75" />
                <line x1="25" y1="50" x2="75" y2="50" />
                <path d="M33 40 h10 L38 35 Z" stroke="#183B56" strokeWidth="1.2" />
                <path d="M38 35 q0-3 3-2" stroke="#183B56" strokeWidth="1.2" />
                <circle cx="62" cy="38" r="3" stroke="#183B56" />
                <circle cx="37" cy="62" r="2" fill="#183B56" />
                <path d="M59 62 L65 62 M62 59 L62 65" stroke="#183B56" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">03 / Security &amp; Customization</span>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56] mt-2.5 mb-2">Secret Wardrobe</h3>
              <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
                The items, collections, and outfits you plan in your Wardrobe are stored securely. We only analyze layout patterns anonymously to make features better.
              </p>
              <div className="mt-4 border-t border-[#183B56]/15 pt-3 text-[10px] text-[#5A7184] font-mono italic leading-relaxed">
                Legalese: Saved collections and user-curated catalogs are held securely on-platform and processed solely under user-granted customization consents.
              </div>
            </div>
          </div>

          {/* Promise 4 — Full Control */}
          <div className="doodle-card border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 flex flex-col md:flex-row gap-6 items-start shadow-xs">
            <div className="svg-container shrink-0 w-20 h-20 bg-[#E2EAEF] rounded-xl border border-[#183B56]/30 flex items-center justify-center overflow-hidden">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" stroke="#183B56" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <rect x="25" y="32" width="50" height="12" rx="6" fill="white" />
                <circle cx="63" cy="38" r="8" fill="#183B56" />
                <rect x="25" y="56" width="50" height="12" rx="6" fill="white" />
                <circle cx="37" cy="62" r="8" fill="#183B56" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">04 / User Rights</span>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56] mt-2.5 mb-2">Full Control</h3>
              <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
                Want to clear your profile, delete your photos, or wipe your wardrobe history? You can do it with one click inside your account panel. No questions asked.
              </p>
              <div className="mt-4 border-t border-[#183B56]/15 pt-3 text-[10px] text-[#5A7184] font-mono italic leading-relaxed">
                Legalese: Users hold complete rights to erasure (GDPR Article 17), data portability (Article 20), and access (Article 15) manageable via profile dashboard.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Rights & FAQ Section ── */}
      <section className="bg-[#E2EAEF]/60 py-20 px-6 border-y border-[#183B56]/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-5 bg-[#183B56]" />
            <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-[#183B56]">FAQs &amp; Rights</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold uppercase leading-[0.9] tracking-tight text-[#183B56] mb-12">
            Common Questions.
          </h2>

          <div className="space-y-6">
            
            <div className="bg-white border border-[#183B56]/30 rounded-2xl p-6 shadow-xs">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#183B56] mb-2 flex items-center gap-2">
                <HelpCircle size={14} className="text-[#183B56]" />
                How long do we store your data?
              </h3>
              <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
                We keep your account info, wardrobe choices, and history as long as your account is active. If you go inactive for more than 2 years, we automatically clear it.
              </p>
            </div>

            <div className="bg-white border border-[#183B56]/30 rounded-2xl p-6 shadow-xs">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#183B56] mb-2 flex items-center gap-2">
                <HelpCircle size={14} className="text-[#183B56]" />
                What happens when you delete your account?
              </h3>
              <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
                When you click "Delete Account", your profile, pictures, wardrobe matches, and personal settings are completely erased from our databases. Financial invoices are retained as required by tax laws.
              </p>
            </div>

            <div className="bg-white border border-[#183B56]/30 rounded-2xl p-6 shadow-xs">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#183B56] mb-2 flex items-center gap-2">
                <HelpCircle size={14} className="text-[#183B56]" />
                Who handles the payment details?
              </h3>
              <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
                We never store your credit card details on our servers. All transactions are securely processed by PCI-compliant payment gateways.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Contact Footer Vow ── */}
      <div className="max-w-4xl mx-auto px-6 pt-20 text-center">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-[#183B56] mb-3">
          Got privacy concerns?
        </h3>
        <p className="text-[12px] text-[#5A7184] font-medium leading-relaxed mb-6">
          If you have questions about how we handle data, or want to make a request, shoot us a mail at <a href="mailto:privacy@weavly.com" className="text-[#183B56] underline font-bold hover:opacity-80">privacy@weavly.com</a>.
        </p>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#5A7184]/60">
          ✦ Weavly Trust Framework
        </span>
      </div>

    </div>
  );
}
