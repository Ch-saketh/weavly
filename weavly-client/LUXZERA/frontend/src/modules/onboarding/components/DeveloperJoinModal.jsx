"use client";

import React, { useState } from "react";
import {
  X,
  Code2,
  Terminal,
  KeyRound,
  Check,
  Copy,
  ExternalLink,
  Mail,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function DeveloperJoinModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("register"); // "register" | "api" | "careers"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleInterest: "Computer Vision & Silhouette APIs",
    githubUrl: "",
    projectNotes: ""
  });
  const [issuedKey, setIssuedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const generatedKey = `wvl_dev_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("weavly_developer_key", generatedKey);
          localStorage.setItem("weavly_developer_profile", JSON.stringify(formData));
        }
      } catch (err) {
        console.warn("Could not save developer token locally:", err);
      }
      setIssuedKey(generatedKey);
      setSubmitting(false);
    }, 600);
  };

  const handleCopyKey = () => {
    if (!issuedKey) return;
    navigator.clipboard.writeText(issuedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#183B56] w-full max-w-2xl my-auto max-h-[92vh] flex flex-col shadow-2xl text-[#183B56] font-sans">
        
        {/* ── HEADER ── */}
        <div className="p-5 sm:p-6 border-b border-[#183B56] bg-[#F5EFEB] flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                WEAVLY DEVELOPER PLATFORM
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 border border-[#183B56] bg-white text-[#183B56]">
                SANDBOX v2.4
              </span>
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#183B56] flex items-center gap-2">
              <Code2 size={20} className="text-[#183B56]" />
              <span>Join as a Developer</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#183B56]/30 hover:border-[#183B56] hover:bg-white cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-b border-[#183B56] bg-[#DFE7ED]/50 shrink-0 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 px-4 border-r border-[#183B56]/20 transition-colors cursor-pointer ${
              activeTab === "register" ? "bg-white text-[#183B56] border-b-2 border-b-[#183B56]" : "text-[#5A7184] hover:text-[#183B56]"
            }`}
          >
            01 Sandbox Access
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("api")}
            className={`flex-1 py-3 px-4 border-r border-[#183B56]/20 transition-colors cursor-pointer ${
              activeTab === "api" ? "bg-white text-[#183B56] border-b-2 border-b-[#183B56]" : "text-[#5A7184] hover:text-[#183B56]"
            }`}
          >
            02 API &amp; SDK Docs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("careers")}
            className={`flex-1 py-3 px-4 transition-colors cursor-pointer ${
              activeTab === "careers" ? "bg-white text-[#183B56] border-b-2 border-b-[#183B56]" : "text-[#5A7184] hover:text-[#183B56]"
            }`}
          >
            03 Engineering Team
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* TAB 1: REGISTER FOR DEVELOPER ACCESS */}
          {activeTab === "register" && (
            <div>
              {issuedKey ? (
                <div className="space-y-5">
                  <div className="p-5 border border-emerald-400 bg-emerald-50/80 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold uppercase text-xs">
                      <Check size={16} />
                      <span>Developer Account Initialized Successfully</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Welcome to the Weavly developer ecosystem, <strong className="text-emerald-950">{formData.name}</strong>! Your developer sandbox API token has been generated. Use this token in your <code className="bg-white/80 px-1.5 py-0.5 border border-emerald-300 font-mono">Authorization: Bearer</code> headers.
                    </p>

                    <div className="pt-2">
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900 mb-1">
                        YOUR SANDBOX API KEY:
                      </span>
                      <div className="flex items-center gap-2 bg-white border border-emerald-400 p-2.5 font-mono text-xs text-[#183B56] select-all">
                        <span className="flex-1 truncate">{issuedKey}</span>
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="px-3 py-1 bg-[#183B56] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#102A43] cursor-pointer flex items-center gap-1"
                        >
                          {copied ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#183B56] p-4 bg-[#F5EFEB] space-y-2">
                    <h4 className="font-bold uppercase text-xs text-[#183B56]">Next Steps:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-[#5A7184]">
                      <li>Integrate Zyra silhouette predictions via REST API.</li>
                      <li>Review webhook specifications for automated bespoke commission ingestion.</li>
                      <li>For technical collaboration or custom API limits, mail our engineering lead at <a href="mailto:chokkapusaketh@gmail.com" className="font-bold text-[#183B56] underline">chokkapusaketh@gmail.com</a>.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs text-center"
                  >
                    Done &amp; Continue to Site
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="border border-[#183B56]/30 bg-[#F5EFEB]/40 p-4 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A7184]">
                      INSTANT DEVELOPER ONBOARDING
                    </span>
                    <p className="text-xs text-[#183B56] font-medium leading-relaxed">
                      Register to access Weavly APIs, silhouette recommendation webhooks, and engineering collaboration opportunities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Developer / Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-10 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Work / Tech Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@tech.io"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-10 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Area of Technical Interest
                      </label>
                      <select
                        value={formData.roleInterest}
                        onChange={(e) => setFormData({ ...formData, roleInterest: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      >
                        <option value="Computer Vision & Silhouette APIs">Computer Vision &amp; Silhouette APIs</option>
                        <option value="Designer Storefront & Escrow Webhooks">Designer Storefront &amp; Escrow Webhooks</option>
                        <option value="Full-Stack Web & Mobile App Integration">Full-Stack Web &amp; Mobile App Integration</option>
                        <option value="Join Weavly Core Engineering Team">Join Weavly Core Engineering Team</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        GitHub / Portfolio URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        className="w-full h-10 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      What are you building or looking to contribute?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe your application, integration use-case, or technical background..."
                      value={formData.projectNotes}
                      onChange={(e) => setFormData({ ...formData, projectNotes: e.target.value })}
                      className="w-full p-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <KeyRound size={14} />
                      <span>{submitting ? "Generating Developer Key..." : "Generate Developer Sandbox Key"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: API & SDK DOCUMENTATION */}
          {activeTab === "api" && (
            <div className="space-y-4">
              <div className="border border-[#183B56] bg-[#F5EFEB] p-4 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#5A7184]">
                  PUBLIC REST API SPECIFICATION
                </span>
                <p className="text-xs text-[#183B56] font-medium">
                  Integrate 3D silhouette fitting, designer catalog feeds, and custom commission pipelines directly into your app.
                </p>
              </div>

              <div className="border border-[#183B56] bg-[#111827] text-white p-4 font-mono text-[11px] space-y-2 overflow-x-auto">
                <div className="text-emerald-400"># 1. Fetch Silhouette &amp; Morphology Fit Parameters</div>
                <div className="text-[#38BDF8]">curl -X GET https://api.weavly.com/v1/fit/calibrate \</div>
                <div className="pl-4 text-[#94A3B8]">-H "Authorization: Bearer wvl_dev_sandbox_token" \</div>
                <div className="pl-4 text-[#94A3B8]">-H "Content-Type: application/json"</div>
              </div>

              <div className="border border-[#183B56] bg-[#111827] text-white p-4 font-mono text-[11px] space-y-2 overflow-x-auto">
                <div className="text-emerald-400"># 2. Query Verified Designer Catalog</div>
                <div className="text-[#38BDF8]">curl -X GET "https://api.weavly.com/api/designs?category=Eveningwear" \</div>
                <div className="pl-4 text-[#94A3B8]">-H "Authorization: Bearer wvl_dev_sandbox_token"</div>
              </div>

              <div className="p-4 bg-[#F5EFEB] border border-[#183B56] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold uppercase text-[#183B56] block">Need Production API Quotas?</span>
                  <span className="text-[#5A7184]">Email the engineering team for custom rate limits and webhook endpoints.</span>
                </div>
                <a
                  href="mailto:chokkapusaketh@gmail.com?subject=Weavly%20Developer%20API%20Access"
                  className="px-4 py-2 bg-[#183B56] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#102A43] shrink-0"
                >
                  Contact Lead Eng
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: ENGINEERING TEAM & CAREERS */}
          {activeTab === "careers" && (
            <div className="space-y-4">
              <div className="border border-[#183B56] bg-[#F5EFEB] p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-[#183B56]" />
                  <span className="text-sm font-bold uppercase text-[#183B56]">
                    Build the Future of Fashion Intelligence
                  </span>
                </div>
                <p className="text-xs text-[#5A7184] leading-relaxed">
                  Weavly is built with Spring Boot, Next.js, and PyTorch Zyra computer vision engines. We are constantly collaborating with passionate engineers, systems architects, and open-source contributors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-[#183B56] bg-white p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase">BACKEND ARCHITECTURE</span>
                  <div className="text-xs font-bold text-[#183B56]">Spring Boot &amp; PostgreSQL</div>
                  <p className="text-[11px] text-[#5A7184]">Distributed transaction ledgers &amp; escrow systems.</p>
                </div>
                <div className="border border-[#183B56] bg-white p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase">VISION &amp; 3D</span>
                  <div className="text-xs font-bold text-[#183B56]">Zyra ML &amp; Three.js</div>
                  <p className="text-[11px] text-[#5A7184]">Morphology extraction &amp; digital drape modeling.</p>
                </div>
                <div className="border border-[#183B56] bg-white p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase">FRONTEND APP</span>
                  <div className="text-xs font-bold text-[#183B56]">Next.js &amp; Tailwind</div>
                  <p className="text-[11px] text-[#5A7184]">Architectural, micro-animated design systems.</p>
                </div>
              </div>

              <div className="p-5 border border-[#183B56] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase text-xs text-[#183B56]">
                    Direct Engineering Contact
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5">
                    HIRING &amp; COLLABORATIONS OPEN
                  </span>
                </div>
                <p className="text-xs text-[#5A7184] leading-relaxed">
                  Have an open source contribution, security report, or wish to join the engineering team? Contact our founder and lead developer directly:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="mailto:chokkapusaketh@gmail.com?subject=Weavly%20Engineering%20Inquiry"
                    className="px-4 py-2 bg-[#183B56] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#102A43] flex items-center gap-1.5"
                  >
                    <Mail size={13} />
                    <span>chokkapusaketh@gmail.com</span>
                  </a>
                  <a
                    href="https://github.com/Ch-saketh/weavly"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-[#183B56] border border-[#183B56] text-[11px] font-bold uppercase tracking-wider hover:bg-[#F5EFEB] flex items-center gap-1.5"
                  >
                    <Code2 size={13} />
                    <span>GitHub Repository</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER ── */}
        <div className="p-4 border-t border-[#183B56] bg-[#F5EFEB] flex items-center justify-between text-[11px] text-[#5A7184] font-medium">
          <span>Weavly Engineering &amp; Platform APIs</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#183B56] hover:underline uppercase text-[10px] cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
