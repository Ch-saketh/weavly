/**
 * Product-grade error message formatter.
 * Technical details, network errors, SMTP logs, and backend exceptions are logged strictly to console.error.
 * User-facing UI messages are kept friendly, polished, and free of developer/infrastructure jargon.
 */
export function formatErrorMessage(err, fallback = "Our servers are busy right now. Please try a few minutes later.") {
  if (!err) return fallback;

  const logDetails = typeof err === "string"
    ? err
    : err?.response?.data || err?.message || (err && Object.keys(err).length > 0 ? err : String(err));
  console.error("🔴 [Technical Error Details]:", logDetails);

  const rawMessage = typeof err === "string"
    ? err
    : err.response?.data?.message || err.response?.data?.error || err.data?.message || err.data?.error || err.message || err.error || "";

  // Filter out technical network/SMTP/server failure strings from user-facing UI
  const technicalKeywords = [
    "network error",
    "err_",
    "axioserror",
    "failed to fetch",
    "500",
    "502",
    "503",
    "504",
    "service unavailable",
    "bad gateway",
    "gateway timeout",
    "internal server error",
    "econnrefused",
    "http 5",
    "smtp",
    "mail",
    "failed to send",
    "messagingexception",
    "smtpexception",
    "java.",
    "org.springframework",
    "nullpointer",
    "sql",
    "database",
    "exception",
    "connection refused",
    "socket",
    "timeout"
  ];

  const lowerRaw = String(rawMessage).toLowerCase();
  const isTechnicalError = !rawMessage || technicalKeywords.some(kw => lowerRaw.includes(kw));

  if (isTechnicalError) {
    return fallback;
  }

  return rawMessage;
}

export function isTechnicalOrServerError(err) {
  if (!err) return false;
  const rawMessage = typeof err === "string"
    ? err
    : err.response?.data?.message || err.response?.data?.error || err.data?.message || err.data?.error || err.message || err.error || "";
  const lowerRaw = String(rawMessage).toLowerCase();
  const technicalKeywords = [
    "network error", "err_", "axioserror", "failed to fetch", "500", "502", "503", "504",
    "service unavailable", "bad gateway", "gateway timeout", "internal server error", "econnrefused",
    "connection refused", "socket", "timeout"
  ];
  return !rawMessage || technicalKeywords.some(kw => lowerRaw.includes(kw));
}
