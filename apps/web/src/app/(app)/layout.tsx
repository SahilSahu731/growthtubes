"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar, MobileSidebar, AppBottomBar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, getMe } = useAuthStore();
  const collapsed = useSidebarStore((s) => s.collapsed);

  // Validate session on mount
  useEffect(() => {
    if (_hasHydrated) {
      getMe();
    }
  }, [_hasHydrated, getMe]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Mobile sidebar (overlay) */}
      <MobileSidebar />

      {/* Content area — sits next to sidebar, no top navbar */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-[68px]" : "lg:pl-60"
        }`}
      >
        {/* Top bar (breadcrumbs + search + avatar) */}
        <TopBar />

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom bar */}
      <AppBottomBar />
    </div>
  );
}
