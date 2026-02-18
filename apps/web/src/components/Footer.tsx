"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-black text-[10px]">
            <Image src="/logo.png" alt="GrowthTubes Logo" width={80} height={80} className="rounded-lg  shadow-sm"/>
          </div>
          <span className="font-bold text-sm tracking-tight text-white">GrowthTubes</span>
        </div>

        <div className="flex gap-8 text-xs font-medium text-zinc-600">
          <a href="https://x.com/growth_tubes" className="hover:text-white transition-colors">Twitter</a>
          <a href="https://github.com/sahilsahu731" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>

        <p className="text-xs text-zinc-700 font-medium whitespace-nowrap">
          © 2026 GrowthTubes. Built by Sahil Sahu.
        </p>
      </div>
    </footer>
  );
}
