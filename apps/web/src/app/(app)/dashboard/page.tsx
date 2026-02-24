"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Flame,
  Trophy,
  Target,
  ArrowRight,
  Compass,
  Loader2,
  Clock,
  TrendingUp,
  Zap,
  Star,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DynamicIcon, isValidIconName } from "@/components/DynamicIcon";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string;
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);

  const profile = user?.profile;
  const firstName = profile?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "GT";

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data.categories);
    } catch {
      //
    } finally {
      setIsLoadingCats(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      label: "Courses Enrolled",
      value: 0,
      icon: BookOpen,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      trend: "Start learning →",
    },
    {
      label: "Current Streak",
      value: profile?.streakCount ?? 0,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      trend: profile?.streakCount ? `${profile.streakCount} days` : "Begin today",
      suffix: profile?.streakCount ? "🔥" : "",
    },
    {
      label: "Longest Streak",
      value: profile?.longestStreak ?? 0,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      trend: "Personal best",
    },
    {
      label: "Hours Learned",
      value: 0,
      icon: Clock,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      trend: "Keep going!",
    },
  ];

  const quickActions = [
    {
      label: "Explore Courses",
      description: "Discover new skills to learn",
      href: "/explore",
      icon: Compass,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "My Courses",
      description: "Continue where you left off",
      href: "/courses",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Set a Goal",
      description: "Track your learning targets",
      href: "/streak",
      icon: Target,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Achievements",
      description: "View your milestones",
      href: "/achievements",
      icon: Star,
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* ── Greeting Hero ─────────────────────── */}
      <div className="relative mb-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 sm:p-8 overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <Avatar className="size-14 sm:size-16 ring-2 ring-emerald-500/30 shrink-0">
            {profile?.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={firstName} />
            ) : null}
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm text-zinc-400">{greeting},</p>
              {profile?.streakCount ? (
                <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-medium">
                  🔥 {profile.streakCount} day streak
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
              {profile?.fullName || firstName}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {profile?.plan === "PRO" ? (
                <span className="text-emerald-400 font-medium">Pro Member</span>
              ) : (
                "Free Plan"
              )}
              {" · "}
              Ready to learn something new?
            </p>
          </div>

          <Link
            href="/explore"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Compass className="size-4" />
            Explore
          </Link>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`size-[18px] ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {stat.value}
              {stat.suffix && (
                <span className="ml-1 text-base">{stat.suffix}</span>
              )}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
              <TrendingUp className="size-3" />
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ─────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-200"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-linear-to-br ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="size-[18px] text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                  {action.label}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Continue Learning (placeholder) ───── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Continue Learning
          </h2>
          <Link
            href="/courses"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="size-7 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1">
            No courses yet
          </p>
          <p className="text-zinc-600 text-xs mb-4">
            Enroll in a course to start your learning journey
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/20 transition-colors"
          >
            <Compass className="size-4" />
            Browse Courses
          </Link>
        </div>
      </div>

      {/* ── Browse Categories ─────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Browse by Category
          </h2>
          <Link
            href="/explore"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            See all <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoadingCats ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 text-emerald-500 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center">
            <p className="text-zinc-500 text-sm">
              No categories available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href="/explore"
                className="group flex items-center gap-3 p-3.5 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 hover:bg-white/2 transition-all duration-200"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.icon && isValidIconName(cat.icon) ? (
                    <DynamicIcon
                      name={cat.icon}
                      className="size-[18px]"
                      style={{ color: cat.color }}
                    />
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Daily Motivation ──────────────────── */}
      <div className="mt-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Zap className="size-[18px] text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-0.5">
              Daily Inspiration
            </p>
            <p className="text-sm text-zinc-400 italic">
              &quot;The expert in anything was once a beginner.&quot;
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">— Helen Hayes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
