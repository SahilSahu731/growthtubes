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
  FolderOpen,
} from "lucide-react";
import { useState } from "react";

/* ── Sidebar nav config ─────────────────────── */
const sidebarLinks = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles", href: "/admin/roles", icon: Shield },
      { label: "Categories", href: "/admin/categories", icon: FolderOpen },
      { label: "Content", href: "/admin/content", icon: FileText },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Reports", href: "/admin/reports", icon: AlertTriangle },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

/* ── Mobile bottom tabs ─────────────────────── */
const bottomTabs = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen, isCenter: true },
  { label: "Roles", href: "/admin/roles", icon: Shield },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/* ── Desktop Sidebar ────────────────────────── */
export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-40 flex-col ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Header */}
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

      {/* Nav */}
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
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse */}
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

/* ── Mobile Bottom Bar ──────────────────────── */
export function AdminBottomBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/[0.06]">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {bottomTabs.map((tab) => {
          const isActive = pathname === tab.href;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform">
                  <tab.icon className="size-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-red-400 mt-1">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-[56px]"
            >
              <tab.icon
                className={`size-5 transition-colors ${
                  isActive ? "text-red-400" : "text-zinc-500"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-red-400" : "text-zinc-500"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area for iPhones */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
