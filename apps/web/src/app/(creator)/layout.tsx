"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { CreatorSidebar, CreatorBottomBar } from "@/components/CreatorSidebar";
import { useAuthStore } from "@/store/authStore";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, getMe } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated) {
      getMe();
    }
  }, [_hasHydrated, getMe]);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (_hasHydrated && isAuthenticated && user) {
      const role = user.profile?.role || "USER";
      if (role !== "CREATOR" && role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.profile?.role || "USER";
  if (role !== "CREATOR" && role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AppNavbar />
      <CreatorSidebar />
      <main className="pt-16 pb-20 lg:pb-0 lg:pl-60 min-h-screen bg-background transition-all duration-300">
        {children}
      </main>
      <CreatorBottomBar />
    </>
  );
}
