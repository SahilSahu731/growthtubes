"use client";

import { Flame, Calendar, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function StreakPage() {
  const { user } = useAuthStore();
  const profile = user?.profile;

  const currentStreak = profile?.streakCount ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;

  // Generate last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      active: i >= 7 - currentStreak, // simple simulation
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Flame className="size-4 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Learning Streak
          </h1>
          <p className="text-sm text-zinc-400">
            Consistency is the key to mastery
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="size-5 text-orange-400" />
            <span className="text-xs text-zinc-500 font-medium">Current</span>
          </div>
          <p className="text-4xl sm:text-5xl font-bold text-white">
            {currentStreak}
          </p>
          <p className="text-xs text-zinc-500 mt-1">days</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-5 text-emerald-400" />
            <span className="text-xs text-zinc-500 font-medium">Best</span>
          </div>
          <p className="text-4xl sm:text-5xl font-bold text-white">
            {longestStreak}
          </p>
          <p className="text-xs text-zinc-500 mt-1">days</p>
        </div>
      </div>

      {/* Week view */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="size-4 text-zinc-500" />
          <p className="text-sm font-medium text-white">This Week</p>
        </div>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-medium">
                {d.day}
              </span>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                  d.active
                    ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30"
                    : "bg-white/5 text-zinc-600"
                }`}
              >
                {d.date}
              </div>
              {d.active && (
                <Flame className="size-3 text-orange-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
