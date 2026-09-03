import AdminAuditPage from "@/modules/admin/pages/AdminAuditPage";

export const metadata = {
  title: "Audit Logs & Security Operations | Weavly Control Plane",
  description: "Continuous operational surveillance, administrative mutation diffs, threat event detection, and staff activity audit trails.",
};

export default function AuditRoute() {
  return <AdminAuditPage />;
}
