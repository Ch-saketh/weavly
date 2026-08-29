const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8081/api";
  }
  return "https://zera-server.onrender.com/api";
};

const DESIGNER_TOKEN_KEY = "Weavly_designer_token";

export const getDesignerToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DESIGNER_TOKEN_KEY);
};

export const setDesignerToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(DESIGNER_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(DESIGNER_TOKEN_KEY);
  }
};

export const removeDesignerToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DESIGNER_TOKEN_KEY);
  localStorage.removeItem("Weavly_designer_profile");
};

// ── DESIGNER AUTHENTICATION ──────────────────────────────────────────

export const registerDesigner = async (data) => {
  const res = await fetch(`${getBaseUrl()}/designer/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Designer registration failed");
  }
  const result = await res.json();
  if (result.token) {
    setDesignerToken(result.token);
  }
  return result;
};

export const loginDesigner = async (data) => {
  const res = await fetch(`${getBaseUrl()}/designer/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Invalid designer credentials");
  }
  const result = await res.json();
  if (result.token) {
    setDesignerToken(result.token);
  }
  return result;
};

export const getDesignerMe = async () => {
  const token = getDesignerToken();
  if (!token) throw new Error("No designer token found");

  const res = await fetch(`${getBaseUrl()}/designer/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load designer session");
  }
  return res.json();
};

// ── PUBLIC DISCOVERY ──────────────────────────────────────────────────

export const getPublicDesigners = async () => {
  const res = await fetch(`${getBaseUrl()}/designers`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
};

export const getPublicDesignerProfile = async (designerId) => {
  const res = await fetch(`${getBaseUrl()}/designers/${designerId}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Designer profile not found");
  }
  return res.json();
};

export const getPublicDesigns = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.style && params.style !== "all") query.set("style", params.style);
  if (params.audience && params.audience !== "all") query.set("audience", params.audience);
  if (params.page !== undefined) query.set("page", params.page);
  if (params.size !== undefined) query.set("size", params.size);

  const res = await fetch(`${getBaseUrl()}/designs?${query.toString()}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    return { content: [], totalElements: 0, totalPages: 0 };
  }
  return res.json();
};

export const getPublicDesignById = async (designId) => {
  const res = await fetch(`${getBaseUrl()}/designs/${designId}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Design not found");
  }
  return res.json();
};

// ── CUSTOMIZATION REQUESTS ───────────────────────────────────────────

export const submitCustomizationRequest = async (data, customerToken = null) => {
  const headers = { "Content-Type": "application/json" };
  if (customerToken) {
    headers.Authorization = `Bearer ${customerToken}`;
  }

  const res = await fetch(`${getBaseUrl()}/customization-requests`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit customization request");
  }
  return res.json();
};

export const getMySubmittedRequests = async (customerToken, email = null) => {
  const headers = { "Content-Type": "application/json" };
  if (customerToken) {
    headers.Authorization = `Bearer ${customerToken}`;
  }
  let url = `${getBaseUrl()}/customization-requests/my`;
  if (email) {
    url += `?email=${encodeURIComponent(email)}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) return [];
  return res.json();
};

// ── DESIGNER STUDIO MANAGEMENT (PROTECTED) ───────────────────────────

export const getDesignerDashboardStats = async () => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
};

export const updateDesignerProfile = async (profileData) => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
};

export const getMyDesignerDesigns = async () => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/designs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return [];
  return res.json();
};

export const createDesignerDesign = async (designData) => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/designs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(designData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create design");
  }
  return res.json();
};

export const updateDesignerDesign = async (designId, designData) => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/designs/${designId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(designData),
  });
  if (!res.ok) throw new Error("Failed to update design");
  return res.json();
};

export const publishDesignerDesign = async (designId) => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/designs/${designId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to publish design");
  return res.json();
};

export const unpublishDesignerDesign = async (designId) => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/designs/${designId}/unpublish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to unpublish design");
  return res.json();
};

export const deleteDesignerDesign = async (designId) => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/designs/${designId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to delete design");
  return res.json();
};

export const getMyDesignerRequests = async () => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return [];
  return res.json();
};

export const updateDesignerRequestStatus = async (requestId, status, notes = "") => {
  const token = getDesignerToken();
  if (!token) throw new Error("Designer authentication required");

  const res = await fetch(`${getBaseUrl()}/designer/me/requests/${requestId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, designerNotes: notes }),
  });
  if (!res.ok) throw new Error("Failed to update request status");
  return res.json();
};
