// app/(auth)/verify-otp/page.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAlert } from "@/context/AlertContext";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAlert();

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Memoize search query tracking context parameters
  const isRecoveryFlow = useMemo(() => {
    return searchParams?.get("purpose") === "recovery";
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);


  const triggerAutoSubmit = async (completeCode: string) => {
    const verificationEmail = sessionStorage.getItem("paintit_verification_email");

    if (!verificationEmail) {
      showToast({ message: "Verification context missing. Please request a code again.", severity: "error" });
      router.push(isRecoveryFlow ? "/forgot-password" : "/register");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          otpCode: completeCode,
          isRecovery: isRecoveryFlow
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification token submission.");
      }

      showToast({ message: "Code verified successfully!", severity: "success" });

      if (isRecoveryFlow) {
        // ✅ FIX: Pass the context safely through search parameters to ensure it's available instantly on load
        sessionStorage.removeItem("paintit_verification_email");
        router.push(`/reset-password?email=${encodeURIComponent(verificationEmail)}&token=${completeCode}`);
      } else {
        sessionStorage.removeItem("paintit_verification_email");
        router.push("/login");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during verification.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    const singleDigit = value.substring(value.length - 1);
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    const currentFullCode = newOtp.join("");
    if (currentFullCode.length === 6) {
      triggerAutoSubmit(currentFullCode);
      return;
    }

    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").substring(0, 6);

    if (pastedData.length === 6) {
      const pastedArray = pastedData.split("");
      setOtp(pastedArray);

      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
        inputRefs.current[5].blur();
      }

      triggerAutoSubmit(pastedData);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const completeCode = otp.join("");

    if (completeCode.length !== 6) {
      showToast({ message: "Please enter the complete 6-digit verification code.", severity: "error" });
      return;
    }

    await triggerAutoSubmit(completeCode);
  };

  const handleResendOtpCode = async () => {
    const verificationEmail = sessionStorage.getItem("paintit_verification_email");
    if (!verificationEmail) {
      showToast({ message: "Verification context expired. Please clear profile vectors.", severity: "error" });
      return;
    }

    setResending(true);
    try {
      // ✅ FIXED: Routes to forgot password path if resending during account recovery
      const endpoint = isRecoveryFlow ? "/api/auth/forgot-password" : "/api/auth/resend-otp";

      const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      if (!response.ok) throw new Error("Failed to dispatch fresh OTP token.");

      showToast({ message: "A fresh 6-digit code has been sent to your email inbox.", severity: "success" });
      setCountdown(60);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend activation pin.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl text-white text-center">
      <div className="mb-6">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-7.618 3.013C5.4 10.016 7.421 17.152 12 21a11.955 11.955 0 007.618-15.043z" />
          </svg>
        </div>
        <h2 className="text-xl font-black tracking-tight text-neutral-100">Verify Your Account</h2>
        <p className="text-xs text-neutral-500 mt-1.5 px-4">
          Enter the 6-digit security code sent via our email infrastructure.
        </p>
      </div>

      <form onSubmit={handleSubmitVerification} className="space-y-6">
        <div className="grid grid-cols-6 max-w-xs mx-auto gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => { if (el) inputRefs.current[index] = el; }}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-full aspect-[6/7] bg-neutral-950 border border-neutral-800 text-center text-xl font-black text-emerald-400 rounded-xl focus:border-emerald-500 focus:outline-none transition-all flex items-center justify-center p-0"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-black text-sm rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            "Verify Security Key"
          )}
        </button>
      </form>

      <div className="mt-6 text-xs text-neutral-500">
        Didn&apos;t receive the code?{" "}
        {countdown > 0 ? (
          <span className="text-neutral-400 font-medium">Resend in {countdown}s</span>
        ) : (
          <button
            onClick={handleResendOtpCode}
            disabled={resending}
            className="text-emerald-400 font-bold hover:underline bg-transparent border-none outline-none cursor-pointer"
          >
            {resending ? "Dispatching..." : "Resend Code"}
          </button>
        )}
      </div>
    </div>
  );
}