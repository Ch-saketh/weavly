import AdminUserDetailPage from "@/modules/admin/pages/AdminUserDetailPage";

export const metadata = {
  title: "Customer Dossier | Weavly Control Plane",
  description: "Inspect customer identity, commerce footprint, 15-point fit dossier, and manage uploaded media assets.",
};

export default function UserDetailRoute() {
  return <AdminUserDetailPage />;
}
