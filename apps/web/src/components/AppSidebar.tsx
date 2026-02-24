"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  Compass,
  Flame,
  Heart,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Trophy,
  LogOut,
  Sparkles,
  Shield,
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
    section: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Explore", href: "/explore", icon: Compass },
    ],
  },
  {
    section: "Learning",
    items: [
      { label: "My Courses", href: "/courses", icon: BookOpen },
      { label: "Achievements", href: "/achievements", icon: Trophy },
      { label: "Streak", href: "/streak", icon: Flame },
    ],
  },
  {
    section: "Library",
    items: [{ label: "Saved", href: "/saved", icon: Heart }],
  },
  {
    section: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/* ── Mobile bottom tabs ─────────────────────── */
const bottomTabs = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Learn", href: "/courses", icon: GraduationCap, isCenter: true },
  { label: "Saved", href: "/saved", icon: Heart },
  { label: "Profile", href: "/profile", icon: User },
];

/* ── Desktop Sidebar (full-height, Supabase-style) ── */
export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { collapsed, toggle } = useSidebarStore();
  const profile = user?.profile;
  const userRole = profile?.role || "USER";

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
      {/* ── Logo ────────────────────────────── */}
      <div className="h-12 px-4 flex items-center gap-2.5 border-b border-white/5 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo.png"
            alt="GrowthTubes"
            width={28}
            height={28}
            className="rounded-lg shrink-0"
          />
          {!collapsed && (
            <span className="font-bold text-sm text-white truncate">
              Growth<span className="text-emerald-400">Tubes</span>
            </span>
          )}
        </Link>
      </div>

      {/* ── Navigation ──────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5">
        {sidebarLinks.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
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
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Role switch links */}
        {(userRole === "CREATOR" || userRole === "ADMIN") && (
          <div>
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                Switch
              </p>
            )}
            <div className="space-y-0.5">
              <Link
                href="/creator/dashboard"
                title={collapsed ? "Creator Studio" : undefined}
                className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-150 group"
              >
                <Sparkles className="size-[18px] shrink-0 text-emerald-500 group-hover:text-emerald-400" />
                {!collapsed && (
                  <span className="truncate">Creator Studio</span>
                )}
              </Link>
              {userRole === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  title={collapsed ? "Admin Panel" : undefined}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-150 group"
                >
                  <Shield className="size-[18px] shrink-0 text-red-400 group-hover:text-red-300" />
                  {!collapsed && (
                    <span className="truncate">Admin Panel</span>
                  )}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Bottom: Collapse + User ─────────── */}
      <div className="border-t border-white/5 p-2.5 space-y-1">
        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
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

        {/* User card */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group">
          <Avatar className="size-7 ring-1 ring-white/10 shrink-0">
            {profile?.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName || ""} />
            ) : null}
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
              {profile?.fullName
                ? profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : user?.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {profile?.fullName || user?.email.split("@")[0]}
              </p>
              <p className="text-[10px] text-zinc-600 truncate">
                {profile?.plan === "PRO" ? "Pro" : "Free"} · {userRole}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              title="Log out"
            >
              <LogOut className="size-3.5 text-zinc-500 hover:text-red-400" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Sidebar (Overlay) ───────────────── */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const profile = user?.profile;
  const userRole = profile?.role || "USER";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger in top bar area — visible on mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-2.5 left-3 z-50 p-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-white/5 hover:bg-white/5 transition-colors"
      >
        <Menu className="size-5 text-zinc-400" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-zinc-950 border-r border-white/5 flex flex-col animate-in slide-in-from-left duration-200">
            {/* Logo */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/logo.png"
                  alt="GrowthTubes"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="font-bold text-sm text-white">
                  Growth<span className="text-emerald-400">Tubes</span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-zinc-500"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
              {sidebarLinks.map((section) => (
                <div key={section.section}>
                  <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                    {section.section}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                          pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <item.icon
                            className={`size-[18px] shrink-0 ${
                              isActive
                                ? "text-emerald-400"
                                : "text-zinc-500"
                            }`}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {(userRole === "CREATOR" || userRole === "ADMIN") && (
                <div>
                  <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                    Switch
                  </p>
                  <div className="space-y-0.5">
                    <Link
                      href="/creator/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                      <Sparkles className="size-[18px] text-emerald-500" />
                      Creator Studio
                    </Link>
                    {userRole === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5"
                      >
                        <Shield className="size-[18px] text-red-400" />
                        Admin Panel
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-white/5 p-3 space-y-2">
              <div className="flex items-center gap-2.5 px-2">
                <Avatar className="size-7 ring-1 ring-white/10">
                  {profile?.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                    {profile?.fullName?.[0]?.toUpperCase() ||
                      user?.email[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-300 truncate">
                    {profile?.fullName || user?.email.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="size-3.5" />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/* ── Mobile Bottom Bar ──────────────────────── */
export function AppBottomBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/6">
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
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
                  <tab.icon className="size-5 text-black" />
                </div>
                <span className="text-[10px] font-medium text-emerald-400 mt-1">
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
                  isActive ? "text-emerald-400" : "text-zinc-500"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
