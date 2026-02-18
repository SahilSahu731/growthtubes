"use client";

import { ShieldCheck } from "lucide-react";

export function Vision() {
  const points = [
    "Structured curriculum for intentional growth",
    "Direct expert feedback on all projects",
    "Community of verified high-performers",
    "Lifetime access to founding content"
  ];

  return (
    <section id="vision" className="py-24 px-6 bg-white/1 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Built on clarity, <br />
              <span className="text-zinc-600">not confusion.</span>
            </h2>
            <p className="text-lg text-zinc-500 leading-relaxed font-medium">
              We spent weeks defining every module before writing a line of code. GrowthTubes is designed to eliminate the anxiety of learning new skills.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 gap-6">
            {points.map((point) => (
              <div key={point} className="flex h-16 items-center gap-4 px-6 rounded-2xl border border-white/5 bg-white/1">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-zinc-400 font-medium text-sm">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
