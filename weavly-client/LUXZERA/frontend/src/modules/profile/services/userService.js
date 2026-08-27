import { usersClient } from "@/infrastructure/api/gateway/apiGateway";
import { getToken } from "@/shared/utils/token";
import { config } from "@/infrastructure/api/gateway/config";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === "string" && UUID_REGEX.test(val);

export const getProfileDetails = async (userId) => {
  if (isUuid(userId)) {
    try {
      const response = await usersClient.get(`/profile/${userId}`);
      return response.data;
    } catch (err) {
      if (err?.status !== 404 && err?.response?.status !== 404) {
        console.warn("Profile details fetch notice:", err?.message || err);
      }
    }
  }
  try {
    const response = await usersClient.get(`/users/me`);
    return response.data;
  } catch (err) {
    console.warn("Users/me fetch notice:", err?.message || err);
    return null;
  }
};

export const updateProfile = async (userId, profileData, fileOrInput) => {
  const token = getToken();

  // If user has a mock development token, simulate successful local update
  if (!token || token.startsWith("dev_")) {
    return {
      phoneNumber: profileData.phoneNumber || "",
      gender: profileData.gender || "",
      dateOfBirth: profileData.dateOfBirth || "",
      bio: profileData.bio || "",
      profilePicture: fileOrInput instanceof File ? URL.createObjectURL(fileOrInput) : null
    };
  }

  const formData = new FormData();

  // 1. Append text fields only when non-empty to respect backend validation
  if (profileData.phoneNumber && profileData.phoneNumber.trim() !== "") {
    formData.append("phoneNumber", profileData.phoneNumber.trim());
  }
  if (profileData.gender && profileData.gender.trim() !== "") {
    formData.append("gender", profileData.gender.trim());
  }
  if (profileData.dateOfBirth && profileData.dateOfBirth.trim() !== "") {
    formData.append("dateOfBirth", profileData.dateOfBirth.trim());
  }
  if (profileData.bio && profileData.bio.trim() !== "") {
    formData.append("bio", profileData.bio.trim());
  }

  // 2. Append the actual raw binary image file if provided (File object or DOM input element)
  if (fileOrInput instanceof File) {
    formData.append("image", fileOrInput);
  } else if (fileOrInput && fileOrInput.files && fileOrInput.files[0]) {
    formData.append("image", fileOrInput.files[0]);
  }

  const endpoint = isUuid(userId)
    ? `${config.usersApiUrl}/profile/${userId}`
    : `${config.usersApiUrl}/profile/me`;
  
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to update profile");
  }
  return data;
};

export const deleteProfileImage = async (userId) => {
  const endpoint = isUuid(userId) ? `/profile/${userId}/image` : `/profile/me/image`;
  try {
    const response = await usersClient.delete(endpoint);
    return response.data;
  } catch (err) {
    console.warn("Delete profile image notice:", err?.message || err);
    return null;
  }
};

export const getMeasurements = async (userId) => {
  try {
    const endpoint = isUuid(userId) ? `/measurements/${userId}` : `/measurements/me`;
    const response = await usersClient.get(endpoint);
    return response.data;
  } catch (err) {
    console.warn("Measurements fetch notice:", err?.message || err);
    return null;
  }
};

export const saveMeasurements = async (userId, measurements) => {
  const endpoint = isUuid(userId) ? `/measurements/${userId}` : `/measurements/me`;
  const response = await usersClient.put(endpoint, {
    topSize: measurements.topSize,
    bottomSize: measurements.bottomSize,
    shoeSize: measurements.shoeSize,
    fitPreference: measurements.fitPreference,
  });
  return response.data;
};

export const getAddresses = async (userId) => {
  if (!userId || String(userId).startsWith("customer_dev_")) return [];
  try {
    const endpoint = isUuid(userId) ? `/addresses/${userId}` : `/addresses/me`;
    const response = await usersClient.get(endpoint);
    return response.data || [];
  } catch (err) {
    console.warn("Addresses fetch fallback:", err?.message || err);
    return [];
  }
};

export const createAddress = async (userId, address) => {
  const endpoint = isUuid(userId) ? `/addresses/${userId}` : `/addresses/me`;
  const response = await usersClient.post(endpoint, address);
  return response.data;
};

export const updateAddress = async (userId, address) => {
  const addressId = address.id || address.addressId;
  const endpoint = isUuid(userId) ? `/addresses/${userId}/${addressId}` : `/addresses/${addressId}`;
  const response = await usersClient.put(endpoint, address);
  return response.data;
};

export const deleteAddress = async (userId, addressId) => {
  const endpoint = isUuid(userId) ? `/addresses/${userId}/${addressId}` : `/addresses/${addressId}`;
  const response = await usersClient.delete(endpoint);
  return response.data;
};

export const setDefaultAddress = async (userId, addressId) => {
  const endpoint = isUuid(userId) ? `/addresses/${userId}/${addressId}/default` : `/addresses/${addressId}/default`;
  const response = await usersClient.patch(endpoint);
  return response.data;
};

export const updateUserDetails = async (userId, userDetails) => {
  if (!userId || String(userId).startsWith("customer_dev_")) return userDetails;
  const endpoint = isUuid(userId) ? `/users/${userId}` : `/users/me`;
  try {
    const response = await usersClient.put(endpoint, {
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
    });
    return response.data;
  } catch (err) {
    console.warn("User details update notice:", err?.message);
    return userDetails;
  }
};

export const changePassword = async (userId, passwordData) => {
  const endpoint = isUuid(userId) ? `/users/${userId}/change-password` : `/users/change-password`;
  try {
    const response = await usersClient.put(endpoint, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to change password. Please verify current password.");
  }
};

export const deleteAccount = async (userId) => {
  const endpoint = isUuid(userId) ? `/users/${userId}` : `/users/me`;
  const response = await usersClient.delete(endpoint);
  return response.data;
};

export const getWishlist = async (userId) => {
  try {
    const endpoint = isUuid(userId) ? `/wishlist/${userId}` : `/wishlist/me`;
    const response = await usersClient.get(endpoint);
    return response.data;
  } catch (err) {
    const stored = localStorage.getItem(`Weavly-wishlist-${userId}`);
    return stored ? JSON.parse(stored) : [];
  }
};

export const toggleWishlist = async (userId, product) => {
  try {
    const prodId = product.id || product.productId;
    const endpoint = isUuid(userId) ? `/wishlist/${userId}/${prodId}` : `/wishlist/${prodId}`;
    await usersClient.post(endpoint);
    return getWishlist(userId);
  } catch (err) {
    const stored = localStorage.getItem(`Weavly-wishlist-${userId}`);
    let list = stored ? JSON.parse(stored) : [];
    const prodId = product.id || product.productId;
    if (list.some(p => p.productId === prodId)) {
      list = list.filter(p => p.productId !== prodId);
    } else {
      list.push({
        productId: prodId,
        productName: product.name || product.productName,
        imageUrl: product.image || product.imageUrl,
        price: product.price,
        salePrice: product.salePrice || null
      });
    }
    localStorage.setItem(`Weavly-wishlist-${userId}`, JSON.stringify(list));
    return list;
  }
};
