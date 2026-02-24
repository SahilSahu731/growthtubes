"use client";

import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center">
          <SettingsIcon className="size-4 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-zinc-400">
            Manage your account preferences
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: "Notifications", desc: "Email and push notification preferences" },
          { label: "Privacy", desc: "Profile visibility and data settings" },
          { label: "Appearance", desc: "Theme, language, and display options" },
          { label: "Billing", desc: "Subscription and payment management" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors cursor-pointer"
          >
            <p className="text-sm font-medium text-white">{item.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
