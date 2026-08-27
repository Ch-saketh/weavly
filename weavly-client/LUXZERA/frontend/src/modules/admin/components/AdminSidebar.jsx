"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  FileText,
  HelpCircle,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import { useAuth } from "@/modules/auth/store/useAuth";

export default function AdminSidebar({ activeTab = "overview" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/admin/login");
    }
  };

  const navGroups = [
    {
      title: "Overview & Operations",
      items: [
        {
          id: "overview",
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/admin/dashboard",
          active: pathname === "/admin/dashboard" && activeTab === "overview",
        },
        {
          id: "applications",
          label: "Pending Applications",
          icon: ClipboardList,
          href: "/admin/dashboard/requests",
          active: pathname === "/admin/dashboard/requests" || activeTab === "applications",
          badge: "Queue",
        },
        {
          id: "products",
          label: "Product Catalog",
          icon: BarChart3,
          href: "/admin/products",
          active: pathname === "/admin/products",
        },
      ],
    },
    {
      title: "Public Portals",
      items: [
        {
          id: "apply",
          label: "Onboarding Application",
          icon: FileText,
          href: "/admin/apply",
          active: pathname === "/admin/apply",
        },
      ],
    },
  ];

  const footerItems = [
    {
      label: "Support Center",
      icon: HelpCircle,
      href: "/faqs",
    },
    {
      label: "Return to Storefront",
      icon: ArrowLeft,
      href: "/",
    },
  ];

  return (
    <aside className="w-64 bg-white text-[#18181B] flex flex-col justify-between shrink-0 min-h-screen p-4 select-none border-r border-[#E4E4E7] font-sans">
      <div>
        {/* Sidebar Header / Logo */}
        <div className="flex flex-col gap-2 pb-5 border-b border-[#E4E4E7] mb-5 pt-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="border-none bg-transparent p-0 cursor-pointer select-none text-left"
            >
              <WeavlyLogo />
            </button>
            <span className="bg-[#18181B] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 tracking-wider">
              <ShieldCheck size={10} className="text-[#F07020]" />
              Admin
            </span>
          </div>
          <p className="text-[11px] text-[#71717A] font-medium tracking-wide">
            Executive Studio
          </p>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] px-2">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none ${
                        item.active
                          ? "bg-[#18181B] text-white shadow-xs"
                          : "text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={item.active ? "text-[#F07020]" : "text-[#71717A]"} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            item.active
                              ? "bg-white/20 text-white"
                              : "bg-[#F07020]/10 text-[#F07020] border border-[#F07020]/20"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        item.active && <ChevronRight size={13} className="text-white/60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Support & Profile Group */}
      <div className="pt-5 border-t border-[#E4E4E7] space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] px-2 mb-1">
            System & Support
          </div>
          {footerItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B] transition-all border-none bg-transparent cursor-pointer"
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Card */}
        <div className="bg-[#F4F4F5] p-3 rounded-xl flex items-center justify-between gap-2 border border-[#E4E4E7]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-white">
              {user?.firstName ? user.firstName[0].toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#18181B] truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Executive Admin"}
              </div>
              <div className="text-[10px] text-[#71717A] truncate">
                {user?.email || "admin@Weavly.com"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer shrink-0"
            title="Logout Admin"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
