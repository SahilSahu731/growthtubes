"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";  
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-400">
          Enter your credentials to access your account
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-11 bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/15 text-white rounded-xl transition-colors"
        >
          <FaGoogle className="size-4 mr-2" />
          Google
        </Button>
        <Button
          variant="outline"
          className="h-11 bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/15 text-white rounded-xl transition-colors"
        >
          <FaGithub className="size-4 mr-2" />
          GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <Separator className="bg-white/5" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-zinc-500 uppercase tracking-wider">
          or continue with email
        </span>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-zinc-300">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-10 bg-white/3 border-white/10 rounded-xl text-white placeholder:text-zinc-500transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm text-zinc-300">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pl-10 pr-10 bg-white/3 border-white/10 rounded-xl text-white placeholder:text-zinc-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-colors duration-200 group"
        >
          Sign in
          <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}