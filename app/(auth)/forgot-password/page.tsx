// app/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setFeedbackBanner(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mailing interface dropped.");

      setFeedbackBanner({ type: "success", msg: data.message });
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network transaction aborted.";
      setFeedbackBanner({ type: "error", msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-sm bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl text-left space-y-5">
        <div>
          <h2 className="text-lg font-black tracking-tight uppercase text-neutral-100">Recover Account</h2>
          <p className="text-xs text-neutral-500 mt-1">Input your email vector coordinates to route a recovery token stream link.</p>
        </div>

        {feedbackBanner && (
          <div className={`p-3 text-xs rounded-xl border font-medium ${feedbackBanner.type === "success"
              ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
              : "bg-red-950/20 border-red-900/40 text-red-400"
            }`}>
            {feedbackBanner.type === "success" ? "✅" : "⚠️"} {feedbackBanner.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Registered Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="painter@example.com"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 text-black disabled:text-neutral-500 text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg"
          >
            {isSubmitting ? "Routing Token Stream..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-900/40">
          <Link href="/login" className="text-[11px] font-bold text-neutral-500 hover:text-emerald-400 transition-colors uppercase tracking-wider">
            ← Return to portal entry
          </Link>
        </div>
      </div>
    </div>
  );
}