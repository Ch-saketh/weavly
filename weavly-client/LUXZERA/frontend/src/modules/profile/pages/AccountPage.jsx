"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/store/useAuth";
import AccountSidebar from "@/modules/profile/components/account/AccountSidebar";
import AccountView from "@/modules/profile/components/account/AccountView";
import PasswordView from "@/modules/profile/components/account/PasswordView";
import AddressManagementView from "@/modules/profile/components/account/AddressManagementView";
import FitPreferencesView from "@/modules/profile/components/account/FitPreferencesView";
import RecommendationImagesView from "@/modules/profile/components/account/RecommendationImagesView";
import PaymentMethodsView from "@/modules/profile/components/account/PaymentMethodsView";
import OrdersView from "@/modules/profile/components/account/OrdersView";
import CustomerCareView from "@/modules/profile/components/account/CustomerCareView";
import { getProfileDetails, updateProfile, updateUserDetails, deleteProfileImage } from "@/modules/profile/services/userService";
import Loader from "@/shared/components/ui/Loader";

const AccountPage = ({ currentUser: propUser, authLoading: propAuthLoading, onUserChange: propOnUserChange }) => {
  const router = useRouter();
  const { user: contextUser, loading: contextAuthLoading, setUser: setContextUser } = useAuth();
  
  const currentUser = propUser ?? contextUser;
  const authLoading = propAuthLoading ?? contextAuthLoading;
  const onUserChange = propOnUserChange ?? setContextUser;

  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(currentUser ?? null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({});

  const loadProfileData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const profileData = await getProfileDetails(currentUser.id);
      if (profileData) {
        setProfile(profileData);
        
        const general = profileData.generalProfile || {};
        const loadedPhone = profileData.phoneNumber || general.phoneNumber || "";
        const loadedGender = profileData.gender || general.gender || "";
        const loadedDob = profileData.dateOfBirth || general.dateOfBirth || "";
        const loadedBio = profileData.bio || general.bio || "";
        const loadedFirstName = profileData.firstName || currentUser.firstName || "";
        const loadedLastName = profileData.lastName || currentUser.lastName || "";

        setFormData({
          firstName: loadedFirstName,
          lastName: loadedLastName,
          phoneNumber: loadedPhone,
          gender: loadedGender,
          dateOfBirth: loadedDob,
          bio: loadedBio
        });
        
        // Synchronize core user object with safe fallbacks
        const synchronizedUser = {
          ...currentUser,
          id: profileData.id || currentUser.id,
          firstName: loadedFirstName,
          lastName: loadedLastName,
          profilePicture: profileData.profilePicture || general.profilePicture || currentUser.profilePicture,
          role: profileData.role || currentUser.role,
          profileCompleted: profileData.profileCompleted !== undefined ? profileData.profileCompleted : currentUser.profileCompleted,
          onboardingMessage: profileData.onboardingMessage || currentUser.onboardingMessage,
        };
        setUser(synchronizedUser);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("Weavly_user_cache", JSON.stringify(synchronizedUser));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Profile load sync:", err);
      const fallbackUser = {
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        phoneNumber: currentUser.phoneNumber || "",
        gender: currentUser.gender || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        bio: currentUser.bio || ""
      };
      setProfile(fallbackUser);
      setFormData(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const isNewUser = !user || user.id !== currentUser.id;
      setUser(currentUser);
      if (!profile || isNewUser) {
        loadProfileData();
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  }, [currentUser]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (fileInput) => {
    if (!user?.id) return;
    setErrorMsg("");
    setSuccessMsg("");

    // 1. First Name Validation
    const cleanFirstName = formData.firstName?.trim() || "";
    if (!cleanFirstName || cleanFirstName.length < 2) {
      setErrorMsg("First name must be at least 2 characters long.");
      return;
    }
    if (!/^[a-zA-Z\s'-]{2,50}$/.test(cleanFirstName)) {
      setErrorMsg("First name can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }

    // 2. Last Name Validation
    const cleanLastName = formData.lastName?.trim() || "";
    if (cleanLastName && !/^[a-zA-Z\s'-]{1,50}$/.test(cleanLastName)) {
      setErrorMsg("Last name can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }

    // 3. Mobile Number Validation
    const cleanPhone = formData.phoneNumber?.replace(/\D/g, "") || "";
    if (formData.phoneNumber && cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    // 4. Date of Birth Validation (Minimum 12 years of age)
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const minAgeLimit = new Date();
      minAgeLimit.setFullYear(minAgeLimit.getFullYear() - 12);
      if (isNaN(dob.getTime()) || dob > minAgeLimit) {
        setErrorMsg("You must be at least 12 years old to set your date of birth.");
        return;
      }
    }

    setSaving(true);
    try {
      // 1. Update Core User Details
      await updateUserDetails(user.id, {
        firstName: cleanFirstName,
        lastName: cleanLastName
      });

      // 2. Update Extended Profile Details
      const updatedProfile = await updateProfile(user.id, {
        phoneNumber: cleanPhone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio?.trim() || ""
      }, fileInput);

      // 3. Update local state and trigger navbar re-render
      const nextUser = {
        ...user,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        profilePicture: updatedProfile?.profilePicture || user.profilePicture
      };
      
      setUser(nextUser);
      setProfile(updatedProfile);
      setFormData({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phoneNumber: updatedProfile?.phoneNumber || cleanPhone,
        gender: updatedProfile?.gender || formData.gender,
        dateOfBirth: updatedProfile?.dateOfBirth || formData.dateOfBirth,
        bio: updatedProfile?.bio || formData.bio?.trim() || ""
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("Weavly_user_cache", JSON.stringify(nextUser));
        } catch (e) {}
      }
      onUserChange?.(nextUser);
      setSuccessMsg("Profile details updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.warn("Profile update error:", err?.message || err);
      setErrorMsg(err.message || "Failed to update profile details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.id) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      if (!String(user.id).startsWith("customer_dev_")) {
        await deleteProfileImage(user.id);
      }
      const nextUser = { ...user, profilePicture: null, avatarUrl: null };
      setUser(nextUser);
      setProfile((prev) => prev ? { ...prev, profilePicture: null, profileImage: null } : null);
      onUserChange?.(nextUser);
      setSuccessMsg("Profile picture removed.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to remove profile picture.");
    } finally {
      setSaving(false);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const CreativeLoader = () => (
    <Loader className="py-16" />
  );

  // Tab title mapping for dynamic content header
  const tabMeta = {
    profile: { title: "My Profile", subtitle: "Manage your personal information and preferences" },
    measurements: { title: "Fit & Style Preferences", subtitle: "Fine-tune your measurements and style criteria" },
    fitPreferences: { title: "Fit & Style Preferences", subtitle: "Fine-tune your measurements and style criteria" },
    recommendations: { title: "Style Inspiration", subtitle: "Curate your personal style gallery" },
    recommendationImages: { title: "Style Inspiration", subtitle: "Curate your personal style gallery" },
    orders: { title: "Order History", subtitle: "Track shipments and review past purchases" },
    addresses: { title: "Saved Addresses", subtitle: "Manage your delivery locations" },
    password: { title: "Password & Security", subtitle: "Keep your account secure" },
    payments: { title: "Payment Methods", subtitle: "Manage linked cards and payment options" },
    support: { title: "Customer Care", subtitle: "Get help from our concierge team" },
  };

  const currentTab = tabMeta[activeTab] || tabMeta.profile;

  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center">
        <CreativeLoader />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center px-6 font-sans">
        <div className="max-w-md rounded-2xl border border-[#183B56]/20 bg-[#F5EFEB] p-10 text-center shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5A7184]">Account unavailable</p>
          <h1 className="mt-4 text-[22px] font-bold text-[#183B56] tracking-[-0.02em] leading-tight">Sign in to view your profile</h1>
          <p className="mt-2.5 text-[13px] text-[#5A7184] leading-relaxed">Access your style preferences, order history, and account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] antialiased font-sans animate-acct-fade-in">
      <style>{`
        .animate-acct-fade-in {
          animation: acct-fade-in 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes acct-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-acct-view-in {
          animation: acct-view-in 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes acct-view-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Architectural Header Module */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 pt-8 sm:pt-12">
        <div className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                Account Settings • Atelier Studio
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56] uppercase">
                {currentTab.title}
              </h1>
              <p className="text-xs text-[#5A7184] font-normal pt-0.5">
                {currentTab.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8">
        <div className="grid grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Sticky Sidebar */}
          <div className="col-span-12 md:col-span-3 md:sticky md:top-20 md:self-start z-10">
            <AccountSidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); }} />
          </div>

          {/* Content Panel */}
          <div className="col-span-12 md:col-span-9 min-w-0">
            <div className="animate-acct-view-in" key={activeTab}>
              {/* Conditional view rendering depending on active tab */}
              {activeTab === "profile" && (
                <>
                  {loading ? (
                    <CreativeLoader />
                  ) : (
                    <AccountView 
                      formData={formData}
                      user={user} 
                      profile={profile}
                      onFormChange={handleFormChange}
                      onSave={handleSave}
                      onRemovePhoto={handleRemoveImage}
                      saving={saving}
                      successMsg={successMsg}
                      errorMsg={errorMsg}
                    />
                  )}
                </>
              )}

              {(activeTab === "measurements" || activeTab === "fitPreferences") && (
                <FitPreferencesView 
                  userId={user.id} 
                  onSaveSuccess={() => loadProfileData()}
                />
              )}

              {(activeTab === "recommendations" || activeTab === "recommendationImages") && (
                <RecommendationImagesView userId={user.id} />
              )}

              {activeTab === "password" && (
                <PasswordView userId={user.id} />
              )}

              {activeTab === "addresses" && (
                <AddressManagementView userId={user.id} />
              )}

              {activeTab === "payments" && (
                <PaymentMethodsView userId={user.id} />
              )}

              {activeTab === "orders" && (
                <OrdersView 
                  userId={user.id} 
                  onNavigateToTab={(tab) => setActiveTab(tab)} 
                />
              )}

              {activeTab === "support" && (
                <CustomerCareView userId={user.id} />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountPage;