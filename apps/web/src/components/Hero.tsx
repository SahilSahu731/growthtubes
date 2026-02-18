"use client";

import { motion } from "framer-motion";
import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  return (
    <section className="relative pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-10">
            Now in Private Beta
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
            Master structured <br />
            <span className="text-zinc-500">skills with projects.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-lg text-zinc-500 font-medium leading-relaxed mb-12">
            The platform for learning intentional skills and building real projects that matter. Join the elite community of builders.
          </p>

          <div id="waitlist" className="max-w-md mx-auto">
            <WaitlistForm />
            <p className="mt-6 text-xs text-zinc-600 font-medium">
              Building the future of education. Join 1,000+ others.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
