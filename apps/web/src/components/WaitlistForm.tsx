"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    try {
      // Using Formspree for backend-less email collection
      // Create a free account at formspree.io and replace the ID below
      // You can also use Getform.io or similar services
      const response = await fetch("https://formspree.io/f/xwvnqppw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Waitlist error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] text-center gap-3"
        >
          <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
          <span className="text-sm font-bold text-emerald-500">You&apos;re on the list.</span>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <form onSubmit={handleSubmit} className="flex gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="bg-white text-black font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {status === "loading" ? "..." : "Join"}
            </button>
          </form>
          {status === "error" && (
            <p className="text-[10px] text-red-500 font-bold ml-2">Failed to join. Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
