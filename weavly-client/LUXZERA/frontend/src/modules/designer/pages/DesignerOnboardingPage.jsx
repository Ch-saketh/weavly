"use client";

// src/modules/designer/pages/DesignerOnboardingPage.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, UploadCloud, Eye, EyeOff, X, Lock, Send, ShieldCheck
} from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Loader from "@/shared/components/ui/Loader";

export default function DesignerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [form, setForm] = useState({
    // Step 1: Personal Info
    fullName: "",
    email: "",
    mobileCode: "+91",
    mobileNumber: "",
    password: "",
    confirmPassword: "",

    // Step 2: About Brand
    brandName: "",
    brandDescription: "",
    brandStory: "",
    experienceYears: "",
    fashionCategory: "",
    location: "",

    // Step 3: Portfolio (simulated metadata)
    profilePhoto: null,
    brandLogo: null,
    coverBanner: null,
    portfolioImages: [],

    // Step 4: Verification (simulated metadata)
    governmentId: null,
    panCard: null,
    addressProof: null,
    confirmAccurate: false,

    // Step 5: Banking Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",

    // Step 6: Social Links & Website
    website: "",
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  });

  // Simulated upload progress states
  const [uploadProgress, setUploadProgress] = useState({});

  // ── LOAD STATE FROM LOCALSTORAGE ──
  useEffect(() => {
    const saved = localStorage.getItem("Weavly_designer_onboarding");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed }));
        if (parsed.savedStep) {
          setStep(parsed.savedStep);
        }
      } catch (e) {
        console.error("Failed to parse onboarding autosave:", e);
      }
    }
  }, []);

  // ── SAVE STATE TO LOCALSTORAGE ──
  const saveState = (updatedForm, nextStep) => {
    localStorage.setItem(
      "Weavly_designer_onboarding",
      JSON.stringify({ ...updatedForm, savedStep: nextStep })
    );
  };

  const patch = (key, value) => {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);
    saveState(nextForm, step);
  };

  // ── SIMULATED FILE UPLOADER ──
  const simulateUpload = (fieldName, fileList, isMultiple = false) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploadProgress(prev => ({ ...prev, [fieldName]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));
        if (isMultiple) {
          const current = form[fieldName] || [];
          const updated = [...current, ...files.map(f => ({ name: f.name, size: f.size }))];
          patch(fieldName, updated);
        } else {
          patch(fieldName, { name: files[0].name, size: files[0].size });
        }
        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[fieldName];
            return next;
          });
        }, 600);
      } else {
        setUploadProgress(prev => ({ ...prev, [fieldName]: progress }));
      }
    }, 150);
  };

  const removeFile = (fieldName, index = null) => {
    if (index !== null) {
      const list = (form[fieldName] || []).filter((_, i) => i !== index);
      patch(fieldName, list);
    } else {
      patch(fieldName, null);
    }
  };

  // ── STEP VALIDATIONS ──
  const canContinue = () => {
    if (step === 1) {
      return (
        form.fullName.trim() !== "" &&
        form.email.trim() !== "" &&
        form.mobileNumber.trim() !== "" &&
        form.password.length >= 6 &&
        form.password === form.confirmPassword
      );
    }
    if (step === 2) {
      return (
        form.brandName.trim() !== "" &&
        form.brandDescription.trim() !== "" &&
        form.brandStory.trim() !== "" &&
        form.experienceYears !== "" &&
        form.fashionCategory !== "" &&
        form.location !== ""
      );
    }
    if (step === 3) {
      return form.profilePhoto !== null && form.brandLogo !== null && form.portfolioImages.length > 0;
    }
    if (step === 4) {
      return form.governmentId !== null && form.addressProof !== null && form.confirmAccurate;
    }
    if (step === 5) {
      return (
        form.accountHolderName.trim() !== "" &&
        form.bankName.trim() !== "" &&
        form.accountNumber.trim() !== "" &&
        form.ifsc.trim() !== ""
      );
    }
    if (step === 6) {
      return form.instagram.trim() !== "";
    }
    return true;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (!canContinue()) return;

    if (step < 7) {
      const nextStep = step + 1;
      setStep(nextStep);
      saveState(form, nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      saveState(form, prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setStep(8);
    localStorage.removeItem("Weavly_designer_onboarding");
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] py-12 px-4 flex flex-col items-center justify-between font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* HEADER SECTION */}
      <div className="w-full max-w-[580px] flex flex-col items-center text-center">
        <button onClick={() => router.push("/")} className="cursor-pointer mb-6 flex items-center justify-center border-none bg-transparent p-0 select-none" aria-label="Weavly home">
          <WeavlyLogo showBeta={false} size="lg" />
        </button>

        {/* Title & Subtitle */}
        {step <= 7 && (
          <>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] mb-1">
              <span>Atelier Accreditation Phase {step} of 7</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#183B56] uppercase tracking-tight">
              Become a Weavly Designer
            </h1>
            <p className="text-xs text-[#5A7184] font-medium mt-1 mb-8 max-w-md leading-relaxed">
              Complete your atelier dossier to publish curated garments and launch collections on Weavly.
            </p>
          </>
        )}

        {/* Blueprint Stepper */}
        {step <= 7 && (
          <div className="w-full max-w-[420px] mx-auto flex items-center justify-between relative mb-10 px-2">
            {/* Background Stepper Line */}
            <div className="absolute top-[14px] left-4 right-4 h-[1px] bg-[#183B56]/20 z-0" />
            
            {/* Stepper Active Highlight Line */}
            <div 
              className="absolute top-[14px] left-4 h-[1px] bg-[#183B56] z-0 transition-all duration-500" 
              style={{ width: `${((step - 1) / 6) * 90}%` }}
            />

            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const active = step === num;
              const completed = step > num;
              return (
                <button
                  key={num}
                  onClick={() => completed && setStep(num)}
                  disabled={!completed && step !== num}
                  className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed border-none bg-transparent p-0"
                >
                  <div 
                    className={`w-7 h-7 flex items-center justify-center text-[11px] font-mono font-bold transition-all duration-300 ${
                      completed 
                        ? "bg-[#183B56] text-white border border-[#183B56]" 
                        : active 
                          ? "bg-white text-[#183B56] border-2 border-[#183B56] shadow-xs" 
                          : "bg-[#F5EFEB] text-[#5A7184] border border-[#183B56]/30"
                    }`}
                  >
                    {completed ? <Check size={12} strokeWidth={3} /> : num}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CORE FORM CONTAINER */}
      <div className="w-full max-w-[580px] bg-white border border-[#183B56] p-6 sm:p-10 shadow-xs relative transition-all duration-300 flex flex-col text-left">
        
        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[11px] font-bold text-[#183B56] uppercase tracking-[0.2em] mb-6 text-center">
              1. Personal Dossier
            </h2>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Full Legal Name <span className="text-[#183B56]">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={form.fullName}
                  onChange={(e) => patch("fullName", e.target.value)}
                  placeholder="Enter full legal name"
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-[#183B56]">*</span>
                </label>
                <input 
                  required 
                  type="email" 
                  value={form.email}
                  onChange={(e) => patch("email", e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Contact Mobile <span className="text-[#183B56]">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.mobileCode}
                    onChange={(e) => patch("mobileCode", e.target.value)}
                    className="w-24 bg-[#F5EFEB]/40 border border-[#183B56]/30 px-2 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    required
                    type="tel"
                    value={form.mobileNumber}
                    onChange={(e) => patch("mobileNumber", e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Password <span className="text-[#183B56]">*</span>
                </label>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={form.password}
                    onChange={(e) => patch("password", e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56] focus:bg-white transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7184] hover:text-[#183B56] border-none bg-transparent"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-[#183B56]">*</span>
                </label>
                <div className="relative">
                  <input 
                    required 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={form.confirmPassword}
                    onChange={(e) => patch("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56] focus:bg-white transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7184] hover:text-[#183B56] border-none bg-transparent"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!canContinue()}
                className="mt-4 w-full h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span>Proceed to Brand Information</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: About Brand */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[11px] font-bold text-[#183B56] uppercase tracking-[0.2em] mb-6 text-center">
              2. Atelier & Brand Identity
            </h2>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Brand / Studio Name <span className="text-[#183B56]">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={form.brandName}
                  onChange={(e) => patch("brandName", e.target.value)}
                  placeholder="e.g. Atelier Veloce"
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Category <span className="text-[#183B56]">*</span>
                </label>
                <select
                  required
                  value={form.fashionCategory}
                  onChange={(e) => patch("fashionCategory", e.target.value)}
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                >
                  <option value="">Select Primary Focus</option>
                  <option value="Haute Couture">Haute Couture</option>
                  <option value="Menswear Tailoring">Menswear Tailoring</option>
                  <option value="Womenswear Luxury">Womenswear Luxury</option>
                  <option value="Unisex Streetwear">Unisex Streetwear</option>
                  <option value="Avant-Garde Capsule">Avant-Garde Capsule</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Experience & Studio Location <span className="text-[#183B56]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="text"
                    value={form.experienceYears}
                    onChange={(e) => patch("experienceYears", e.target.value)}
                    placeholder="e.g. 5+ Years"
                    className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                  />
                  <input
                    required
                    type="text"
                    value={form.location}
                    onChange={(e) => patch("location", e.target.value)}
                    placeholder="e.g. Milan / Mumbai"
                    className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Brand Philosophy & Story <span className="text-[#183B56]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.brandDescription}
                  onChange={(e) => {
                    patch("brandDescription", e.target.value);
                    patch("brandStory", e.target.value);
                  }}
                  placeholder="Describe your design ethos, fabric sourcing, and craftsmanship principles..."
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 p-3 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56] focus:bg-white resize-none"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="h-11 px-5 border border-[#183B56] text-[#183B56] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#183B56] hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>Continue to Portfolio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Portfolio */}
        {step === 3 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[11px] font-bold text-[#183B56] uppercase tracking-[0.2em] mb-6 text-center">
              3. Portfolio & Lookbook Media
            </h2>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
              {/* Profile / Avatar */}
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Designer Headshot / Portrait <span className="text-[#183B56]">*</span>
                </label>
                <div 
                  onClick={() => document.getElementById("profilePhotoInput")?.click()}
                  className="border border-dashed border-[#183B56]/50 bg-[#F5EFEB]/30 hover:bg-[#F5EFEB] p-4 text-center cursor-pointer transition-all"
                >
                  <input
                    id="profilePhotoInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => simulateUpload("profilePhoto", e.target.files)}
                    className="hidden"
                  />
                  {uploadProgress.profilePhoto ? (
                    <Loader size="xs" text="UPLOADING PORTRAIT" />
                  ) : form.profilePhoto ? (
                    <div className="flex items-center justify-between text-xs font-bold text-[#183B56]">
                      <span>{form.profilePhoto.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeFile("profilePhoto"); }} className="text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#183B56] uppercase tracking-wider">
                      Select Portrait File
                    </span>
                  )}
                </div>
              </div>

              {/* Brand Logo */}
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Brand Emblem / Vector Logo <span className="text-[#183B56]">*</span>
                </label>
                <div 
                  onClick={() => document.getElementById("brandLogoInput")?.click()}
                  className="border border-dashed border-[#183B56]/50 bg-[#F5EFEB]/30 hover:bg-[#F5EFEB] p-4 text-center cursor-pointer transition-all"
                >
                  <input
                    id="brandLogoInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => simulateUpload("brandLogo", e.target.files)}
                    className="hidden"
                  />
                  {uploadProgress.brandLogo ? (
                    <Loader size="xs" text="UPLOADING LOGO" />
                  ) : form.brandLogo ? (
                    <div className="flex items-center justify-between text-xs font-bold text-[#183B56]">
                      <span>{form.brandLogo.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeFile("brandLogo"); }} className="text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#183B56] uppercase tracking-wider">
                      Select Logo Asset
                    </span>
                  )}
                </div>
              </div>

              {/* Lookbook Portfolio */}
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Lookbook Garments ({form.portfolioImages.length} uploaded) <span className="text-[#183B56]">*</span>
                </label>
                <div 
                  onClick={() => document.getElementById("portfolioInput")?.click()}
                  className="border border-dashed border-[#183B56]/50 bg-[#F5EFEB]/30 hover:bg-[#F5EFEB] p-4 text-center cursor-pointer transition-all"
                >
                  <input
                    id="portfolioInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => simulateUpload("portfolioImages", e.target.files, true)}
                    className="hidden"
                  />
                  {uploadProgress.portfolioImages ? (
                    <Loader size="xs" text="UPLOADING LOOKBOOK" />
                  ) : (
                    <span className="text-xs font-bold text-[#183B56] uppercase tracking-wider">
                      Upload Lookbook Files
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="h-11 px-5 border border-[#183B56] text-[#183B56] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#183B56] hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>Continue to Verification</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Verification */}
        {step === 4 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[11px] font-bold text-[#183B56] uppercase tracking-[0.2em] mb-6 text-center">
              4. Identity & Legal Verification
            </h2>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Government Issued ID <span className="text-[#183B56]">*</span>
                </label>
                <div 
                  onClick={() => document.getElementById("govIdInput")?.click()}
                  className="border border-dashed border-[#183B56]/50 bg-[#F5EFEB]/30 hover:bg-[#F5EFEB] p-4 text-center cursor-pointer"
                >
                  <input
                    id="govIdInput"
                    type="file"
                    onChange={(e) => simulateUpload("governmentId", e.target.files)}
                    className="hidden"
                  />
                  {form.governmentId ? (
                    <div className="flex items-center justify-between text-xs font-bold text-[#183B56]">
                      <span>{form.governmentId.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeFile("governmentId"); }} className="text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#183B56] uppercase tracking-wider">
                      Upload Passport / ID Card
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Address / Studio Proof <span className="text-[#183B56]">*</span>
                </label>
                <div 
                  onClick={() => document.getElementById("addressProofInput")?.click()}
                  className="border border-dashed border-[#183B56]/50 bg-[#F5EFEB]/30 hover:bg-[#F5EFEB] p-4 text-center cursor-pointer"
                >
                  <input
                    id="addressProofInput"
                    type="file"
                    onChange={(e) => simulateUpload("addressProof", e.target.files)}
                    className="hidden"
                  />
                  {form.addressProof ? (
                    <div className="flex items-center justify-between text-xs font-bold text-[#183B56]">
                      <span>{form.addressProof.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeFile("addressProof"); }} className="text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#183B56] uppercase tracking-wider">
                      Upload Studio Utility Bill / Lease
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="confirmAccurate"
                  type="checkbox"
                  checked={form.confirmAccurate}
                  onChange={(e) => patch("confirmAccurate", e.target.checked)}
                  className="w-4 h-4 accent-[#183B56]"
                />
                <label htmlFor="confirmAccurate" className="text-xs text-[#183B56] font-medium cursor-pointer">
                  I certify all legal business documents provided are authentic.
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="h-11 px-5 border border-[#183B56] text-[#183B56] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#183B56] hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>Continue to Payouts</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: Banking Details */}
        {step === 5 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[11px] font-bold text-[#183B56] uppercase tracking-[0.2em] mb-6 text-center">
              5. Payout Settlement Account
            </h2>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Account Beneficiary Name <span className="text-[#183B56]">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={form.accountHolderName}
                  onChange={(e) => patch("accountHolderName", e.target.value)}
                  placeholder="Legal Name as in Bank"
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Bank Name <span className="text-[#183B56]">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={form.bankName}
                  onChange={(e) => patch("bankName", e.target.value)}
                  placeholder="e.g. HDFC Bank / Chase"
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Account Number & IFSC / Routing Code <span className="text-[#183B56]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => patch("accountNumber", e.target.value)}
                    placeholder="Account Number"
                    className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                  />
                  <input
                    required
                    type="text"
                    value={form.ifsc}
                    onChange={(e) => patch("ifsc", e.target.value)}
                    placeholder="IFSC / Routing"
                    className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="h-11 px-5 border border-[#183B56] text-[#183B56] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#183B56] hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>Continue to Socials</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 6: Social Links */}
        {step === 6 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[11px] font-bold text-[#183B56] uppercase tracking-[0.2em] mb-6 text-center">
              6. Digital Presence
            </h2>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Instagram Handle <span className="text-[#183B56]">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={form.instagram}
                  onChange={(e) => patch("instagram", e.target.value)}
                  placeholder="@yourbrand"
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5">
                  Official Atelier Website (Optional)
                </label>
                <input 
                  type="url" 
                  value={form.website}
                  onChange={(e) => patch("website", e.target.value)}
                  placeholder="https://atelier.com"
                  className="w-full bg-[#F5EFEB]/40 border border-[#183B56]/30 px-3.5 py-2.5 text-xs font-medium text-[#183B56] outline-none focus:border-[#183B56]"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="h-11 px-5 border border-[#183B56] text-[#183B56] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#183B56] hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>Review Dossier</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 7: Review & Submit */}
        {step === 7 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[11px] font-bold text-[#183B56] uppercase tracking-[0.2em] mb-1.5 text-center">
              7. Review & Submit Dossier
            </h2>
            <p className="text-xs text-[#5A7184] mb-6 text-center">
              Review your details prior to final validation.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { title: "Personal Info", stepNum: 1, details: `${form.fullName}\n${form.email} • ${form.mobileCode} ${form.mobileNumber}` },
                { title: "Brand Info", stepNum: 2, details: `${form.brandName} (${form.fashionCategory})\nLocation: ${form.location} | Experience: ${form.experienceYears}` },
                { title: "Lookbook", stepNum: 3, details: `Portrait: ${form.profilePhoto?.name || "Uploaded"}\nEmblem: ${form.brandLogo?.name || "Uploaded"}\nLookbook: ${form.portfolioImages?.length || 0} files` },
                { title: "Payout Settlement", stepNum: 5, details: `Beneficiary: ${form.accountHolderName}\nBank: ${form.bankName} (${form.ifsc})` },
                { title: "Digital Presence", stepNum: 6, details: `Instagram: ${form.instagram}\nWebsite: ${form.website || "None"}` }
              ].map((sec) => (
                <div key={sec.title} className="bg-[#F5EFEB]/50 border border-[#183B56]/30 p-3.5 relative text-left">
                  <button 
                    onClick={() => setStep(sec.stepNum)} 
                    className="absolute right-3.5 top-3.5 text-[11px] font-bold text-[#183B56] hover:underline border-none bg-transparent cursor-pointer uppercase"
                  >
                    Edit
                  </button>
                  <p className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider mb-1">{sec.title}</p>
                  <pre className="text-xs font-semibold text-[#183B56] whitespace-pre-line leading-relaxed font-sans">{sec.details}</pre>
                </div>
              ))}

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="h-11 px-5 border border-[#183B56] text-[#183B56] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#183B56] hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Submit Application</span>
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Success State */}
        {step === 8 && (
          <div className="animate-fade-in py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 border-2 border-[#183B56] bg-white text-[#183B56] flex items-center justify-center mb-6 shadow-xs">
              <Check size={32} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56] mb-2">
              Dossier Submitted
            </h2>
            
            <p className="text-xs text-[#5A7184] leading-relaxed max-w-sm mb-6">
              Our accreditation board will review your collection within 24–48 hours. Once approved you will receive direct access to your Designer Studio.
            </p>

            <button 
              onClick={() => router.push("/designer-studio")}
              className="px-8 h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] transition-colors shadow-xs cursor-pointer"
            >
              Go to Designer Studio
            </button>
          </div>
        )}

      </div>

      {/* FOOTER */}
      {step <= 7 && (
        <div className="max-w-[580px] w-full mx-auto text-center mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#5A7184] font-bold uppercase tracking-widest">
          <Lock size={12} className="text-[#183B56]" />
          <span>Encrypted Atelier Application Protocol</span>
        </div>
      )}
    </div>
  );
}
