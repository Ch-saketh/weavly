import AdminDesignerDetailPage from "@/modules/admin/pages/AdminDesignerDetailPage";

export const metadata = {
  title: "Designer Dossier & Studio Administration | Weavly Control Plane",
  description: "Inspect designer identity, atelier profile, catalog, uploaded media assets, and governance actions.",
};

export default function DesignerDetailRoute() {
  return <AdminDesignerDetailPage />;
}
