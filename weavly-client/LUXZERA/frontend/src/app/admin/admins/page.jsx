import AdminManagementPage from "@/modules/admin/pages/AdminManagementPage";

export const metadata = {
  title: "Administrators & Access Governance | Weavly Control Plane",
  description: "Enterprise Role-Based Access Control, Administrator Registry, and Granular Permission Management.",
};

export default function AdminsRoute() {
  return <AdminManagementPage />;
}
