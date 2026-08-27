import React from 'react';

const ProfileHeader = ({ user, isEditing, onEditToggle, onUploadClick }) => {
  const profileImage = user?.profilePicture || user?.avatarUrl || null;
  const initial = user?.firstName?.[0] || user?.email?.[0] || "U";

  return (
    <div className="flex items-center justify-between pb-8 border-b border-slate-100 mb-8">
      <div className="flex items-center gap-5">
        <div className="relative group">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover shadow-sm bg-slate-50 border border-slate-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1B2631] text-[#FAF9F7] border-2 border-[#FF8C33]/20 flex items-center justify-center text-2xl font-bold shadow-md shadow-slate-900/10 uppercase">
              {initial}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-[#2D3436] tracking-tight">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Unnamed User"}
            </h2>
            {user?.role && (
              <span className="text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF8C33] border border-orange-100">
                {user.role}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            System Account: <span className="text-slate-500 font-bold">{user?.role?.toLowerCase() || "customer"}</span>
          </p>
        </div>
      </div>

      {isEditing ? (
        <button 
          onClick={onUploadClick}
          type="button"
          className="text-xs font-bold text-[#FF8C33] hover:text-[#e67e2e] transition"
        >
          Change Photo
        </button>
      ) : (
        <button 
          onClick={onEditToggle}
          type="button"
          className="px-4.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#2D3436] hover:bg-slate-50 transition"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;