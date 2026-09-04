"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Users,
  FileText,
  HelpCircle,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Activity,
  UserCheck,
  ShoppingBag,
  Palette,
} from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import { getCurrentAdmin, adminLogout } from "@/modules/admin/services/adminService";

export default function AdminSidebar({ activeTab = "overview" }) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    getCurrentAdmin()
      .then((profile) => {
        if (mounted) setAdminProfile(profile);
      })
      .catch(() => {
        // Unauthenticated or customer token
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      // Ignored
    } finally {
      router.push("/admin/login");
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);

  const hasPermission = (permKey) => {
    if (isSuper) return true;
    return permissions.has(permKey);
  };

  const overviewItems = [
    {
      id: "overview",
      label: "Control Plane",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      active: pathname === "/admin/dashboard" && activeTab === "overview",
      visible: true,
    },
    {
      id: "audit",
      label: "Audit & Security",
      icon: Activity,
      href: "/admin/audit",
      active: pathname.startsWith("/admin/audit") || activeTab === "audit",
      visible: hasPermission("audit_logs.read"),
    },
    {
      id: "users",
      label: "Customer Governance",
      icon: UserCheck,
      href: "/admin/users",
      active: pathname.startsWith("/admin/users") || activeTab === "users",
      visible: hasPermission("users.read"),
    },
    {
      id: "designers",
      label: "Designer Governance",
      icon: Palette,
      href: "/admin/designers",
      active: pathname.startsWith("/admin/designers") || activeTab === "designers",
      visible: hasPermission("designers.read"),
    },
    {
      id: "admins",
      label: "Administrators & Access",
      icon: Users,
      href: "/admin/admins",
      active: pathname.startsWith("/admin/admins") || activeTab === "admins",
      visible: hasPermission("admins.read"),
    },
    {
      id: "products",
      label: "Product Catalog",
      icon: BarChart3,
      href: "/admin/products",
      active: pathname.startsWith("/admin/products") || activeTab === "products",
      visible: hasPermission("products.read"),
    },
    {
      id: "orders",
      label: "Order Operations",
      icon: ShoppingBag,
      href: "/admin/orders",
      active: pathname.startsWith("/admin/orders") || activeTab === "orders",
      visible: hasPermission("orders.read"),
    },
    {
      id: "applications",
      label: "Pending Applications",
      icon: ClipboardList,
      href: "/admin/dashboard/requests",
      active: pathname === "/admin/dashboard/requests" || activeTab === "applications",
      badge: "Queue",
      visible: isSuper,
    },
  ].filter((item) => item.visible);

  const publicPortalItems = [
    {
      id: "apply",
      label: "Staff Onboarding Application",
      icon: FileText,
      href: "/admin/apply",
      active: pathname === "/admin/apply",
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
    <aside className="w-64 bg-white text-[#183B56] flex flex-col justify-between shrink-0 min-h-screen p-4 select-none border-r border-[#183B56]/15 font-sans">
      <div>
        {/* Sidebar Header / Logo */}
        <div className="flex flex-col gap-2 pb-5 border-b border-[#183B56]/15 mb-5 pt-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="border-none bg-transparent p-0 cursor-pointer select-none text-left"
            >
              <WeavlyLogo />
            </button>
            <span className="bg-[#183B56] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 flex items-center gap-1 tracking-wider border border-[#183B56]">
              <ShieldCheck size={10} className="text-amber-400" />
              Admin
            </span>
          </div>
          <p className="text-[11px] text-[#5A7184] font-semibold tracking-wide">
            Executive Control Plane
          </p>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A7184] px-2">
              Operations & Governance
            </div>
            <div className="space-y-1">
              {overviewItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                      item.active
                        ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                        : "text-[#5A7184] border-transparent hover:bg-[#F5EFEB] hover:text-[#183B56]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className={item.active ? "text-amber-400" : "text-[#5A7184]"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                          item.active
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-[#183B56]/10 text-[#183B56] border-[#183B56]/20"
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

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A7184] px-2">
              Portals
            </div>
            <div className="space-y-1">
              {publicPortalItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                      item.active
                        ? "bg-[#183B56] text-white border-[#183B56]"
                        : "text-[#5A7184] border-transparent hover:bg-[#F5EFEB] hover:text-[#183B56]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Support & Profile Group */}
      <div className="pt-5 border-t border-[#183B56]/15 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A7184] px-2 mb-1">
            System & Reference
          </div>
          {footerItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-[#5A7184] hover:bg-[#F5EFEB] hover:text-[#183B56] transition-all border-none bg-transparent cursor-pointer"
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Authenticated Admin Identity Card */}
        <div className="bg-[#F5EFEB] p-3 border border-[#183B56]/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-7 bg-[#183B56] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#183B56]">
              {adminProfile?.username ? adminProfile.username[0].toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#183B56] truncate font-mono">
                {adminProfile?.username || "Authenticated Admin"}
              </div>
              <div className="text-[10px] text-[#5A7184] truncate">
                {adminProfile?.role || "STAFF"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#5A7184] hover:text-rose-700 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 cursor-pointer shrink-0"
            title="Revoke Session & Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
