// app/not-found.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NotFoundPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState<number>(8);

  // Compute the smart redirection target route parameters
  const getRedirectTarget = () => {
    if (!isAuthenticated || !user) return "/";
    if (user.role === "PAINTER") return "/dashboard";
    if (user.role === "CONSUMER") return "/hub";
    return "/";
  };

  const targetPath = getRedirectTarget();

  // Automated fallback countdown tracking mechanism
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(targetPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, targetPath, router]);

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Visual Ambient Background Canvas Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="text-center space-y-5 max-w-sm relative z-10 animate-fade-in">
        {/* Error Structural Status Identifier Code badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-black text-neutral-400">
            Error Code // 404
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
            Space Missing o!
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed px-4">
            The visualization canvas path you are trying to query doesn&apos;t exist or has been shifted permanently.
          </p>
        </div>

        {/* Interactive Radial Progress Action Button Indicator */}
        <div className="py-2">
          <Link
            href={targetPath}
            className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-400 transition-all duration-150 active:scale-[0.98]"
          >
            Return to Safety ({countdown}s)
          </Link>
        </div>

        <div className="pt-2 border-t border-neutral-900/60">
          <span className="text-[9px] text-neutral-600 font-bold tracking-widest uppercase block">
            Auto-routing redirect sequence active
          </span>
        </div>
      </div>
    </div>
  );
}