// app/(auth)/login/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { login } = useAuth();
  const { showToast } = useAlert(); // Accesses your exact toast system safely

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleExecuteLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast({ message: "Please enter your email and password.", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password
        }),
      });

      const data = await response.json();

      // Catch common unverified user flows from the database model
      if (response.status === 403 && data.error?.includes("verify")) {
        sessionStorage.setItem("paintit_verification_email", email.toLowerCase().trim());
        showToast({ message: "Account unverified. Redirecting to OTP activation grid.", severity: "info" });
        window.location.href = "/verify-otp";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Authentication handshake rejected.");
      }

      showToast({ message: "Access validated! Syncing system configuration components...", severity: "success" });

      // Fires the AuthContext global state setter function with backend variables map structures
      login(data.accessToken, data.refreshToken, {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name,
        role: data.user.role
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected login security error occurred.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">

      <div className="text-center">
        <h2 className="text-xl font-black tracking-tight text-neutral-100">Sign In to Studio OS</h2>
        <p className="text-xs text-neutral-500 mt-1.5">Manage layout bids, 3D portfolios, and project metrics.</p>
      </div>

      <form onSubmit={handleExecuteLogin} className="space-y-4">

        {/* Email Address Form Target Field Input Slot */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Email Address</label>
          <input
            id="email"
            type="email"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tijesunimi@example.com"
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-sm transition-colors text-white disabled:opacity-50 font-sans"
          />
        </div>

        {/* Password Entry Security Slot */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Password</label>
            <Link href="/forgot-password" className="text-[10px] font-bold text-neutral-500 hover:text-emerald-400 transition-colors uppercase tracking-wider">
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-sm transition-colors text-white disabled:opacity-50"
          />
        </div>

        {/* Action Button Handler Trigger Control Block */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-black text-sm rounded-xl transition-all duration-200 active:scale-[0.99] shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            "Authenticate Workspace Profile"
          )}
        </button>
      </form>

      {/* Visual Workspace Account Type Navigation Routing Signpost Footer */}
      <div className="text-center text-xs text-neutral-500 border-t border-neutral-800/60 pt-4">
        Don&apos;t have an active workspace account?{" "}
        <Link href="/register" className="text-emerald-400 font-bold hover:underline">
          Register Here
        </Link>
      </div>

    </div>
  );
}