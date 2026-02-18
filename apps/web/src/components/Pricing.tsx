"use client";

import { Check } from "lucide-react";

export function Pricing() {
  const perks = [
    "Full curriculum access",
    "Expert project review",
    "Founder Discord access",
    "Lifetime updates"
  ];

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-xl mx-auto border border-white/5 rounded-[2rem] p-10 md:p-14 text-center">
        <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4">
          Early Access Offer
        </h2>
        <div className="flex items-center justify-center gap-1 mb-8">
          <span className="text-4xl font-bold text-white">$9</span>
          <span className="text-zinc-500 text-lg">/mo</span>
        </div>
        
        <div className="space-y-3 mb-10 text-left max-w-xs mx-auto">
          {perks.map((perk) => (
            <div key={perk} className="flex gap-3 text-zinc-400 text-sm font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              {perk}
            </div>
          ))}
        </div>

        <a
          href="#waitlist"
          className="block w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all text-center"
        >
          Secure Spot
        </a>
      </div>
    </section>
  );
}
