"use client";

import { Heart, Compass } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
          <Heart className="size-4 text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Saved
          </h1>
          <p className="text-sm text-zinc-400">
            Courses and content you&apos;ve saved for later
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-10 sm:p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <Heart className="size-7 text-zinc-600" />
        </div>
        <p className="text-zinc-400 text-sm font-medium mb-1">
          Nothing saved yet
        </p>
        <p className="text-zinc-600 text-xs mb-5">
          Save courses to revisit them later
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/20 transition-colors"
        >
          <Compass className="size-4" />
          Explore Courses
        </Link>
      </div>
    </div>
  );
}
