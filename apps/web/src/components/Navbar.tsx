"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Compass,
  Heart,
  Trophy,
  Flame,
  X,
  ArrowRight,
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

/* ───────────────────────────────────────────────
 * SINGLE NAVBAR — adapts based on auth + route
 * ─────────────────────────────────────────────── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, _hasHydrated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/signup";
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

  // Don't render on auth pages (they have their own branding)
  if (isAuthPage) return null;

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-2xl border-b border-white/6 shadow-lg shadow-black/30"
          : isLandingPage
            ? "bg-transparent"
            : "bg-zinc-950/70 backdrop-blur-xl border-b border-white/5"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* ── Logo ──────────────────────────── */}
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

        {/* ── Center Section ────────────────── */}
        <div className="hidden md:flex items-center justify-end flex-1 mx-6 gap-1">
          {isLoggedIn ? (
            <>

              {/* Search */}
              <div className="flex-1 max-w-md ml-3">
                <div className="w-full relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search courses, topics..."
                    className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
                  />
                </div>
              </div>
              {/* Authenticated nav links */}
              <NavLink href="/explore" icon={Compass} label="Explore" />
              <NavLink href="/courses" icon={BookOpen} label="My Courses" />
            </>
          ) : (
            <>
              {/* Public nav links */}
              <NavLink href="/explore" icon={Compass} label="Explore" />
              <NavLinkHash href="#features" label="Features" />
              <NavLinkHash href="#vision" label="Vision" />
              <NavLinkHash href="#pricing" label="Pricing" />
            </>
          )}
        </div>

        {/* ── Right Section ─────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {/* Role switch icons */}
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

              {/* Saved */}
              <Link
                href="/saved"
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
                title="Saved"
              >
                <Heart className="size-[18px] text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </Link>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
                title="Notifications"
              >
                <Bell className="size-[18px] text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-zinc-950" />
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
            </>
          ) : (
            <>
              {/* Auth buttons */}
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-sm px-5 shadow-lg shadow-emerald-500/20">
                  Sign up
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Menu ───────────────────── */}
        <div className="md:hidden">
          {isLoggedIn && userDisplay ? (
            <MobileMenu
              user={userDisplay}
              userRole={userRole}
              onLogout={handleLogout}
            />
          ) : (
            <MobileMenuPublic />
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── Reusable nav link (app) ─────────────────── */
function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "text-emerald-400 bg-emerald-500/10"
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

/* ── Reusable nav link (hash/anchor) ─────────── */
function NavLinkHash({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </a>
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
          <Link href="/achievements">
            <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
              <Trophy className="size-4 text-amber-400" />
              <span>Achievements</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/saved">
            <DropdownMenuItem className="px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer gap-3 text-zinc-300 hover:text-white">
              <Heart className="size-4 text-pink-400" />
              <span>Saved</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        <DropdownMenuGroup>
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

/* ── Mobile Menu (Authenticated) ─────────────── */
function MobileMenu({
  user,
  userRole,
  onLogout,
}: {
  user: { name: string; email: string; avatar?: string; initials: string };
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
                placeholder="Search courses..."
                className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 p-5 space-y-1 overflow-y-auto">
            <MobileSection label="Menu">
              <MobileLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <MobileLink href="/explore" icon={Compass} label="Explore" />
              <MobileLink href="/courses" icon={BookOpen} label="My Courses" />
            </MobileSection>

            <MobileSection label="Learning">
              <MobileLink href="/achievements" icon={Trophy} label="Achievements" iconColor="text-amber-400" />
              <MobileLink href="/streak" icon={Flame} label="Streak" iconColor="text-orange-400" />
              <MobileLink href="/saved" icon={Heart} label="Saved" iconColor="text-pink-400" />
            </MobileSection>

            <MobileSection label="Account">
              <MobileLink href="/profile" icon={User} label="Profile" />
              <MobileLink href="/settings" icon={Settings} label="Settings" />
            </MobileSection>

            {(userRole === "CREATOR" || userRole === "ADMIN") && (
              <MobileSection label="Creator">
                <MobileLink href="/creator/dashboard" icon={Sparkles} label="Creator Studio" />
              </MobileSection>
            )}

            {userRole === "ADMIN" && (
              <MobileSection label="Admin">
                <MobileLink href="/admin/dashboard" icon={Shield} label="Admin Panel" iconColor="text-red-400" />
              </MobileSection>
            )}
          </div>

          {/* Logout */}
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

/* ── Mobile Menu (Public / Not logged in) ─────── */
function MobileMenuPublic() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-zinc-300 hover:text-white hover:bg-white/5"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[280px] bg-zinc-950 border-l border-white/5 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-base text-white">
                Growth<span className="text-emerald-400">Tubes</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-1 flex-1">
              <a
                href="/explore"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Compass className="size-4 text-emerald-400" />
                Explore
              </a>
              <a
                href="#features"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Features
              </a>
              <a
                href="#vision"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Vision
              </a>
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Pricing
              </a>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Mobile helpers ──────────────────────────── */
function MobileSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-2">
      <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2 px-3">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MobileLink({
  href,
  icon: Icon,
  label,
  iconColor = "text-emerald-400",
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  iconColor?: string;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        <Icon className={`size-4 ${iconColor}`} />
        {label}
      </Link>
    </SheetClose>
  );
}
