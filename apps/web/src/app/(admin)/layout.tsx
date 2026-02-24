"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar, MobileAdminSidebar, AdminBottomBar } from "@/components/AdminSidebar";
import { TopBar } from "@/components/TopBar";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, getMe } = useAuthStore();
  const collapsed = useSidebarStore((s) => s.collapsed);

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
      if (role !== "ADMIN") {
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
  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <MobileAdminSidebar />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-[68px]" : "lg:pl-60"
        }`}
      >
        <TopBar />
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      <AdminBottomBar />
    </div>
  );
}
