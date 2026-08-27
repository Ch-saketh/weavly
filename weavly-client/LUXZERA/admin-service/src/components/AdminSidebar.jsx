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
import LuxZeraLogo from "@/components/LuxZeraLogo";
import { removeToken } from "@/utils/token";

export default function AdminSidebar({ activeTab = "overview" }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const navGroups = [
    {
      title: "Operations",
      items: [
        {
          id: "overview",
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active: pathname === "/dashboard" && activeTab === "overview",
        },
        {
          id: "applications",
          label: "Pending Applications",
          icon: ClipboardList,
          href: "/dashboard?tab=applications",
          active: pathname === "/dashboard" && activeTab === "applications",
          badge: "Queue",
        },
        {
          id: "products",
          label: "Product Catalog",
          icon: BarChart3,
          href: "/products",
          active: pathname === "/products",
        },
      ],
    },
    {
      title: "Candidate Portal",
      items: [
        {
          id: "apply",
          label: "Apply for Onboarding",
          icon: FileText,
          href: "/apply",
          active: pathname === "/apply",
        },
      ],
    },
  ];

  const footerItems = [
    {
      label: "Support Center",
      icon: HelpCircle,
      href: "/login",
    },
    {
      label: "Storefront",
      icon: ArrowLeft,
      href: "http://localhost:3000",
    },
  ];

  return (
    <aside className="w-64 bg-white text-[#18181B] flex flex-col justify-between shrink-0 min-h-screen p-6 border-r border-[#ECECEC] select-none font-sans">
      <div className="space-y-8">
        {/* Header / Logo */}
        <div className="flex flex-col gap-3 pb-6 border-b border-[#ECECEC]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="border-none bg-transparent p-0 cursor-pointer text-left"
            >
              <LuxZeraLogo />
            </button>
            <span className="bg-[#18181B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={10} className="text-[#F07020]" />
              Admin
            </span>
          </div>
          <p className="text-[12px] text-[#71717A] font-medium">
            Executive Control Studio
          </p>
        </div>

        {/* Nav Groups */}
        <div className="space-y-6">
          {navGroups.map((group, i) => (
            <div key={i} className="space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#9B9B9B] px-3">
                {group.title}
              </h4>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none text-left ${
                        item.active
                          ? "bg-[#18181B] text-white shadow-xs font-bold"
                          : "text-[#37352F] hover:bg-[#FAFAF9] hover:text-[#18181B]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={item.active ? "text-[#F07020]" : "text-[#71717A]"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            item.active
                              ? "bg-[#F07020] text-white"
                              : "bg-[#FAFAF9] text-[#71717A] border border-[#ECECEC]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-[#ECECEC] space-y-3">
        <div className="space-y-1">
          {footerItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  if (item.href.startsWith("http")) {
                    window.location.href = item.href;
                  } else {
                    router.push(item.href);
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#71717A] hover:bg-[#FAFAF9] hover:text-[#18181B] transition-colors cursor-pointer border-none text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={13} className="text-[#9B9B9B]" />
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 bg-[#FAFAF9] rounded-2xl border border-[#ECECEC] flex items-center justify-between mt-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#18181B] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              EX
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#18181B] truncate">Executive Admin</p>
              <p className="text-[10px] text-[#71717A] truncate">chokkapusaketh@gmail.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
