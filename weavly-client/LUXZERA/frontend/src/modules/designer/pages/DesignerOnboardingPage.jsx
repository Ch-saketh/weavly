"use client";

// src/pages/DesignerOnboardingPage.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, UploadCloud, Eye, EyeOff, X, Lock, Send
} from "lucide-react";

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
      progress += Math.floor(Math.random() * 20) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        const filesData = files.map(f => ({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(2) + " MB" }));
        if (isMultiple) {
          patch(fieldName, [...(form[fieldName] || []), ...filesData]);
        } else {
          patch(fieldName, filesData[0]);
        }

        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[fieldName];
            return next;
          });
        }, 600);
      }
      setUploadProgress(prev => ({ ...prev, [fieldName]: progress }));
    }, 150);
  };

  const removeUploadedFile = (fieldName, index = -1) => {
    if (index > -1) {
      const list = [...form[fieldName]];
      list.splice(index, 1);
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
    <div className="min-h-screen bg-white text-[#1D1D1F] py-12 px-4 flex flex-col items-center justify-between" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* HEADER SECTION */}
      <div className="w-full max-w-[560px] flex flex-col items-center text-center">
        <button onClick={() => router.push("/")} className="cursor-pointer mb-6 flex items-center justify-center border-none bg-transparent p-0 select-none" aria-label="Weavly home">
          <div className="text-2xl font-black tracking-tighter uppercase text-[#1D1D1F]"> <span className="tracking-tighter"><span className="text-[#F07020]">LUX</span><span className="text-[#1D1D1F]">ZERA</span></span> </div>
        </button>

        {/* Title & Subtitle */}
        {step <= 7 && (
          <>
            <h1 className="text-[28px] sm:text-[32px] font-black text-[#0D1B2A] tracking-tight font-serif">
              Become a Weavly Designer
            </h1>
            <p className="text-[13px] text-[#86868B] font-semibold mt-1.5 mb-10 max-w-md leading-relaxed">
              Create your designer profile and start your journey with us.
            </p>
          </>
        )}

        {/* Horizontal Progress Stepper */}
        {step <= 7 && (
          <div className="w-full max-w-[360px] mx-auto flex items-center justify-between relative mb-14 px-2">
            {/* Background Stepper Line */}
            <div className="absolute top-[15px] left-4 right-4 h-[2px] bg-[#E7E3DD] z-0" />
            
            {/* Stepper Active Highlight Line */}
            <div 
              className="absolute top-[15px] left-4 h-[2px] bg-[#FF6A00] z-0 transition-all duration-500" 
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
                  className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed border-none bg-transparent"
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black transition-all duration-300 ${
                      completed 
                        ? "bg-[#FF6A00] text-white border border-[#FF6A00]" 
                        : active 
                          ? "bg-white text-[#FF6A00] border-2 border-[#FF6A00] shadow-[0_0_12px_rgba(255,106,0,0.2)]" 
                          : "bg-white text-[#86868B] border border-[#E7E3DD]"
                    }`}
                  >
                    {completed ? <Check size={13} strokeWidth={3} /> : num}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CORE FORM CONTAINER */}
      <div className="auth-surface w-full max-w-[560px] rounded-[24px] p-6 sm:p-10 relative transition-all duration-300 flex flex-col">
        <div className="auth-content">
        
        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[13px] font-black text-[#FF6A00] uppercase tracking-wider mb-6 text-center">Personal Information</h2>

            <form onSubmit={handleNext} className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Full Name <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={form.fullName}
                  onChange={(e) => patch("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Email Address <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="email" 
                  value={form.email}
                  onChange={(e) => patch("email", e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              {/* Mobile Code & Phone input wrapped together */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Mobile Number <span className="text-[#FF6A00]">*</span></label>
                <div className="flex bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl overflow-hidden focus-within:border-[#FF6A00] focus-within:bg-white transition-all">
                  <div className="relative flex items-center pl-3 border-r border-[#E2DFD8] pr-1.5 shrink-0 bg-[#FAF8F5]/30">
                    <select
                      value={form.mobileCode}
                      onChange={(e) => patch("mobileCode", e.target.value)}
                      className="bg-transparent border-none outline-none text-[13px] font-black text-[#0D1B2A] cursor-pointer appearance-none pr-3"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+39">+39</option>
                    </select>
                    <span className="absolute right-1 text-[9px] pointer-events-none text-[#86868B]">▼</span>
                  </div>
                  <input 
                    required 
                    type="tel" 
                    value={form.mobileNumber}
                    onChange={(e) => patch("mobileNumber", e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full bg-transparent px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none"
                  />
                </div>
              </div>

              {/* Password inputs */}
              <div className="relative">
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Password <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={form.password}
                  onChange={(e) => patch("password", e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl pl-4 pr-10 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[39px] text-[#86868B] hover:text-[#0D1B2A] border-none bg-transparent cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Confirm Password <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={form.confirmPassword}
                  onChange={(e) => patch("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl pl-4 pr-10 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-[39px] text-[#86868B] hover:text-[#0D1B2A] border-none bg-transparent cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-[11px] font-bold text-[#FF3B30] mt-1 text-center">Passwords do not match.</p>
              )}

              <button 
                type="submit" 
                disabled={!canContinue()}
                className="w-full py-4 mt-6 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#FF6A00] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,106,0,0.18)] border-none cursor-pointer"
              >
                Continue <ArrowRight size={13} />
              </button>

              <div className="text-center mt-3">
                <span className="text-[12px] text-[#86868B] font-semibold">
                  Already have an account? <span onClick={() => router.push("/account")} className="text-[#FF6A00] hover:underline font-bold cursor-pointer">Sign in</span>
                </span>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: About Your Brand */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[13px] font-black text-[#FF6A00] uppercase tracking-wider mb-6 text-center">About Your Brand</h2>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Designer / Brand Name <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={form.brandName}
                  onChange={(e) => patch("brandName", e.target.value)}
                  placeholder="Enter your brand name"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Brand Description <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={form.brandDescription}
                  onChange={(e) => patch("brandDescription", e.target.value)}
                  placeholder="Describe your brand in a few words"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Your Story <span className="text-[#FF6A00]">*</span></label>
                <textarea 
                  required 
                  rows={3} 
                  value={form.brandStory}
                  onChange={(e) => patch("brandStory", e.target.value)}
                  placeholder="Tell us your story, your inspiration and what makes your brand unique"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Years of Experience <span className="text-[#FF6A00]">*</span></label>
                <select 
                  required
                  value={form.experienceYears}
                  onChange={(e) => patch("experienceYears", e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select experience</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1 - 3 years</option>
                  <option value="3-5">3 - 5 years</option>
                  <option value="5-10">5 - 10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Fashion Category <span className="text-[#FF6A00]">*</span></label>
                <select 
                  required
                  value={form.fashionCategory}
                  onChange={(e) => patch("fashionCategory", e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select categories</option>
                  {["Men", "Women", "Streetwear", "Luxury", "Casual", "Accessories", "Kids", "Ethnic"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Location <span className="text-[#FF6A00]">*</span></label>
                <select 
                  required
                  value={form.location}
                  onChange={(e) => patch("location", e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your location</option>
                  <option value="Mumbai">Mumbai, India</option>
                  <option value="Delhi">Delhi, India</option>
                  <option value="Bengaluru">Bengaluru, India</option>
                  <option value="Milan">Milan, Italy</option>
                  <option value="Paris">Paris, France</option>
                  <option value="New York">New York, USA</option>
                  <option value="London">London, UK</option>
                </select>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-4 rounded-full border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 py-4 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#FF6A00] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,106,0,0.18)] border-none cursor-pointer"
                >
                  Continue <ArrowRight size={13} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Portfolio & Media */}
        {step === 3 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[13px] font-black text-[#FF6A00] uppercase tracking-wider mb-1.5 text-center">Portfolio & Media</h2>
            <p className="text-[11.5px] text-[#86868B] font-semibold mb-6 text-center">Upload your portfolio and brand assets</p>

            <div className="flex flex-col gap-5">
              {/* Profile Photo */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Profile Photo <span className="text-[#FF6A00]">*</span></label>
                <div className="border border-dashed border-[#E2DFD8] rounded-2xl p-4 bg-[#FAF8F5] text-center flex flex-col items-center justify-center relative hover:bg-white hover:border-[#FF6A00] transition-all group">
                  {form.profilePhoto ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate pr-4">{form.profilePhoto.name}</span>
                      <button onClick={() => removeUploadedFile("profilePhoto")} className="text-[#86868B] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer"><X size={15} /></button>
                    </div>
                  ) : uploadProgress.profilePhoto ? (
                    <div className="w-full py-2">
                      <p className="text-[11px] font-bold text-[#FF6A00] mb-2">Uploading ({uploadProgress.profilePhoto}%)</p>
                      <div className="w-full h-1 bg-[#E7E3DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6A00]" style={{ width: `${uploadProgress.profilePhoto}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center py-2">
                      <UploadCloud size={22} className="text-[#86868B] group-hover:text-[#FF6A00] mb-1.5 transition-colors" />
                      <span className="text-[11px] font-bold text-[#0D1B2A]">Upload your photo</span>
                      <span className="text-[9.5px] text-[#86868B] mt-0.5">JPG, PNG (Max 5MB)</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => simulateUpload("profilePhoto", e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Brand Logo */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Brand Logo <span className="text-[#FF6A00]">*</span></label>
                <div className="border border-dashed border-[#E2DFD8] rounded-2xl p-4 bg-[#FAF8F5] text-center flex flex-col items-center justify-center relative hover:bg-white hover:border-[#FF6A00] transition-all group">
                  {form.brandLogo ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate pr-4">{form.brandLogo.name}</span>
                      <button onClick={() => removeUploadedFile("brandLogo")} className="text-[#86868B] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer"><X size={15} /></button>
                    </div>
                  ) : uploadProgress.brandLogo ? (
                    <div className="w-full py-2">
                      <p className="text-[11px] font-bold text-[#FF6A00] mb-2">Uploading ({uploadProgress.brandLogo}%)</p>
                      <div className="w-full h-1 bg-[#E7E3DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6A00]" style={{ width: `${uploadProgress.brandLogo}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center py-2">
                      <UploadCloud size={22} className="text-[#86868B] group-hover:text-[#FF6A00] mb-1.5 transition-colors" />
                      <span className="text-[11px] font-bold text-[#0D1B2A]">Upload your logo</span>
                      <span className="text-[9.5px] text-[#86868B] mt-0.5">JPG, PNG (Max 5MB)</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => simulateUpload("brandLogo", e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Cover Banner */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Cover Banner</label>
                <div className="border border-dashed border-[#E2DFD8] rounded-2xl p-4 bg-[#FAF8F5] text-center flex flex-col items-center justify-center relative hover:bg-white hover:border-[#FF6A00] transition-all group">
                  {form.coverBanner ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate pr-4">{form.coverBanner.name}</span>
                      <button onClick={() => removeUploadedFile("coverBanner")} className="text-[#86868B] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer"><X size={15} /></button>
                    </div>
                  ) : uploadProgress.coverBanner ? (
                    <div className="w-full py-2">
                      <p className="text-[11px] font-bold text-[#FF6A00] mb-2">Uploading ({uploadProgress.coverBanner}%)</p>
                      <div className="w-full h-1 bg-[#E7E3DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6A00]" style={{ width: `${uploadProgress.coverBanner}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center py-2">
                      <UploadCloud size={22} className="text-[#86868B] group-hover:text-[#FF6A00] mb-1.5 transition-colors" />
                      <span className="text-[11px] font-bold text-[#0D1B2A]">Upload cover banner</span>
                      <span className="text-[9.5px] text-[#86868B] mt-0.5">JPG, PNG (Max 5MB)</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => simulateUpload("coverBanner", e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Portfolio Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider">Portfolio Images <span className="text-[#FF6A00]">*</span></label>
                  <span className="text-[11px] font-black text-[#86868B]">{form.portfolioImages?.length || 0}/10</span>
                </div>
                
                <div className="border border-dashed border-[#E2DFD8] rounded-2xl p-5 bg-[#FAF8F5] text-center flex flex-col items-center justify-center hover:bg-white hover:border-[#FF6A00] transition-all group relative">
                  {uploadProgress.portfolioImages ? (
                    <div className="w-full py-2">
                      <p className="text-[11px] font-bold text-[#FF6A00] mb-2">Uploading ({uploadProgress.portfolioImages}%)</p>
                      <div className="w-full h-1 bg-[#E7E3DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6A00]" style={{ width: `${uploadProgress.portfolioImages}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud size={24} className="text-[#86868B] group-hover:text-[#FF6A00] mb-2 transition-colors" />
                      <span className="text-[11.5px] font-bold text-[#0D1B2A]">Upload 5 - 10 images</span>
                      <span className="text-[10px] text-[#86868B] mt-0.5">JPG, PNG (Max 10MB each)</span>
                      <input type="file" multiple className="hidden" onChange={(e) => simulateUpload("portfolioImages", e.target.files, true)} />
                    </label>
                  )}
                </div>

                {/* List of uploaded items */}
                {form.portfolioImages?.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3">
                    {form.portfolioImages.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E7E3DD]/65 text-[11.5px]">
                        <span className="text-[#0D1B2A] font-semibold truncate pr-4">{file.name} ({file.size})</span>
                        <button onClick={() => removeUploadedFile("portfolioImages", i)} className="text-[#86868B] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-4 rounded-full border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                
                <button 
                  onClick={handleNext}
                  disabled={!canContinue()}
                  className="flex-1 py-4 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#FF6A00] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,106,0,0.18)] border-none cursor-pointer"
                >
                  Continue <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Verification Details */}
        {step === 4 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[13px] font-black text-[#FF6A00] uppercase tracking-wider mb-1.5 text-center">Verification Details</h2>
            <p className="text-[11.5px] text-[#86868B] font-semibold mb-6 text-center">Help us verify your identity</p>

            <div className="flex flex-col gap-5">
              {/* Government ID */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Government ID <span className="text-[#FF6A00]">*</span></label>
                <div className="border border-dashed border-[#E2DFD8] rounded-2xl p-5 bg-[#FAF8F5] text-center flex flex-col items-center justify-center hover:bg-white hover:border-[#FF6A00] transition-all group relative">
                  {form.governmentId ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate pr-4">{form.governmentId.name}</span>
                      <button onClick={() => removeUploadedFile("governmentId")} className="text-[#86868B] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer"><X size={15} /></button>
                    </div>
                  ) : uploadProgress.governmentId ? (
                    <div className="w-full py-2">
                      <p className="text-[11px] font-bold text-[#FF6A00] mb-2">Uploading ({uploadProgress.governmentId}%)</p>
                      <div className="w-full h-1 bg-[#E7E3DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6A00]" style={{ width: `${uploadProgress.governmentId}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud size={24} className="text-[#86868B] group-hover:text-[#FF6A00] mb-2 transition-colors" />
                      <span className="text-[11.5px] font-bold text-[#0D1B2A]">Upload Government ID</span>
                      <span className="text-[10px] text-[#86868B] mt-0.5">JPG, PNG, PDF (Max 5MB)</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => simulateUpload("governmentId", e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {/* PAN Card */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">PAN Card (Optional)</label>
                <div className="border border-dashed border-[#E2DFD8] rounded-2xl p-5 bg-[#FAF8F5] text-center flex flex-col items-center justify-center hover:bg-white hover:border-[#FF6A00] transition-all group relative">
                  {form.panCard ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate pr-4">{form.panCard.name}</span>
                      <button onClick={() => removeUploadedFile("panCard")} className="text-[#86868B] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer"><X size={15} /></button>
                    </div>
                  ) : uploadProgress.panCard ? (
                    <div className="w-full py-2">
                      <p className="text-[11px] font-bold text-[#FF6A00] mb-2">Uploading ({uploadProgress.panCard}%)</p>
                      <div className="w-full h-1 bg-[#E7E3DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6A00]" style={{ width: `${uploadProgress.panCard}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud size={24} className="text-[#86868B] group-hover:text-[#FF6A00] mb-2 transition-colors" />
                      <span className="text-[11.5px] font-bold text-[#0D1B2A]">Upload PAN Card</span>
                      <span className="text-[10px] text-[#86868B] mt-0.5">JPG, PNG, PDF (Max 5MB)</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => simulateUpload("panCard", e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Address Proof */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Address Proof <span className="text-[#FF6A00]">*</span></label>
                <div className="border border-dashed border-[#E2DFD8] rounded-2xl p-5 bg-[#FAF8F5] text-center flex flex-col items-center justify-center hover:bg-white hover:border-[#FF6A00] transition-all group relative">
                  {form.addressProof ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate pr-4">{form.addressProof.name}</span>
                      <button onClick={() => removeUploadedFile("addressProof")} className="text-[#86868B] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer"><X size={15} /></button>
                    </div>
                  ) : uploadProgress.addressProof ? (
                    <div className="w-full py-2">
                      <p className="text-[11px] font-bold text-[#FF6A00] mb-2">Uploading ({uploadProgress.addressProof}%)</p>
                      <div className="w-full h-1 bg-[#E7E3DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6A00]" style={{ width: `${uploadProgress.addressProof}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud size={24} className="text-[#86868B] group-hover:text-[#FF6A00] mb-2 transition-colors" />
                      <span className="text-[11.5px] font-bold text-[#0D1B2A]">Upload Address Proof</span>
                      <span className="text-[10px] text-[#86868B] mt-0.5">JPG, PNG, PDF (Max 5MB)</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => simulateUpload("addressProof", e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Ownership Checkbox */}
              <div className="flex items-start gap-3 mt-3">
                <input 
                  type="checkbox" 
                  id="confirmAccurate"
                  checked={form.confirmAccurate}
                  onChange={(e) => patch("confirmAccurate", e.target.checked)}
                  className="mt-1 accent-[#FF6A00] rounded focus:ring-[#FF6A00] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="confirmAccurate" className="text-[12.5px] font-semibold text-[#515154] cursor-pointer select-none leading-relaxed">
                  I confirm that all the information provided is accurate and all my designs are original.
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-4 rounded-full border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                
                <button 
                  onClick={handleNext}
                  disabled={!canContinue()}
                  className="flex-1 py-4 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#FF6A00] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,106,0,0.18)] border-none cursor-pointer"
                >
                  Continue <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Banking Details */}
        {step === 5 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[13px] font-black text-[#FF6A00] uppercase tracking-wider mb-1.5 text-center font-sans">Banking Details</h2>
            <p className="text-[11.5px] text-[#86868B] font-semibold mb-6 text-center">Add your bank details to receive payments</p>

            <form onSubmit={handleNext} className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Account Holder Name <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={form.accountHolderName}
                  onChange={(e) => patch("accountHolderName", e.target.value)}
                  placeholder="Enter account holder name"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Bank Name <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={form.bankName}
                  onChange={(e) => patch("bankName", e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Account Number <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="password" 
                  value={form.accountNumber}
                  onChange={(e) => patch("accountNumber", e.target.value)}
                  placeholder="Enter account number"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">IFSC Code <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={form.ifsc}
                  onChange={(e) => patch("ifsc", e.target.value)}
                  placeholder="Enter IFSC code"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">UPI ID (Optional)</label>
                <input 
                  type="text" 
                  value={form.upiId}
                  onChange={(e) => patch("upiId", e.target.value)}
                  placeholder="Enter UPI ID"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-4 rounded-full border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 py-4 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#FF6A00] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,106,0,0.18)] border-none cursor-pointer"
                >
                  Continue <ArrowRight size={13} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 6: Social Links & Website */}
        {step === 6 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[13px] font-black text-[#FF6A00] uppercase tracking-wider mb-1.5 text-center">Social Links & Website</h2>
            <p className="text-[11.5px] text-[#86868B] font-semibold mb-6 text-center">Help customers discover and connect with you</p>

            <form onSubmit={handleNext} className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Website (Optional)</label>
                <input 
                  type="url" 
                  value={form.website}
                  onChange={(e) => patch("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Instagram <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required
                  type="text" 
                  value={form.instagram}
                  onChange={(e) => patch("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Facebook (Optional)</label>
                <input 
                  type="text" 
                  value={form.facebook}
                  onChange={(e) => patch("facebook", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">YouTube (Optional)</label>
                <input 
                  type="text" 
                  value={form.youtube}
                  onChange={(e) => patch("youtube", e.target.value)}
                  placeholder="https://youtube.com/yourchannel"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">LinkedIn (Optional)</label>
                <input 
                  type="url" 
                  value={form.linkedin}
                  onChange={(e) => patch("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-[#FAF8F5] border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-4 rounded-full border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                
                <button 
                  type="submit" 
                  disabled={!canContinue()}
                  className="flex-1 py-4 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#FF6A00] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,106,0,0.18)] border-none cursor-pointer"
                >
                  Continue <ArrowRight size={13} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 7: Review & Submit */}
        {step === 7 && (
          <div className="animate-fade-in flex flex-col">
            <h2 className="text-[13px] font-black text-[#FF6A00] uppercase tracking-wider mb-1.5 text-center font-sans">Review & Submit</h2>
            <p className="text-[11.5px] text-[#86868B] font-semibold mb-6 text-center">Review your details before submitting</p>

            <div className="flex flex-col gap-4">
              {/* Summary cards */}
              {[
                { title: "Personal Information", stepNum: 1, details: `${form.fullName}\n${form.email} • ${form.mobileCode} ${form.mobileNumber}` },
                { title: "Brand Information", stepNum: 2, details: `${form.brandName} (${form.fashionCategory})\n"${form.brandDescription}"\nExperience: ${form.experienceYears} | Location: ${form.location}` },
                { title: "Portfolio & Media", stepNum: 3, details: `Profile Photo: ${form.profilePhoto?.name || "Uploaded"}\nBrand Logo: ${form.brandLogo?.name || "Uploaded"}\nCover Banner: ${form.coverBanner?.name || "None"}\nPortfolio Images: ${form.portfolioImages?.length || 0} files` },
                { title: "Verification Details", stepNum: 4, details: `Government ID: ${form.governmentId?.name || "Uploaded"}\nAddress Proof: ${form.addressProof?.name || "Uploaded"}\nPAN: ${form.panCard?.name || "None"}` },
                { title: "Banking Details", stepNum: 5, details: `Holder: ${form.accountHolderName}\nBank: ${form.bankName}\nIFSC: ${form.ifsc}` },
                { title: "Social Links", stepNum: 6, details: `Instagram: ${form.instagram}\nWebsite: ${form.website || "None"}` }
              ].map((sec) => (
                <div key={sec.title} className="bg-[#FAF8F5] border border-[#E7E3DD]/70 rounded-2xl p-4.5 relative text-left">
                  <button 
                    onClick={() => setStep(sec.stepNum)} 
                    className="absolute right-4 top-4.5 text-[11px] font-bold text-[#FF6A00] hover:underline border-none bg-transparent cursor-pointer"
                  >
                    Edit
                  </button>
                  <p className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-widest mb-1.5">{sec.title}</p>
                  <pre className="text-[12.5px] font-semibold text-[#0D1B2A] whitespace-pre-line leading-relaxed font-sans">{sec.details}</pre>
                </div>
              ))}

              {/* T&C check */}
              <div className="flex items-start gap-3 mt-4 px-1">
                <input required type="checkbox" id="acceptTerms" className="mt-1 accent-[#FF6A00] w-4.5 h-4.5 cursor-pointer" />
                <label htmlFor="acceptTerms" className="text-[12.5px] font-semibold text-[#515154] cursor-pointer leading-relaxed">
                  I agree to Weavly's <span className="text-[#FF6A00] font-bold hover:underline">Terms & Conditions</span> and <span className="text-[#FF6A00] font-bold hover:underline">Privacy Policy</span>.
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-4 rounded-full border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-4 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(255,106,0,0.22)] border-none cursor-pointer"
                >
                  Submit Application <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Success State */}
        {step === 8 && (
          <div className="animate-fade-in py-10 flex flex-col items-center text-center">
            {/* Success checkmark */}
            <div className="w-20 h-20 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mb-6 relative animate-bounce">
              <span className="absolute inset-0 rounded-full bg-[#10B981]/10 filter blur-md animate-pulse" />
              <Check size={42} strokeWidth={3} className="relative z-10" />
            </div>

            <h2 className="text-[26px] sm:text-[32px] font-black tracking-tight text-[#0D1B2A] leading-tight font-serif mb-3">
              Welcome to Weavly
            </h2>
            
            <p className="text-[14.5px] text-[#515154] leading-relaxed max-w-[420px] font-medium mb-1">
              Your application has been submitted successfully.
            </p>
            <p className="text-[13px] text-[#86868B] leading-relaxed max-w-[420px] font-semibold mb-8">
              Our team will review your application within <strong>24–48 hours</strong>. Once approved you'll receive access to your Designer Studio.
            </p>

            <button 
              onClick={() => router.push("/designer-studio")}
              className="px-10 py-4 rounded-full bg-[#0D1B2A] hover:bg-[#FF6A00] text-white text-[12px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_6px_20px_rgba(13,27,42,0.15)] border-none cursor-pointer"
            >
              Go to Designer Studio
            </button>
          </div>
        )}

        </div>
      </div>

      {/* FOOTER */}
      {step <= 7 && (
        <div className="max-w-[560px] w-full mx-auto text-center mt-8 flex flex-col items-center gap-1.5 text-[11px] text-[#86868B] font-extrabold uppercase tracking-widest">
          <div className="flex items-center gap-1.5 justify-center">
            <Lock size={12} className="text-[#FF6A00]" />
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      )}
    </div>
  );
}
