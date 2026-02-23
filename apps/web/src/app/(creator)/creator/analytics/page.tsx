"use client";

import { TrendingUp } from "lucide-react";

export default function CreatorAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track your course performance and audience growth
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
          <TrendingUp className="size-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No data yet
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Analytics data will appear here once you have published courses and
          students start enrolling.
        </p>
      </div>
    </div>
  );
}
