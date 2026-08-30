import React, { useRef, useState, useMemo } from "react";
import { Camera, Check, User, Phone, Calendar, FileText, Copy, Upload, Trash2, ShieldCheck, Sparkles } from "lucide-react";
import Loader from "@/shared/components/ui/Loader";

// Reusable architectural form field wrapper
const FormField = ({ label, icon: Icon, children, className = "" }) => (
  <div className={className}>
    <label className="block text-[11px] font-bold text-[#183B56] uppercase tracking-wider mb-1.5 font-sans">
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-3.5 text-[#183B56] pointer-events-none flex items-center justify-center z-10">
          <Icon size={15} strokeWidth={2} />
        </div>
      )}
      {children}
    </div>
  </div>
);

const inputBase = "w-full h-11 border border-[#183B56] bg-white text-[#183B56] placeholder-[#5A7184]/60 text-xs sm:text-[13px] font-medium outline-none focus:ring-1 focus:ring-[#183B56] transition-all shadow-xs";

const AccountView = ({ 
  formData, 
  user, 
  profile, 
  onFormChange, 
  onSave, 
  onRemovePhoto,
  saving, 
  successMsg, 
  errorMsg 
}) => {
  const [localPreview, setLocalPreview] = useState(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const fileInputRef = useRef(null);

  const maxAllowedDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 12);
    return d.toISOString().split("T")[0];
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    const sanitized = value.replace(/[^a-zA-Z\s'-]/g, "");
    e.target.value = sanitized;
    onFormChange(e);
  };

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const numericVal = rawVal.replace(/\D/g, "").slice(0, 10);
    e.target.value = numericVal;
    onFormChange(e);
  };

  const handleCopyEmail = () => {
    const email = user?.email;
    if (email) {
      navigator.clipboard.writeText(email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    }
  };

  const rawImage = localPreview || profile?.profilePicture || user?.profilePicture || user?.avatarUrl || null;
  const isValidUrl = typeof rawImage === "string" && (rawImage.startsWith("http://") || rawImage.startsWith("https://") || rawImage.startsWith("data:") || rawImage.startsWith("/"));
  const profileImage = isValidUrl ? rawImage : null;

  const initial = user?.firstName?.[0] || user?.email?.[0] || "U";
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || "User Profile");

  return (
    <div className="relative space-y-6">
      {saving && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#F5EFEB]/80 backdrop-blur-xs">
          <Loader />
        </div>
      )}

      {/* Status Messages */}
      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-300 text-xs font-bold text-red-800 text-center shadow-xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="px-4 py-3 bg-[#DFE7ED] border border-[#183B56] text-xs font-bold text-[#183B56] text-center flex items-center justify-center gap-2 shadow-xs">
          <Check size={14} strokeWidth={2.6} />
          {successMsg}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={(e) => { e.preventDefault(); onSave(fileInputRef.current); }} className="space-y-6">
        
        {/* Top Member Overview Card */}
        <div className="border border-[#183B56] bg-[#F5EFEB] p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group cursor-pointer shrink-0 w-20 h-20" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile photo"
                className="w-20 h-20 object-cover border border-[#183B56] bg-[#DFE7ED] block"
              />
            ) : (
              <div className="w-20 h-20 bg-[#DFE7ED] text-[#183B56] border border-[#183B56] flex items-center justify-center text-xl font-bold uppercase shadow-xs">
                {initial}
              </div>
            )}
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 bg-[#183B56]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-[#183B56] tracking-tight">{fullName}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white text-[#183B56] border border-[#183B56]">
                <ShieldCheck size={12} />
                <span>Verified Member</span>
              </span>
            </div>
            
            <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs text-[#5A7184] font-medium truncate max-w-[280px]">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 text-[#5A7184] hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer"
                title="Copy email address"
              >
                <Copy size={12} />
              </button>
              {emailCopied && (
                <span className="text-[10px] font-bold text-[#183B56] animate-pulse">
                  Copied!
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183B56] hover:bg-[#183B56]/5 transition-all bg-white border border-[#183B56] px-3.5 py-1.5 shadow-xs cursor-pointer"
              >
                <Upload size={12} />
                <span>Upload Photo</span>
              </button>
              {(profileImage || localPreview) && onRemovePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalPreview(null);
                    onRemovePhoto();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#5A7184] hover:text-red-600 transition-colors px-2 py-1.5 bg-transparent border-none cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 1: Personal Details */}
        <div className="border border-[#183B56] bg-[#F5EFEB] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3.5 border-b border-[#183B56]">
            <User size={15} className="text-[#183B56]" />
            <h4 className="text-xs font-bold text-[#183B56] uppercase tracking-[0.18em]">
              Personal Details
            </h4>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="First Name" icon={User}>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleNameChange}
                placeholder="First name"
                className={`${inputBase} pl-10 pr-4`}
                required
              />
            </FormField>

            <FormField label="Last Name" icon={User}>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleNameChange}
                placeholder="Last name"
                className={`${inputBase} pl-10 pr-4`}
                required
              />
            </FormField>
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="Gender">
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={onFormChange}
                className={`${inputBase} px-3.5 cursor-pointer`}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>

            <FormField label="Date of Birth (Min 12 yrs)" icon={Calendar}>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={onFormChange}
                max={maxAllowedDob}
                min="1920-01-01"
                className={`${inputBase} pl-10 pr-4 cursor-pointer`}
              />
            </FormField>
          </div>
        </div>

        {/* Card 2: Contact & Biography */}
        <div className="border border-[#183B56] bg-[#F5EFEB] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3.5 border-b border-[#183B56]">
            <Sparkles size={15} className="text-[#183B56]" />
            <h4 className="text-xs font-bold text-[#183B56] uppercase tracking-[0.18em]">
              Contact & Style Bio
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="Mobile Number" icon={Phone}>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handlePhoneChange}
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="10-digit mobile number"
                className={`${inputBase} pl-10 pr-4 font-mono`}
              />
            </FormField>

            <FormField label="Email Address">
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className={`${inputBase} px-3.5 bg-[#DFE7ED]/50 text-[#5A7184] cursor-not-allowed border-[#183B56]/50`}
              />
            </FormField>
          </div>

          <FormField label="Personal Biography / Style Notes" icon={FileText}>
            <input
              type="text"
              name="bio"
              value={formData.bio || ""}
              onChange={onFormChange}
              placeholder="Tell us a little bit about yourself or your fashion preferences..."
              className={`${inputBase} pl-10 pr-4`}
            />
          </FormField>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2 flex items-center justify-start">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Check size={14} strokeWidth={2.6} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AccountView;