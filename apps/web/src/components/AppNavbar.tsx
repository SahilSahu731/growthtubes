"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  Sparkles,
  Shield,
  Search,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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

export function AppNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, _hasHydrated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userRole =
    _hasHydrated && isAuthenticated && user
      ? user.profile?.role || "USER"
      : null;

  const userDisplay =
    _hasHydrated && isAuthenticated && user
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
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-2xl border-b border-white/6 shadow-lg shadow-black/30"
          : "bg-zinc-950/70 backdrop-blur-xl border-b border-white/5"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image
            src="/logo.png"
            alt="GrowthTubes Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">
            Growth
            <span className="text-emerald-400">Tubes</span>
          </span>
        </Link>

        {/* Center — Search (placeholder) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search courses, topics..."
              className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
            />
          </div>
        </div>

        {/* Right Section — Desktop */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* Role quick-access icons */}
          {(userRole === "CREATOR" || userRole === "ADMIN") && (
            <Link
              href="/creator/dashboard"
              className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
              title="Creator Studio"
            >
              <Sparkles className="size-[18px] text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </Link>
          )}
          {userRole === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
              title="Admin Panel"
            >
              <Shield className="size-[18px] text-red-400 group-hover:text-red-300 transition-colors" />
            </Link>
          )}

          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
            title="Notifications"
          >
            <Bell className="size-[18px] text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* User Dropdown */}
          {userDisplay && (
            <UserDropdown
              user={userDisplay}
              userRole={userRole}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          {userDisplay && (
            <AppMobileMenu
              user={userDisplay}
              userRole={userRole}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── User Dropdown ───────────────────────────── */
function UserDropdown({
  user,
  userRole,
  onLogout,
}: {
  user: { name: string; email: string; avatar?: string; initials: string };
  userRole: string | null;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950 group cursor-pointer">
          <Avatar className="size-8 ring-2 ring-emerald-500/30">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-sm font-medium text-white leading-tight">
              {user.name}
            </span>
          </div>
          <ChevronDown className="size-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-2 ring-emerald-500/30">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">
                {user.name}
              </span>
              <span className="text-xs text-zinc-400 truncate">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        <DropdownMenuGroup>
          <Link href="/dashboard">
            <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
              <LayoutDashboard className="size-4 text-emerald-400" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/courses">
            <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
              <BookOpen className="size-4 text-emerald-400" />
              <span>My Courses</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/profile">
            <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
              <User className="size-4 text-emerald-400" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
              <Settings className="size-4 text-emerald-400" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        {/* Role-specific links */}
        {(userRole === "CREATOR" || userRole === "ADMIN") && (
          <>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuGroup>
              <Link href="/creator/dashboard">
                <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
                  <Sparkles className="size-4 text-emerald-400" />
                  <span>Creator Studio</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}

        {userRole === "ADMIN" && (
          <>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuGroup>
              <Link href="/admin/dashboard">
                <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
                  <Shield className="size-4 text-red-400" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        <DropdownMenuItem
          onClick={onLogout}
          className="px-3 py-2 rounded-lg hover:bg-red-500/10 cursor-pointer gap-3 text-zinc-400 hover:text-red-400"
        >
          <LogOut className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Mobile Menu ─────────────────────────────── */
function AppMobileMenu({
  user,
  userRole,
  onLogout,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  onLogout: () => void;
  userRole: string | null;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-300 hover:text-white hover:bg-white/5"
        >
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="bg-zinc-950 border-l border-white/5 w-[300px] sm:w-[340px] p-0"
      >
        <SheetHeader className="p-5 pb-3 border-b border-white/5">
          <SheetTitle className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="GrowthTubes Logo"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-bold text-base text-white">
              Growth<span className="text-emerald-400">Tubes</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-60px)]">
          {/* User Info */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 ring-2 ring-emerald-500/30">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 p-5 space-y-1 overflow-y-auto">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-3">
              Menu
            </p>
            <SheetClose asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <LayoutDashboard className="size-4 text-emerald-400" />
                Dashboard
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/courses"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <BookOpen className="size-4 text-emerald-400" />
                My Courses
              </Link>
            </SheetClose>

            <div className="pt-4 pb-2">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold px-3">
                Account
              </p>
            </div>
            <SheetClose asChild>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <User className="size-4 text-emerald-400" />
                Profile
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings className="size-4 text-emerald-400" />
                Settings
              </Link>
            </SheetClose>

            {/* Creator links */}
            {(userRole === "CREATOR" || userRole === "ADMIN") && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold px-3">
                    Creator
                  </p>
                </div>
                <SheetClose asChild>
                  <Link
                    href="/creator/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Sparkles className="size-4 text-emerald-400" />
                    Creator Studio
                  </Link>
                </SheetClose>
              </>
            )}

            {/* Admin links */}
            {userRole === "ADMIN" && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold px-3">
                    Admin
                  </p>
                </div>
                <SheetClose asChild>
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Shield className="size-4 text-red-400" />
                    Admin Panel
                  </Link>
                </SheetClose>
              </>
            )}
          </div>

          {/* Bottom — Logout */}
          <div className="p-5 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
