// app/(auth)/reset-password/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ FIX: Move your token validation error banner directly into the initialization block
  // This calculates the initial error state instantly without forcing an effect cascade!
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(
    !token ? { type: "error", msg: "Missing required token access identifier link." } : null
  );

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", msg: "Password verification boundaries do not match." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Credential update failed.");

      setFeedback({ type: "success", msg: data.message });
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server response exception dropped.";
      setFeedback({ type: "error", msg });
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

      {feedback && (
        <div className={`p-3 text-xs rounded-xl border font-medium ${feedback.type === "success"
            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
            : "bg-red-950/20 border-red-900/40 text-red-400"
          }`}>
          {feedback.type === "success" ? "🎉" : "⚠️"} {feedback.msg}
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">New Passphrase</label>
          <input
            type="password"
            required
            disabled={!token || isSubmitting}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Confirm New Passphrase</label>
          <input
            type="password"
            required
            disabled={!token || isSubmitting}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !token || !newPassword}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 text-black disabled:text-neutral-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
        >
          {isSubmitting ? "Updating System Ledger..." : "Commit New Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <Suspense fallback={
        <div className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Mounting Cryptographic Router...</div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}