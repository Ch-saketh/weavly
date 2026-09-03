import AdminUsersPage from "@/modules/admin/pages/AdminUsersPage";

export const metadata = {
  title: "Customer Governance | Weavly Control Plane",
  description: "Search, inspect account dossiers, monitor fit questionnaires, manage uploaded media, and perform compliance suspensions or safe deactivations.",
};

export default function UsersRoute() {
  return <AdminUsersPage />;
}
