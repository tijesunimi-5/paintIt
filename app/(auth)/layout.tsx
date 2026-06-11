// app/(auth)/layout.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function AuthenticationLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 font-sans flex flex-col items-center justify-center relative p-4 overflow-hidden">

      {/* Premium Ambient Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Shared Header Context Brand Mark */}
      <div className="mb-6 text-center animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <span className="text-emerald-500 font-black text-2xl tracking-wider uppercase transition-transform group-hover:scale-[1.01]">
            PaintIt <span className="text-white font-medium text-sm lowercase tracking-tight">Studio OS</span>
          </span>
        </Link>
      </div>

      {/* Main Structural Authorization Card Viewport */}
      <main className="w-full max-w-md relative z-10 bg-neutral-900 border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-transparent to-transparent" />
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Global Minimalist System Guard Footer */}
      <footer className="mt-8 text-[10px] text-neutral-600 font-medium tracking-widest uppercase pointer-events-none select-none z-10">
        Secure Handshake Protocol Enforced // PaintIt Core v1.0
      </footer>
    </div>
  );
}