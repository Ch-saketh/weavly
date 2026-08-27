import React, { useRef, useState } from "react";
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

  // Reusable premium input field wrapper with icon support
  const FormField = ({ label, icon: Icon, children, className = "" }) => (
    <div className={className}>
      <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 mb-2 font-satoshi">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon size={17} strokeWidth={1.8} />
          </div>
        )}
        {children}
      </div>
    </div>
  );

  const inputBase = "w-full h-[48px] rounded-xl border border-slate-200 bg-white text-[14px] font-bold text-slate-950 placeholder-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-[#C8702A] focus:ring-2 focus:ring-[#C8702A]/15 shadow-xs font-satoshi";

  return (
    <div className="relative font-satoshi space-y-6">
      {saving && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-[1px] rounded-2xl">
          <Loader />
        </div>
      )}

      {/* Status Messages */}
      {errorMsg && (
        <div className="px-5 py-3.5 bg-red-50/90 border border-red-200 rounded-xl text-[13px] font-bold text-red-700 text-center shadow-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="px-5 py-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-[13px] font-extrabold text-emerald-800 text-center flex items-center justify-center gap-2 shadow-sm">
          <Check size={16} strokeWidth={3} />
          {successMsg}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={(e) => { e.preventDefault(); onSave(fileInputRef.current); }} className="space-y-6">
        
        {/* Top Member Overview Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-gradient-to-r from-white via-[#FAF8F5] to-[#F5EDE4]/40 border border-slate-200/90 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
          <div className="relative group cursor-pointer shrink-0 w-20 h-20 sm:w-24 sm:h-24" onClick={() => fileInputRef.current?.click()}>
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-200 block"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 text-white border-2 border-white flex items-center justify-center text-2xl font-black uppercase shadow-md ring-2 ring-slate-200">
                {initial}
              </div>
            )}
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
              <Camera size={22} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h3 className="text-lg font-black text-slate-950 tracking-tight font-satoshi">{fullName}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-[#F5EDE4] text-[#C8702A] border border-[#E8DFD4]">
                <ShieldCheck size={12} strokeWidth={2.5} />
                <span>Verified Member</span>
              </span>
            </div>
            
            <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[13.5px] text-slate-600 font-semibold truncate max-w-[300px]">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 text-slate-400 hover:text-[#C8702A] transition-colors"
                title="Copy email address"
              >
                <Copy size={14} />
              </button>
              {emailCopied && (
                <span className="text-[11px] font-extrabold text-[#C8702A] animate-pulse">
                  Copied!
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 hover:text-[#C8702A] transition-all duration-200 border border-slate-300 hover:border-[#C8702A] bg-white hover:bg-slate-50 rounded-xl px-4 py-2 shadow-xs"
              >
                <Upload size={14} strokeWidth={2.2} />
                <span>Upload Photo</span>
              </button>
              {(profileImage || localPreview) && onRemovePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalPreview(null);
                    onRemovePhoto();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors duration-200 px-2.5 py-2"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 1: Personal Details */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800">
              <User size={16} strokeWidth={2.2} />
            </div>
            <h4 className="text-[14px] font-extrabold text-slate-950 uppercase tracking-wider font-satoshi">
              Personal Details
            </h4>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="First Name" icon={User}>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={onFormChange}
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
                onChange={onFormChange}
                placeholder="Last name"
                className={`${inputBase} pl-10 pr-4`}
                required
              />
            </FormField>
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Gender">
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={onFormChange}
                className={`${inputBase} px-4 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231E293B%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:14px] bg-[right_16px_center] bg-no-repeat pr-10`}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>

            <FormField label="Date of Birth" icon={Calendar}>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={onFormChange}
                className={`${inputBase} pl-10 pr-4 cursor-pointer`}
              />
            </FormField>
          </div>
        </div>

        {/* Card 2: Contact & Biography */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800">
              <Sparkles size={16} strokeWidth={2.2} />
            </div>
            <h4 className="text-[14px] font-extrabold text-slate-950 uppercase tracking-wider font-satoshi">
              Contact & Style Bio
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Mobile Number" icon={Phone}>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handlePhoneChange}
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="10-digit mobile number"
                className={`${inputBase} pl-10 pr-4 font-mono text-xs`}
              />
            </FormField>

            <FormField label="Email Address">
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className={`${inputBase} px-4 bg-slate-100/70 text-slate-500 cursor-not-allowed border-slate-200`}
              />
            </FormField>
          </div>

          <FormField label="Personal Biography / Style Notes" icon={FileText}>
            <input
              type="text"
              name="bio"
              value={formData.bio || ""}
              onChange={onFormChange}
              placeholder="Tell us a little bit about yourself or your fashion style..."
              className={`${inputBase} pl-10 pr-4`}
            />
          </FormField>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2 flex items-center justify-start">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-black text-white text-[12.5px] font-black uppercase tracking-widest shadow-md transition-all duration-200 active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
          >
            {saving ? (
              <span>Saving Details...</span>
            ) : (
              <>
                <Check size={16} strokeWidth={3} />
                <span>Save Profile Details</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AccountView;