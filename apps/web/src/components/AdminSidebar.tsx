"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  BarChart3,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Roles",
        href: "/admin/roles",
        icon: Shield,
      },
      {
        label: "Content",
        href: "/admin/content",
        icon: FileText,
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        label: "Reports",
        href: "/admin/reports",
        icon: AlertTriangle,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-40 flex flex-col ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0">
            <Crown className="size-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white leading-tight truncate">
                Admin Panel
              </p>
              <p className="text-[10px] text-zinc-500 leading-tight">
                System management
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5">
        {sidebarLinks.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-red-500/10 text-red-400"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon
                      className={`size-[18px] shrink-0 ${
                        isActive
                          ? "text-red-400"
                          : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/5 p-2.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
