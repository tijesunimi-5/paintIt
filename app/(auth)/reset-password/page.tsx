// app/(auth)/reset-password/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAlert } from "@/context/AlertContext";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAlert();

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Derived state variables directly from the render cycle
  const emailContext = searchParams?.get("email") || null;
  const tokenContext = searchParams?.get("token") || null;
  const hasValidToken = !!(emailContext && tokenContext && tokenContext.length === 6);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || !hasValidToken) return;

    if (password.length < 6) {
      showToast({ message: "Password must be at least 6 characters long.", severity: "error" });
      return;
    }

    if (password !== confirmPassword) {
      showToast({ message: "Passwords do not match.", severity: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailContext,
          otpCode: tokenContext,
          newPassword: password
        }),
      });

      if (response.ok) {
        showToast({ message: "Password updated successfully! Redirecting to login portal.", severity: "success" });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        const data = await response.json();
        showToast({ message: data.error || "Failed to update credentials.", severity: "error" });
      }
    } catch (err) {
      console.error("Authentication override network transaction exception:", err);
      showToast({ message: "Network connection failure.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl text-left space-y-5">
      <div>
        <h2 className="text-lg font-black tracking-tight uppercase text-neutral-100">Configure Password</h2>
        <p className="text-xs text-neutral-500 mt-1">Set up your fresh global entry passphrase configuration below.</p>
      </div>

      {!hasValidToken && (
        <div className="p-3 text-xs rounded-xl border font-medium bg-red-950/20 border-red-900/40 text-red-400">
          ⚠️ Missing required token access identifier link.
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block pl-0.5">
            New Passphrase
          </label>
          <input
            type="password"
            disabled={!hasValidToken}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 disabled:bg-neutral-950 disabled:text-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors placeholder:text-neutral-700 font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block pl-0.5">
            Confirm New Passphrase
          </label>
          <input
            type="password"
            disabled={!hasValidToken}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 disabled:bg-neutral-950 disabled:text-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors placeholder:text-neutral-700 font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword || !hasValidToken}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 text-black disabled:text-neutral-500 text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg mt-2"
        >
          {isSubmitting ? "Committing Passphrase..." : "Commit New Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <Suspense fallback={<div className="text-neutral-500 text-xs uppercase font-mono tracking-widest animate-pulse">Loading secure tokens...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}