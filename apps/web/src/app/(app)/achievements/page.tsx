"use client";

import { Trophy, Lock } from "lucide-react";

export default function AchievementsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Trophy className="size-4 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Achievements
          </h1>
          <p className="text-sm text-zinc-400">
            Track your learning milestones
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { name: "First Steps", desc: "Complete your first lesson", emoji: "👣" },
          { name: "Bookworm", desc: "Complete 5 courses", emoji: "📚" },
          { name: "Streak Master", desc: "Maintain a 7-day streak", emoji: "🔥" },
          { name: "Night Owl", desc: "Study after midnight", emoji: "🦉" },
          { name: "Early Bird", desc: "Study before 6 AM", emoji: "🐦" },
          { name: "Perfectionist", desc: "Score 100% on a quiz", emoji: "💎" },
          { name: "Social Butterfly", desc: "Share a course", emoji: "🦋" },
          { name: "Marathoner", desc: "Study 5 hours in a day", emoji: "🏃" },
        ].map((badge) => (
          <div
            key={badge.name}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 text-center opacity-50"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 relative">
              <span className="text-xl">{badge.emoji}</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                <Lock className="size-2.5 text-zinc-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-400">{badge.name}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{badge.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
