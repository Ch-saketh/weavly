const DESIGNER_TOKEN_KEY = "Weavly_designer_token";
const DESIGNER_PROFILE_KEY = "Weavly_designer_profile";

const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "https://zera-server.onrender.com/api";
};

async function apiRequest(path, options = {}) {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // If path starts with /api and baseUrl already has /api, don't duplicate
  let url = `${baseUrl}${cleanPath}`;
  if (baseUrl.endsWith("/api") && cleanPath.startsWith("/api/")) {
    url = `${baseUrl}${cleanPath.substring(4)}`;
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      // fallback to status text
    }
    throw new Error(errorMsg);
  }

  // If 204 or empty response
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export function getDesignerToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DESIGNER_TOKEN_KEY);
}

export function setDesignerToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DESIGNER_TOKEN_KEY, token);
}

export function removeDesignerToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DESIGNER_TOKEN_KEY);
  localStorage.removeItem(DESIGNER_PROFILE_KEY);
}

// ── DESIGNER AUTHENTICATION ───────────────────────────────────────────

export async function registerDesigner(data) {
  const res = await apiRequest("/api/designer/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.token) {
    setDesignerToken(res.token);
    if (typeof window !== "undefined") {
      localStorage.setItem(DESIGNER_PROFILE_KEY, JSON.stringify(res));
    }
  }
  return res;
}

export async function loginDesigner(credentials) {
  const res = await apiRequest("/api/designer/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (res.token) {
    setDesignerToken(res.token);
    if (typeof window !== "undefined") {
      localStorage.setItem(DESIGNER_PROFILE_KEY, JSON.stringify(res));
    }
  }
  return res;
}

export async function getDesignerMe() {
  const token = getDesignerToken();
  if (!token) return null;
  return apiRequest("/api/designer/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── PUBLIC DISCOVERY ──────────────────────────────────────────────────

export async function getPublicDesigners() {
  return apiRequest("/api/designers");
}

export async function getPublicDesignerProfile(designerId) {
  return apiRequest(`/api/designers/${encodeURIComponent(designerId)}`);
}

export async function recordProfileView(designerId) {
  try {
    return await apiRequest(`/api/designers/${encodeURIComponent(designerId)}/view`, {
      method: "POST",
    });
  } catch {
    return null;
  }
}

export async function getPublicDesigns({ category, style, audience, page = 0, size = 24 } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (style && style !== "all") params.set("style", style);
  if (audience && audience !== "all") params.set("audience", audience);
  params.set("page", page);
  params.set("size", size);

  return apiRequest(`/api/designs?${params.toString()}`);
}

export async function getPublicDesignById(designId) {
  return apiRequest(`/api/designs/${encodeURIComponent(designId)}`);
}

export async function recordDesignView(designId) {
  try {
    return await apiRequest(`/api/designs/${encodeURIComponent(designId)}/view`, {
      method: "POST",
    });
  } catch {
    return null;
  }
}

export async function recordDesignLike(designId) {
  return apiRequest(`/api/designs/${encodeURIComponent(designId)}/like`, {
    method: "POST",
  });
}

// ── CUSTOMIZATION REQUESTS ────────────────────────────────────────────

export async function submitCustomizationRequest(data) {
  return apiRequest("/api/customization-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMySubmittedRequests() {
  return apiRequest("/api/customization-requests/my");
}

// ── PRIVATE DESIGNER STUDIO MANAGEMENT ────────────────────────────────

export async function getDesignerDashboardStats() {
  const token = getDesignerToken();
  return apiRequest("/api/designer/me/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDesignerAnalytics() {
  const token = getDesignerToken();
  return apiRequest("/api/designer/me/analytics", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDesignerPrivateProfile() {
  const token = getDesignerToken();
  return apiRequest("/api/designer/me/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateDesignerProfile(data) {
  const token = getDesignerToken();
  return apiRequest("/api/designer/me/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function getMyDesignerDesigns() {
  const token = getDesignerToken();
  return apiRequest("/api/designer/me/designs", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createDesignerDesign(data) {
  const token = getDesignerToken();
  return apiRequest("/api/designer/me/designs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function updateDesignerDesign(designId, data) {
  const token = getDesignerToken();
  return apiRequest(`/api/designer/me/designs/${encodeURIComponent(designId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function publishDesignerDesign(designId) {
  const token = getDesignerToken();
  return apiRequest(`/api/designer/me/designs/${encodeURIComponent(designId)}/publish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function unpublishDesignerDesign(designId) {
  const token = getDesignerToken();
  return apiRequest(`/api/designer/me/designs/${encodeURIComponent(designId)}/unpublish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteDesignerDesign(designId) {
  const token = getDesignerToken();
  return apiRequest(`/api/designer/me/designs/${encodeURIComponent(designId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyDesignerRequests() {
  const token = getDesignerToken();
  return apiRequest("/api/designer/me/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateDesignerRequestStatus(requestId, status, designerNotes) {
  const token = getDesignerToken();
  return apiRequest(`/api/designer/me/requests/${encodeURIComponent(requestId)}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, designerNotes }),
  });
}
