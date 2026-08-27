import React, { useRef, useState, useMemo } from "react";
import { Camera, Check, User, Phone, Calendar, FileText, Copy, Upload, Trash2, ShieldCheck, Sparkles } from "lucide-react";
import Loader from "@/shared/components/ui/Loader";

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

  // Maximum allowed date of birth (must be at least 12 years old)
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
    // Allow only alphabets, spaces, hyphens, and apostrophes
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

  // Robust profile image check to prevent broken img tags
  const rawImage = localPreview || profile?.profilePicture || user?.profilePicture || user?.avatarUrl || null;
  const isValidUrl = typeof rawImage === "string" && (rawImage.startsWith("http://") || rawImage.startsWith("https://") || rawImage.startsWith("data:") || rawImage.startsWith("/"));
  const profileImage = isValidUrl ? rawImage : null;

  const initial = user?.firstName?.[0] || user?.email?.[0] || "U";
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || "User Profile");

  // Reusable minimal form field wrapper with proper icon positioning and clearance
  const FormField = ({ label, icon: Icon, children, className = "" }) => (
    <div className={className}>
      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5 font-sans">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-neutral-500 pointer-events-none flex items-center justify-center z-10">
            <Icon size={16} strokeWidth={2.4} />
          </div>
        )}
        {children}
      </div>
    </div>
  );

  const inputBase = "w-full h-11 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 text-[13.5px] font-medium text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150 shadow-2xs";

  return (
    <div className="relative space-y-5">
      {saving && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-[1px] rounded-2xl">
          <Loader />
        </div>
      )}

      {/* Status Messages */}
      {errorMsg && (
        <div className="px-4 py-3 bg-red-50/80 border border-red-200/80 rounded-xl text-[12.5px] font-semibold text-red-700 text-center shadow-2xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="px-4 py-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[12.5px] font-semibold text-emerald-800 text-center flex items-center justify-center gap-2 shadow-2xs">
          <Check size={16} strokeWidth={2.6} />
          {successMsg}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={(e) => { e.preventDefault(); onSave(fileInputRef.current); }} className="space-y-5">
        
        {/* Top Member Overview Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
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
                className="w-20 h-20 rounded-full object-cover border border-neutral-200/80 shadow-2xs block"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-neutral-900 text-white border border-neutral-200 flex items-center justify-center text-xl font-bold uppercase shadow-2xs">
                {initial}
              </div>
            )}
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-neutral-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
              <Camera size={18} strokeWidth={2.4} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight">{fullName}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                <ShieldCheck size={13} strokeWidth={2.4} />
                <span>Verified Member</span>
              </span>
            </div>
            
            <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[13px] text-neutral-500 font-normal truncate max-w-[280px]">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                title="Copy email address"
              >
                <Copy size={13} strokeWidth={2.2} />
              </button>
              {emailCopied && (
                <span className="text-[11px] font-semibold text-emerald-600 animate-pulse">
                  Copied!
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-3.5">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100/80 transition-all bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shadow-2xs"
              >
                <Upload size={13} strokeWidth={2.4} />
                <span>Upload Photo</span>
              </button>
              {(profileImage || localPreview) && onRemovePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalPreview(null);
                    onRemovePhoto();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-red-600 transition-colors px-2 py-1.5"
                >
                  <Trash2 size={13} strokeWidth={2.2} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 1: Personal Details */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center gap-2 pb-3.5 border-b border-neutral-100">
            <User size={16} strokeWidth={2.4} className="text-neutral-600" />
            <h4 className="text-[13px] font-bold text-neutral-900 tracking-tight">
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
                className={`${inputBase} pl-11 pr-4`}
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
                className={`${inputBase} pl-11 pr-4`}
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
                className={`${inputBase} px-3.5 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2318181B%22%20stroke-width%3D%222.4%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:14px] bg-[right_14px_center] bg-no-repeat pr-9`}
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
                className={`${inputBase} pl-11 pr-4 cursor-pointer`}
              />
            </FormField>
          </div>
        </div>

        {/* Card 2: Contact & Biography */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center gap-2 pb-3.5 border-b border-neutral-100">
            <Sparkles size={16} strokeWidth={2.4} className="text-neutral-600" />
            <h4 className="text-[13px] font-bold text-neutral-900 tracking-tight">
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
                className={`${inputBase} pl-11 pr-4 text-xs font-mono tracking-wide`}
              />
            </FormField>

            <FormField label="Email Address">
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className={`${inputBase} px-3.5 bg-neutral-100/60 text-neutral-500 cursor-not-allowed border-neutral-200`}
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
              className={`${inputBase} pl-11 pr-4`}
            />
          </FormField>
        </div>

        {/* Save Changes Button */}
        <div className="pt-1 flex items-center justify-start">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Check size={15} strokeWidth={2.6} />
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