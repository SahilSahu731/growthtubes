"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Sparkles,
  Shield,
  BookOpen,
  Trophy,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";

function getInitials(email: string, name?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.substring(0, 2).toUpperCase();
}

/* ── Breadcrumb helper ─────────────────────── */
function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];

  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    explore: "Explore",
    courses: "My Courses",
    achievements: "Achievements",
    streak: "Streak",
    saved: "Saved",
    profile: "Profile",
    settings: "Settings",
    admin: "Admin",
    creator: "Creator Studio",
    categories: "Categories",
    users: "Users",
    roles: "Roles",
    analytics: "Analytics",
    content: "Content",
    reports: "Reports",
    videos: "Videos",
    students: "Students",
    new: "New",
  };

  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    crumbs.push({
      label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: path,
    });
  }

  return crumbs;
}

/* ── Top Bar ───────────────────────────────── */
export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, logout } = useAuthStore();

  const breadcrumbs = getBreadcrumbs(pathname);
  const isLoggedIn = _hasHydrated && isAuthenticated && user;
  const userRole = isLoggedIn ? user.profile?.role || "USER" : null;

  const userDisplay = isLoggedIn
    ? {
        name: user.profile?.fullName || user.email.split("@")[0],
        email: user.email,
        avatar: user.profile?.avatarUrl || "",
        initials: getInitials(user.email, user.profile?.fullName),
      }
    : null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="h-12 bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left — Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="size-3 text-zinc-600 shrink-0" />}
            {i < breadcrumbs.length - 1 ? (
              <Link
                href={crumb.href || "#"}
                className="text-zinc-500 hover:text-zinc-300 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-zinc-200 font-medium truncate">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Right — Search + Notifications + Avatar */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-48 pl-8 pr-3 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
            />
          </div>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
          title="Notifications"
        >
          <Bell className="size-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        </button>

        {/* User Dropdown */}
        {userDisplay && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-lg hover:bg-white/5 transition-colors outline-none cursor-pointer">
                <Avatar className="size-7 ring-1 ring-white/10">
                  {userDisplay.avatar ? (
                    <AvatarImage src={userDisplay.avatar} alt={userDisplay.name} />
                  ) : null}
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                    {userDisplay.initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1"
              sideOffset={8}
            >
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-sm font-semibold text-white truncate">
                  {userDisplay.name}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {userDisplay.email}
                </p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/5" />

              <DropdownMenuGroup>
                <Link href="/dashboard">
                  <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                    <LayoutDashboard className="size-3.5 text-emerald-400" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/courses">
                  <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                    <BookOpen className="size-3.5 text-emerald-400" />
                    My Courses
                  </DropdownMenuItem>
                </Link>
                <Link href="/achievements">
                  <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                    <Trophy className="size-3.5 text-amber-400" />
                    Achievements
                  </DropdownMenuItem>
                </Link>
                <Link href="/saved">
                  <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                    <Heart className="size-3.5 text-pink-400" />
                    Saved
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-white/5" />

              <DropdownMenuGroup>
                <Link href="/profile">
                  <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                    <User className="size-3.5 text-emerald-400" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                    <Settings className="size-3.5 text-emerald-400" />
                    Settings
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>

              {(userRole === "CREATOR" || userRole === "ADMIN") && (
                <>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <Link href="/creator/dashboard">
                    <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                      <Sparkles className="size-3.5 text-emerald-400" />
                      Creator Studio
                    </DropdownMenuItem>
                  </Link>
                </>
              )}

              {userRole === "ADMIN" && (
                <>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <Link href="/admin/dashboard">
                    <DropdownMenuItem className="px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer gap-2.5 text-zinc-300 hover:text-white text-xs">
                      <Shield className="size-3.5 text-red-400" />
                      Admin Panel
                    </DropdownMenuItem>
                  </Link>
                </>
              )}

              <DropdownMenuSeparator className="bg-white/5" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer gap-2.5 text-zinc-400 hover:text-red-400 text-xs"
              >
                <LogOut className="size-3.5" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
