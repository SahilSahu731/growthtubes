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

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Vision", href: "#vision" },
  { label: "Pricing", href: "#pricing" },
];

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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, _hasHydrated, getMe, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Validate auth status on mount (refresh token from server)
  useEffect(() => {
    if (_hasHydrated) {
      getMe();
    }
  }, [_hasHydrated, getMe]);

  const userDisplay = _hasHydrated && isAuthenticated && user
    ? {
        name: user.profile?.fullName || user.email.split("@")[0],
        email: user.email,
        avatar: user.profile?.avatarUrl || "",
        initials: getInitials(user.email, user.profile?.fullName),
      }
    : null;

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-2xl border-b border-emerald-500/10 shadow-lg shadow-black/20"
          : "bg-black/40 backdrop-blur-xl border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="GrowthTubes Logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-bold text-lg tracking-tight text-white">
            Growth
            <span className="text-emerald-400">Tubes</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-2/3" />
            </a>
          ))}
        </div>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-3">
          {!_hasHydrated ? (
            <div className="w-24 h-8" />
          ) : userDisplay ? (
            <UserDropdown user={userDisplay} onLogout={logout} />
          ) : (
            <AuthButtons />
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileMenu user={userDisplay} onLogout={logout} />
        </div>
      </div>
    </nav>
  );
}

/* ── Auth Buttons ────────────────────────────── */
function AuthButtons() {
  return (
    <div className="flex items-center gap-2.5">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="text-zinc-300 hover:text-white hover:bg-white/5 font-medium rounded-lg"
      >
        <Link href="/login">Log in</Link>
      </Button>

      <Button
        size="sm"
        asChild
        className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg px-5 shadow-lg shadow-emerald-500/20 transition-colors duration-200"
      >
        <Link href="/signup" className="flex items-center gap-1.5">
          <Sparkles className="size-3.5" />
          Sign up
        </Link>
      </Button>
    </div>
  );
}

/* ── User Dropdown ───────────────────────────── */
function UserDropdown({
  user,
  onLogout,
}: {
  user: { name: string; email: string; avatar?: string; initials: string };
  onLogout: () => void;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await onLogout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-black group cursor-pointer">
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
        className="w-60 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5"
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
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {user.name}
              </span>
              <span className="text-xs text-zinc-400 truncate max-w-[140px]">
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

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        <DropdownMenuItem
          onClick={handleLogout}
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
function MobileMenu({
  user,
  onLogout,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  } | null;
  onLogout: () => void;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await onLogout();
    router.push("/login");
  };

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
          {/* User Info (if logged in) */}
          {user && (
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
                  <p className="text-sm font-semibold text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <div className="flex-1 p-5 space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-3">
              Navigation
            </p>
            {navLinks.map((link) => (
              <SheetClose key={link.label} asChild>
                <a
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  {link.label}
                </a>
              </SheetClose>
            ))}

            {user && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold px-3">
                    Account
                  </p>
                </div>
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
              </>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="p-5 border-t border-white/5 space-y-2.5">
            {user ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <LogOut className="size-4" />
                Log out
              </Button>
            ) : (
              <>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-center text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg font-medium"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    asChild
                    className="w-full justify-center bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg shadow-lg shadow-emerald-500/20"
                  >
                    <Link
                      href="/signup"
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="size-3.5" />
                      Sign up for free
                    </Link>
                  </Button>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
