"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Vision } from "@/components/Vision";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0b] selection:bg-emerald-500/30">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <Vision />
        <Pricing />
      </main>
      
      <Footer />
    </div>
  );
}
