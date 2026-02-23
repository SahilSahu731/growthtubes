"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Wait for hydration before rendering
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render auth pages for authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Branding Image Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/3 m-4 rounded-3xl relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="/auth-bg.png"
          alt="GrowthTubes — Learn, Build, Grow"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="GrowthTubes Logo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-bold text-lg text-white tracking-tight">
              Growth<span className="text-emerald-400">Tubes</span>
            </span>
          </Link>

          {/* Bottom branding text */}
          <div className="space-y-4">
            <blockquote className="text-xl font-medium text-white/90 leading-relaxed max-w-md">
              &ldquo;The best investment you can make is in yourself.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-emerald-500 rounded-full" />
              <p className="text-sm text-zinc-400">
                Join thousands of learners mastering new skills every day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}