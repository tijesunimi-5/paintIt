"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<UserRole>("PAINTER"); // Defaults securely to Painter OS
  const [submitting, setSubmitting] = useState<boolean>(false);

  const router = useRouter();
  const { showToast } = useAlert();

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleExecuteSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-Side Perimeter Verification Controls
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showToast({ message: "Please fill out all onboarding fields.", severity: "error" });
      return;
    }

    if (password.length < 6) {
      showToast({ message: "Password must be at least 6 characters long.", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      // Clean request payload matching backend model properties precisely
      const response = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account registration loop rejected.");
      }

      // 2. Cache the target email inside browser session memory for verify-otp context access
      sessionStorage.setItem("paintit_verification_email", email.toLowerCase().trim());

      showToast({ message: "Registration successful! Verification token dispatched.", severity: "success" });
      router.push("/verify-otp");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "A network exceptions layout block occurred.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">

      <div className="text-center">
        <h2 className="text-xl font-black tracking-tight text-neutral-100">Create Your Account</h2>
        <p className="text-xs text-neutral-500 mt-1.5">See your colors before the first brush stroke.</p>
      </div>

      <form onSubmit={handleExecuteSignup} className="space-y-4">

        {/* Mobile-First Ergonomic Role Switch Toggles */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Select Account Type</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("PAINTER")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${role === "PAINTER"
                  ? "bg-emerald-500 text-neutral-950 shadow-md"
                  : "text-neutral-400 hover:text-neutral-200"
                }`}
            >
              Professional Painter
            </button>
            <button
              type="button"
              onClick={() => setRole("CONSUMER")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${role === "CONSUMER"
                  ? "bg-emerald-500 text-neutral-950 shadow-md"
                  : "text-neutral-400 hover:text-neutral-200"
                }`}
            >
              Property Owner
            </button>
          </div>
        </div>

        {/* Full Name Input Slot */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Full Name</label>
          <input
            id="fullName"
            type="text"
            required
            disabled={submitting}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Idowu Tijesunimi Samuel"
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-sm transition-colors text-white disabled:opacity-50"
          />
        </div>

        {/* Email Address Input Slot */}
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
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-sm transition-colors text-white disabled:opacity-50"
          />
        </div>

        {/* Security Password Input Slot */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Password</label>
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

        {/* Form Submission Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-black text-sm rounded-xl transition-all duration-200 active:scale-[0.99] shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            "Initialize Account Onboarding"
          )}
        </button>
      </form>

      {/* Clear Signpost Switch Route Link Layout */}
      <div className="text-center text-xs text-neutral-500 border-t border-neutral-800/60 pt-4">
        Already have an active workspace?{" "}
        <Link href="/login" className="text-emerald-400 font-bold hover:underline">
          Sign In
        </Link>
      </div>

    </div>
  );
}