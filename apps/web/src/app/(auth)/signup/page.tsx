"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import OTPVerification from "@/components/OTPVerification";

// Password strength checks
const passwordChecks = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Special character",
    test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
  },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showChecks, setShowChecks] = useState(false);

  const {
    isLoading,
    error,
    requiresVerification,
    signup,
    clearError,
  } = useAuthStore();

  // Show OTP verification if signup was successful
  if (requiresVerification) {
    return <OTPVerification />;
  }

  const allChecksPassed = passwordChecks.every((c) => c.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !allChecksPassed) return;
    clearError();
    try {
      await signup(email, password, name || undefined);
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create your account
        </h1>
        <p className="text-sm text-zinc-400">
          Start your learning journey with GrowthTubes
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

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-zinc-300">
            Full name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              id="name"
              type="text"
              placeholder="Sahil Sahu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 pl-10 bg-white/3 border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
            />
          </div>
        </div>

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
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              required
              className="h-11 pl-10 bg-white/3 border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-zinc-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setShowChecks(true);
                clearError();
              }}
              required
              className="h-11 pl-10 pr-10 bg-white/3 border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
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

          {/* Password strength checks */}
          {showChecks && password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {passwordChecks.map((check) => {
                const passed = check.test(password);
                return (
                  <div
                    key={check.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    {passed ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <X className="size-3.5 text-zinc-600" />
                    )}
                    <span
                      className={
                        passed ? "text-emerald-400" : "text-zinc-500"
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email || !allChecksPassed}
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin size-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating account…
            </span>
          ) : (
            <>
              Create account
              <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-zinc-500 leading-relaxed">
          By signing up, you agree to our{" "}
          <Link
            href="/terms"
            className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}