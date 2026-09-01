import { usersClient } from "@/infrastructure/api/gateway/apiGateway";
import { getToken } from "@/shared/utils/token";
import { config } from "@/infrastructure/api/gateway/config";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === "string" && UUID_REGEX.test(val);

export const getProfileDetails = async (userId) => {
  try {
    const response = await usersClient.get(`/profile/me`);
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      try {
        const fallbackRes = await usersClient.get(`/profile/${userId}`);
        if (fallbackRes.data) return fallbackRes.data;
      } catch (innerErr) {
        // Fallback to /users/me
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

export const updateProfile = async (arg1, arg2, arg3) => {
  const token = getToken();

  let userId = null;
  let profileData = {};
  let fileOrInput = null;

  if (arg1 instanceof FormData) {
    const endpoint = `${config.usersApiUrl}/profile/me`;
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: arg1
      });
      return await response.json().catch(() => ({}));
    } catch (err) {
      console.warn("Direct FormData update notice:", err);
      return {};
    }
  }

  if (arg1 instanceof File || (arg1 && arg1.name && !arg2 && !arg3)) {
    fileOrInput = arg1;
  } else if (typeof arg1 === "string" && (isUuid(arg1) || arg1.length > 10)) {
    userId = arg1;
    profileData = arg2 || {};
    fileOrInput = arg3;
  } else {
    profileData = arg1 || {};
    fileOrInput = arg2;
  }

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
  if (profileData.phoneNumber && String(profileData.phoneNumber).trim() !== "") {
    formData.append("phoneNumber", String(profileData.phoneNumber).trim());
  }
  if (profileData.gender && String(profileData.gender).trim() !== "") {
    formData.append("gender", String(profileData.gender).trim());
  }
  if (profileData.dateOfBirth && String(profileData.dateOfBirth).trim() !== "") {
    formData.append("dateOfBirth", String(profileData.dateOfBirth).trim());
  }
  if (profileData.bio && String(profileData.bio).trim() !== "") {
    formData.append("bio", String(profileData.bio).trim());
  }

  // 2. Append the actual raw binary image file if provided (File object or DOM input element)
  if (fileOrInput instanceof File) {
    formData.append("image", fileOrInput);
  } else if (fileOrInput && fileOrInput.files && fileOrInput.files[0]) {
    formData.append("image", fileOrInput.files[0]);
  }

  const endpoint = `${config.usersApiUrl}/profile/me`;
  
  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (isUuid(userId) && response.status !== 403) {
        const fallbackRes = await fetch(`${config.usersApiUrl}/profile/${userId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        const fallbackData = await fallbackRes.json().catch(() => ({}));
        if (fallbackRes.ok) return fallbackData;
      }
      throw new Error(data.message || data.error || "Failed to update profile");
    }
    return data;
  } catch (err) {
    if (isUuid(userId) && err?.message !== "Failed to update profile") {
      try {
        const fallbackRes = await fetch(`${config.usersApiUrl}/profile/${userId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        const fallbackData = await fallbackRes.json().catch(() => ({}));
        if (fallbackRes.ok) return fallbackData;
      } catch (innerErr) {
        // Safe fallback
      }
    }
    throw err;
  }
};

export const deleteProfileImage = async (userId) => {
  try {
    const response = await usersClient.delete(`/profile/me/image`);
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      try {
        const response = await usersClient.delete(`/profile/${userId}/image`);
        return response.data;
      } catch (innerErr) {
        // Safe fallback
      }
    }
    console.warn("Delete profile image notice:", err?.message || err);
    return null;
  }
};

export const getMeasurements = async (userId) => {
  try {
    const response = await usersClient.get(`/measurements/me`);
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      try {
        const response = await usersClient.get(`/measurements/${userId}`);
        return response.data;
      } catch (innerErr) {
        // Safe fallback
      }
    }
    console.warn("Measurements fetch notice:", err?.message || err);
    return null;
  }
};

export const saveMeasurements = async (userId, measurements) => {
  try {
    const response = await usersClient.put(`/measurements/me`, {
      topSize: measurements.topSize,
      bottomSize: measurements.bottomSize,
      shoeSize: measurements.shoeSize,
      fitPreference: measurements.fitPreference,
    });
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      const response = await usersClient.put(`/measurements/${userId}`, {
        topSize: measurements.topSize,
        bottomSize: measurements.bottomSize,
        shoeSize: measurements.shoeSize,
        fitPreference: measurements.fitPreference,
      });
      return response.data;
    }
    throw err;
  }
};

export const getAddresses = async (userId) => {
  if (!userId || String(userId).startsWith("customer_dev_")) return [];
  try {
    const response = await usersClient.get(`/addresses/me`);
    return response.data || [];
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      try {
        const fallback = await usersClient.get(`/addresses/${userId}`);
        return fallback.data || [];
      } catch (innerErr) {
        // Safe fallback
      }
    }
    return [];
  }
};

export const createAddress = async (userId, address) => {
  try {
    const response = await usersClient.post(`/addresses/me`, address);
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      const response = await usersClient.post(`/addresses/${userId}`, address);
      return response.data;
    }
    throw err;
  }
};

export const updateAddress = async (userId, address) => {
  const addressId = address.id || address.addressId;
  try {
    const response = await usersClient.put(`/addresses/me/${addressId}`, address);
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      const response = await usersClient.put(`/addresses/${userId}/${addressId}`, address);
      return response.data;
    }
    throw err;
  }
};

export const deleteAddress = async (userId, addressId) => {
  try {
    const response = await usersClient.delete(`/addresses/me/${addressId}`);
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      const response = await usersClient.delete(`/addresses/${userId}/${addressId}`);
      return response.data;
    }
    throw err;
  }
};

export const setDefaultAddress = async (userId, addressId) => {
  try {
    const response = await usersClient.patch(`/addresses/me/${addressId}/default`);
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      const response = await usersClient.patch(`/addresses/${userId}/${addressId}/default`);
      return response.data;
    }
    throw err;
  }
};

export const updateUserDetails = async (userId, userDetails) => {
  if (!userId || String(userId).startsWith("customer_dev_")) return userDetails;
  try {
    const response = await usersClient.put(`/users/me`, {
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
    });
    return response.data;
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      try {
        const response = await usersClient.put(`/users/${userId}`, {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
        });
        return response.data;
      } catch (innerErr) {
        // Safe fallback
      }
    }
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
