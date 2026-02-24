"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  PlusCircle,
  Video,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";

/* ── Sidebar nav config ─────────────────────── */
const sidebarLinks = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/creator/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "My Courses", href: "/creator/courses", icon: BookOpen },
      { label: "Create Course", href: "/creator/courses/new", icon: PlusCircle },
      { label: "Videos", href: "/creator/videos", icon: Video },
    ],
  },
  {
    section: "Community",
    items: [{ label: "Students", href: "/creator/students", icon: Users }],
  },
  {
    section: "Account",
    items: [{ label: "Settings", href: "/creator/settings", icon: Settings }],
  },
];

const bottomTabs = [
  { label: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/creator/courses", icon: BookOpen },
  { label: "Create", href: "/creator/courses/new", icon: PlusCircle, isCreate: true },
  { label: "Analytics", href: "/creator/analytics", icon: BarChart3 },
  { label: "Settings", href: "/creator/settings", icon: Settings },
];

/* ── Desktop Sidebar ────────────────────────── */
function CreatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { collapsed, toggle } = useSidebarStore();
  const profile = user?.profile;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-screen bg-zinc-950 border-r border-white/5 transition-all duration-300 z-50 flex-col ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="h-12 px-4 flex items-center gap-2.5 border-b border-white/5 shrink-0">
        <Link href="/creator/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-emerald-400" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm text-white truncate">
              Creator<span className="text-emerald-400">Studio</span>
            </span>
          )}
        </Link>
      </div>

      {/* Back to app */}
      <div className="px-2.5 py-2 border-b border-white/5">
        <Link
          href="/dashboard"
          title={collapsed ? "Back to App" : undefined}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          {!collapsed && <span>Back to App</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
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
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon
                      className={`size-[18px] shrink-0 ${
                        isActive
                          ? "text-emerald-400"
                          : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/5 p-2.5 space-y-1">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" /><span>Collapse</span></>}
        </button>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
          <Avatar className="size-7 ring-1 ring-white/10 shrink-0">
            {profile?.avatarUrl ? <AvatarImage src={profile.avatarUrl} /> : null}
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
              {profile?.fullName?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{profile?.fullName || user?.email.split("@")[0]}</p>
              <p className="text-[10px] text-emerald-400/60 truncate">Creator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Creator Sidebar ─────────────────── */
function MobileCreatorSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-2.5 left-3 z-50 p-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-white/5"
      >
        <Menu className="size-5 text-zinc-400" />
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-zinc-950 border-r border-white/5 flex flex-col">
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">Creator Studio</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-zinc-500">
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5">
                <ArrowLeft className="size-3.5" />Back to App
              </Link>
              {sidebarLinks.map((section) => (
                <div key={section.section}>
                  <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">{section.section}</p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
                          <item.icon className={`size-[18px] shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

/* ── Creator Bottom Bar ─────────────────────── */
function CreatorBottomBar() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/6">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {bottomTabs.map((tab) => {
          const isActive = pathname === tab.href;
          if (tab.isCreate) {
            return (
              <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center -mt-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
                  <tab.icon className="size-5 text-black" />
                </div>
                <span className="text-[10px] font-medium text-emerald-400 mt-1">{tab.label}</span>
              </Link>
            );
          }
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl min-w-[56px]">
              <tab.icon className={`size-5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-emerald-400" : "text-zinc-500"}`}>{tab.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export { CreatorSidebar, MobileCreatorSidebar, CreatorBottomBar };
