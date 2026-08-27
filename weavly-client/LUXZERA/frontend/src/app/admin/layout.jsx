export const metadata = {
  title: "Weavly Executive Admin Portal",
  description: "Super Admin Curation Studio & Governance Control",
};

export default function AdminLayout({ children }) {
  return <div className="admin-root bg-[#FAFAF9] min-h-screen">{children}</div>;
}
