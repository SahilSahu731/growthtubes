"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="GrowthTubes Logo" 
            width={50} 
            height={50} 
            className="rounded-lg  shadow-sm"
          />
          <span className="font-bold  text-lg tracking-tight text-white">
            GrowthTubes
          </span>
        </div>
        
        <div className="hidden md:flex gap-10 text-sm font-medium text-zinc-500">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#vision" className="hover:text-white transition-colors">Vision</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        
        <a 
          href="#waitlist"
          className="text-sm font-semibold border border-white/10 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-200"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}
