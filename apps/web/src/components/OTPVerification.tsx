"use client";

import { useState, useEffect } from "react";
import { ArrowRight, RotateCcw, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function OTPVerification() {
  const router = useRouter();
  const {
    pendingEmail,
    isLoading,
    error,
    resendCooldown,
    isAuthenticated,
    verifyOTP,
    resendOTP,
    clearError,
  } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  const handleVerify = async () => {
    if (!pendingEmail || otp.length !== 6) return;
    clearError();
    try {
      await verifyOTP(pendingEmail, otp);
    } catch {
      setOtp("");
    }
  };

  const handleResend = async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    clearError();
    await resendOTP(pendingEmail);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="size-8 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Email Verified!</h2>
          <p className="text-sm text-zinc-400">Redirecting you now…</p>
        </div>
        <div className="w-8 h-1 bg-emerald-500 rounded-full mx-auto animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <Mail className="size-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Verify your email
        </h1>
        <p className="text-sm text-zinc-400">
          We sent a 6-digit code to{" "}
          <span className="text-white font-medium">{pendingEmail}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => {
            clearError();
            setOtp(value);
          }}
          onComplete={handleVerify}
        >
          <InputOTPGroup>
            <InputOTPSlot
              index={0}
              className="w-12 h-14 text-lg font-semibold bg-white/3 border-white/10 text-white rounded-none first:rounded-l-xl"
            />
            <InputOTPSlot
              index={1}
              className="w-12 h-14 text-lg font-semibold bg-white/3 border-white/10 text-white"
            />
            <InputOTPSlot
              index={2}
              className="w-12 h-14 text-lg font-semibold bg-white/3 border-white/10 text-white rounded-none last:rounded-r-xl"
            />
          </InputOTPGroup>
          <InputOTPSeparator className="text-zinc-600" />
          <InputOTPGroup>
            <InputOTPSlot
              index={3}
              className="w-12 h-14 text-lg font-semibold bg-white/3 border-white/10 text-white rounded-none first:rounded-l-xl"
            />
            <InputOTPSlot
              index={4}
              className="w-12 h-14 text-lg font-semibold bg-white/3 border-white/10 text-white"
            />
            <InputOTPSlot
              index={5}
              className="w-12 h-14 text-lg font-semibold bg-white/3 border-white/10 text-white rounded-none last:rounded-r-xl"
            />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={otp.length !== 6 || isLoading}
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
            Verifying…
          </span>
        ) : (
          <>
            Verify email
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>

      {/* Resend */}
      <div className="text-center">
        <p className="text-sm text-zinc-500 mb-2">Didn&apos;t receive the code?</p>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed"
        >
          <RotateCcw className="size-3.5" />
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Resend code"}
        </button>
      </div>
    </div>
  );
}
