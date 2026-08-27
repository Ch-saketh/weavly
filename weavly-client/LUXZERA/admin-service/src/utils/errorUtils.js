export const formatErrorMessage = (err, fallbackMsg = "An error occurred. Please try again.") => {
  if (!err) return fallbackMsg;
  if (typeof err === "string") return err;
  const status = err.status || err.response?.status;

  if (status === 400) {
    const backendMsg = err.response?.data?.message || err.message || "";
    if (backendMsg.toLowerCase().includes("credential") || backendMsg.toLowerCase().includes("invalid")) {
      return "Invalid email or password. If you haven't been approved as an Executive Admin yet, please click 'Apply for Onboarding'.";
    }
    return backendMsg || "Invalid credentials or pending onboarding application status.";
  }

  if (status === 403) {
    return "Access Denied (403): Invalid or missing Admin Bearer token. Please log in with valid admin credentials.";
  }

  if (status === 401) {
    return "Session Expired (401): Please log in again.";
  }

  if (err.response?.data?.message) return err.response.data.message;
  if (err.data?.message) return err.data.message;
  if (err.message) return err.message;
  return fallbackMsg;
};

export const isTechnicalOrServerError = (err) => {
  if (!err) return false;
  const status = err.response?.status || err.status;
  if (status && status >= 500) return true;
  if (err.message && (err.message.includes("Network") || err.message.includes("JDBC") || err.message.includes("HikariPool"))) {
    return true;
  }
  return false;
};
