"use client";

import { BookOpen, Code2, Users } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
    title: "Curated Modules",
    description: "Battle-tested paths in Development, Design, and Business. High signal, zero noise."
  },
  {
    icon: <Code2 className="w-5 h-5 text-blue-500" />,
    title: "Proof of Mastery",
    description: "Build real projects. Get feedback from experts. Verify your skills through action."
  },
  {
    icon: <Users className="w-5 h-5 text-zinc-400" />,
    title: "The Network",
    description: "Learn alongside high-performers. Collaborate, share, and scale your career together."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
