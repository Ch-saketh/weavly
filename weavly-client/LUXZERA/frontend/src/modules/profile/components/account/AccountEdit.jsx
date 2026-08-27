import React from 'react';

const AccountEdit = ({ formData, user, onFormChange, onCancel, onSave }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        
        {/* First Name */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={onFormChange}
            className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none transition"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={onFormChange}
            className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none transition"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber || ""}
            onChange={onFormChange}
            placeholder="+1 234 567 8900"
            className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none transition"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={onFormChange}
            className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none transition cursor-pointer"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            onChange={onFormChange}
            className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none transition cursor-pointer"
          />
        </div>

        {/* Email (Static) */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed select-none">
            {user?.email}
          </div>
        </div>

        {/* Bio */}
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Biography / Story
          </label>
          <textarea
            name="bio"
            rows="3"
            value={formData.bio || ""}
            onChange={onFormChange}
            placeholder="Tell us about yourself..."
            className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none transition resize-none leading-relaxed"
          ></textarea>
        </div>

      </div>

      {/* Footer System Actions */}
      <div className="flex justify-end gap-3 mt-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-[#2D3436] text-xs font-semibold hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#FF8C33] hover:bg-[#e67e2e] text-white text-xs font-bold transition shadow-md shadow-orange-500/10"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default AccountEdit;