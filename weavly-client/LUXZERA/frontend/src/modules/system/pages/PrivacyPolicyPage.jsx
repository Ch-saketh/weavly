"use client";

// src/modules/system/pages/PrivacyPolicyPage.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  FileText,
  Key,
  Database,
  Trash2,
  Mail,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const lastUpdated = "September 2, 2026";
  const effectiveDate = "August 15, 2026";

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("privacy@weavly.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const sections = [
    { id: "overview", label: "1. Privacy Overview & Vow" },
    { id: "data-collection", label: "2. Information We Collect" },
    { id: "zyra-ai", label: "3. Zyra AI & Biometric Data" },
    { id: "data-usage", label: "4. How We Use Information" },
    { id: "zero-selling", label: "5. Zero Data Selling Guarantee" },
    { id: "designer-privacy", label: "6. Bespoke Couture & Atelier Privacy" },
    { id: "security-encryption", label: "7. Security & Encryption Standards" },
    { id: "user-rights", label: "8. Your Rights & GDPR/CCPA Control" },
    { id: "cookies-tracking", label: "9. Cookies & Tracking Transparency" },
    { id: "retention-erasure", label: "10. Data Retention & Erasure" },
    { id: "dpo-contact", label: "11. Contact the Privacy Office" },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      {/* ── Editorial Header ── */}
      <div className="relative border-b border-[#183B56]/15 bg-gradient-to-b from-white/60 to-[#F5EFEB] pt-20 pb-16 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb & Trust Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A7184]">
              <button 
                onClick={() => router.push("/")} 
                className="hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer p-0"
              >
                Weavly
              </button>
              <span>/</span>
              <span className="text-[#183B56]">Legal &amp; Compliance</span>
              <span>/</span>
              <span className="text-[#183B56]">Privacy Policy</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GDPR, CCPA &amp; ISO 27001 Aligned Framework</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-[#183B56]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#183B56]">
                  Patron Confidentiality Covenant
                </p>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#183B56] leading-[0.92]">
                Privacy &amp; Data<br />
                <span className="font-serif italic font-normal lowercase text-[#183B56]/90">protection vow.</span>
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#5A7184] leading-relaxed max-w-2xl font-medium pt-2">
                At Weavly, we treat your personal style, body definition, and bespoke measurements with the same uncompromising discretion expected of a premier haute couture house.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right space-y-2 border-t lg:border-t-0 border-[#183B56]/10 pt-4 lg:pt-0">
              <p className="text-xs text-[#5A7184] font-medium">
                Last Revised: <span className="text-[#183B56] font-bold">{lastUpdated}</span>
              </p>
              <p className="text-xs text-[#5A7184] font-medium">
                Effective: <span className="text-[#183B56] font-bold">{effectiveDate}</span>
              </p>
              <div className="pt-2 flex lg:justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white border border-[#183B56]/20 text-[#183B56] hover:bg-[#183B56] hover:text-white transition-all shadow-2xs rounded-xs cursor-pointer"
                >
                  <Download size={13} />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Key Commitments Executive Strip ── */}
      <div className="border-b border-[#183B56]/15 bg-white/70 backdrop-blur-xs py-6 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <EyeOff size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">Zero Data Selling</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">We never monetize or broker your personal information or measurements.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">AES-256 Encryption</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">All biometric vectors and fitting profiles are encrypted at rest &amp; transit.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <UserCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">100% User Control</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">Instant one-click data export and permanent erasure from your profile.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">Zero Ad-Trackers</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">We deploy strictly essential session tokens without behavioral retargeting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Layout ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-[#183B56]/20 rounded-xl p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56] mb-4 pb-2 border-b border-[#183B56]/10 flex items-center justify-between">
                <span>Table of Contents</span>
                <span className="text-[#5A7184] font-mono font-normal">11 Sections</span>
              </p>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 text-[12px] font-semibold transition-all rounded-md flex items-center justify-between cursor-pointer border-none bg-transparent
                      ${activeSection === sec.id
                        ? "bg-[#183B56] text-white shadow-2xs font-bold"
                        : "text-[#5A7184] hover:bg-[#E2EAEF] hover:text-[#183B56]"}`}
                  >
                    <span className="truncate">{sec.label}</span>
                    <ChevronRight size={12} className={activeSection === sec.id ? "text-white" : "text-[#5A7184]/50"} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Direct Support Card */}
            <div className="bg-[#183B56] text-white rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#38BDF8]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Privacy &amp; Legal Desk</h4>
              </div>
              <p className="text-[12px] text-white/80 leading-relaxed font-normal">
                Need a full data dump or have a legal inquiry? Contact our appointed Data Protection Officer.
              </p>
              <div className="flex items-center justify-between bg-white/10 border border-white/15 px-3 py-2 rounded-lg text-xs font-mono">
                <span>privacy@weavly.com</span>
                <button
                  onClick={handleCopyEmail}
                  className="hover:text-[#38BDF8] transition-colors border-none bg-transparent cursor-pointer p-0 text-white"
                  title="Copy email"
                >
                  {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Legal Clauses & Explanations */}
        <main className="lg:col-span-8 space-y-12">
          
          {/* Section 1: Overview */}
          <section id="overview" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 01</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              1. Privacy Overview &amp; Patron Covenant
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Weavly operates an exclusive luxury digital fashion marketplace, custom couture atelier, and personal AI stylist engine (Zyra). Because our platform processes body measurements, fit profiles, and stylistic preferences, we maintain a human-first privacy standard.
            </p>
            <div className="bg-[#E2EAEF]/70 border border-[#183B56]/15 rounded-xl p-4 text-[12px] text-[#183B56] leading-relaxed font-medium space-y-1.5">
              <p className="font-bold uppercase tracking-wide text-[10px] text-[#183B56]">Plain English Translation:</p>
              <p>We do not operate as an ad broker. We only gather the information necessary to authenticate your identity, craft your custom garments, and compute accurate outfit recommendations.</p>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section id="data-collection" className="scroll-mt-28 space-y-6 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 02</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              2. Information We Collect
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              We categorize the personal data we process into three distinct tiers:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-2 border-[#183B56] pl-4 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">A. Account &amp; Identity Credentials</h4>
                <p className="text-[12px] text-[#5A7184] font-medium leading-relaxed">
                  Full name, verified email address, encrypted authentication hashes, contact telephone number, shipping destinations, and billing postal information.
                </p>
              </div>

              <div className="border-l-2 border-[#183B56] pl-4 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">B. Fit Definition &amp; Biometric Vectors (Zyra Profile)</h4>
                <p className="text-[12px] text-[#5A7184] font-medium leading-relaxed">
                  Height, weight, shoulder width, chest, waist, hip measurements, body shape descriptors (e.g., hourglass, athletic), and optional patron fitting photographs uploaded to assist couture tailoring.
                </p>
              </div>

              <div className="border-l-2 border-[#183B56] pl-4 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">C. Transactional &amp; Atelier Engagement Data</h4>
                <p className="text-[12px] text-[#5A7184] font-medium leading-relaxed">
                  Bespoke commission request history, order identifiers, item sizes, designer chat logs, saved wardrobe lookbooks, and checkout receipts.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Zyra AI & Biometric Data */}
          <section id="zyra-ai" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 03</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              3. Zyra AI &amp; Fitting Data Safeguards
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Our Zyra AI recommendation engine converts your style preferences and body measurements into a mathematical vector embedding (a sequence of encrypted numbers).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 space-y-1.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wide text-[#183B56]">Local Vector Transformation</h5>
                <p className="text-[11px] text-[#5A7184] leading-relaxed">Your uploaded fitting photos are processed in isolated memory to extract fit parameters and are never fed into publicly trained generative AI models.</p>
              </div>
              <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 space-y-1.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wide text-[#183B56]">Private Cache Scoping</h5>
                <p className="text-[11px] text-[#5A7184] leading-relaxed">Recommendation caches are cryptographically keyed to your specific user ID and invalidated when you modify or reset your profile preferences.</p>
              </div>
            </div>
          </section>

          {/* Section 4: How We Use Information */}
          <section id="data-usage" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 04</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              4. Lawful Basis &amp; How We Use Information
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              We process data strictly under GDPR Article 6(1)(b) (Contractual Performance) and Article 6(1)(a) (Explicit Consent) to:
            </p>
            <ul className="space-y-2 text-[12px] text-[#5A7184] font-medium list-disc pl-5 leading-relaxed">
              <li>Fulfill and dispatch luxury boutique garment orders and custom commission requests.</li>
              <li>Calibrate Zyra AI occasion recommendations across Wedding, Formal, Casual, College, and Party feeds.</li>
              <li>Enable secure multi-factor authentication (OTP verification and password encryption).</li>
              <li>Deliver essential transactional notifications, tracking updates, and concierge service notes.</li>
            </ul>
          </section>

          {/* Section 5: Zero Data Selling */}
          <section id="zero-selling" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 05</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              5. Zero Data Selling Guarantee
            </h2>
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-950 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>Absolute Prohibition on Third-Party Data Sales</span>
              </h4>
              <p className="text-[12px] text-emerald-900 leading-relaxed font-medium">
                Weavly does not sell, rent, lease, or trade personal identifying information, measurements, or behavioral telemetry to data brokers, marketing agencies, or external advertising conglomerates under any circumstance.
              </p>
            </div>
          </section>

          {/* Section 6: Bespoke Couture Privacy */}
          <section id="designer-privacy" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 06</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              6. Bespoke Couture &amp; Atelier Privacy
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              When you commission a custom garment through the Designer Studio, your bespoke measurements are transmitted exclusively to the verified artisan crafting your piece under a binding Non-Disclosure Agreement (NDA). Designers are legally prohibited from retaining or reusing patron sizing data outside the commissioned garment scope.
            </p>
          </section>

          {/* Section 7: Security & Encryption */}
          <section id="security-encryption" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 07</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              7. Security &amp; Payment Compliance
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              We implement enterprise-grade cryptographic controls to safeguard our infrastructure:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 space-y-1">
                <h5 className="text-[11px] font-bold uppercase tracking-wide text-[#183B56]">PCI-DSS Level 1 Gateway</h5>
                <p className="text-[11px] text-[#5A7184]">Payment card details are tokenized directly with PCI-compliant processors (Stripe/PayPal/Razorpay). Weavly servers never store raw credit card numbers or CVVs.</p>
              </div>
              <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 space-y-1">
                <h5 className="text-[11px] font-bold uppercase tracking-wide text-[#183B56]">Cryptographic OTPs &amp; Passwords</h5>
                <p className="text-[11px] text-[#5A7184]">Passwords use salted BCrypt hashing (strength 12). Authentication tokens are generated using cryptographically secure random number generators (CWE-330 hardened).</p>
              </div>
            </div>
          </section>

          {/* Section 8: User Rights */}
          <section id="user-rights" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 08</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              8. Your Rights Under GDPR, CCPA &amp; Global Frameworks
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Regardless of your geographic territory, Weavly grants all patrons the highest global standard of digital privacy rights:
            </p>
            <div className="space-y-2.5 text-[12px] text-[#5A7184] font-medium">
              <p><strong className="text-[#183B56]">Right to Access &amp; Portability:</strong> Request a complete JSON or CSV archive of all personal data and lookbooks associated with your profile.</p>
              <p><strong className="text-[#183B56]">Right to Rectification:</strong> Edit your sizing metrics, profile photos, and occasion affinities instantly inside Account Settings.</p>
              <p><strong className="text-[#183B56]">Right to Erasure ("Right to Be Forgotten"):</strong> Unilaterally delete your account, images, and recommendation histories with permanent database removal.</p>
            </div>
          </section>

          {/* Section 9: Cookies & Tracking */}
          <section id="cookies-tracking" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 09</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              9. Cookies &amp; Tracking Transparency
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              We deploy only strictly necessary technical cookies to maintain your login session, persist your shopping bag, and store client theme preferences. We do not use third-party marketing pixels or cross-site fingerprinting cookies.
            </p>
          </section>

          {/* Section 10: Retention & Erasure */}
          <section id="retention-erasure" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 10</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              10. Data Retention &amp; Automatic Cleanup
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Active account information is retained for the lifetime of your patron membership. If an account remains completely inactive for more than 24 consecutive months, biometric vectors and fitting photographs are automatically queued for secure deletion. Financial transaction logs are archived solely for mandatory statutory tax durations.
            </p>
          </section>

          {/* Section 11: DPO Contact */}
          <section id="dpo-contact" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 11</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              11. Contact the Data Protection Officer (DPO)
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              For privacy audits, formal requests under GDPR/CCPA, or compliance verifications, reach out directly to our privacy secretariat:
            </p>
            <div className="p-5 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 space-y-2 text-xs">
              <p><strong className="text-[#183B56]">Weavly Trust &amp; Privacy Office</strong></p>
              <p className="text-[#5A7184]">Attn: Data Protection Officer</p>
              <p className="text-[#5A7184]">Email: <a href="mailto:privacy@weavly.com" className="text-[#183B56] font-bold underline">privacy@weavly.com</a></p>
              <p className="text-[#5A7184]">Response SLA: Within 48 business hours</p>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
