"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { label: "Explore", href: "/explore" },
  { label: "Features", href: "#features" },
  { label: "Vision", href: "#vision" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          ) : isAuthenticated ? (
            <Button
              size="sm"
              asChild
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg px-5 shadow-lg shadow-emerald-500/20 transition-colors duration-200"
            >
              <Link href="/dashboard" className="flex items-center gap-1.5">
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <AuthButtons />
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <HomeMobileMenu isAuthenticated={_hasHydrated && isAuthenticated} />
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

/* ── Mobile Menu ─────────────────────────────── */
function HomeMobileMenu({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
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
          </div>

          {/* Bottom CTA */}
          <div className="p-5 border-t border-white/5 space-y-2.5">
            {isAuthenticated ? (
              <SheetClose asChild>
                <Button
                  asChild
                  className="w-full justify-center bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg shadow-lg shadow-emerald-500/20"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </SheetClose>
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
