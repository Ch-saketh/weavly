import AdminDesignersPage from "@/modules/admin/pages/AdminDesignersPage";

export const metadata = {
  title: "Designer Governance | Weavly Control Plane",
  description: "Review, approve, manage, suspend, restore, and inspect designers and designer-studio assets.",
};

export default function DesignersRoute() {
  return <AdminDesignersPage />;
}
