// components/shared/BottomNav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavigationProps {
  items: NavItem[];
}

export const BottomNav: React.FC<NavigationProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <>
      {/* ========================================================== */}
      {/* 🖥️ DESKTOP LEFT SIDEBAR LAYOUT (Hidden on mobile)           */}
      {/* ========================================================== */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-neutral-950 border-r border-neutral-900/80 flex-col p-6 z-30">
        <div className="mb-8 px-2">
          <Link href="/" className="inline-block">
            <span className="text-emerald-500 text-lg font-black tracking-wider uppercase">
              PaintIt <span className="text-white text-xs font-medium lowercase">Studio OS</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5">
          <div className="text-[10px] text-neutral-600 uppercase font-black tracking-widest px-2 mb-3">
            Workspace Panels
          </div>

          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${isActive
                    ? "bg-neutral-900 text-emerald-400 border border-neutral-800"
                    : "text-neutral-500 hover:text-neutral-300 border border-transparent"
                  }`}
              >
                <div className={isActive ? "text-emerald-400" : "text-neutral-600"}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ========================================================== */}
      {/* 📱 MOBILE FLOATING BOTTOM DOCK LAYOUT (Hidden on desktop)   */}
      {/* ========================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/90 to-transparent z-40 px-4 flex items-center justify-center pb-safe-bottom">
        <div className="w-full max-w-sm h-12 bg-neutral-900/80 border border-neutral-800/60 rounded-xl backdrop-blur-md flex items-center justify-around px-2 shadow-2xl">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-all ${isActive
                    ? "text-emerald-400 font-bold"
                    : "text-neutral-500 hover:text-neutral-300"
                  }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {item.label}
                </span>
                {/* Micro-indicator Active Line Accent */}
                {isActive && (
                  <span className="w-4 h-[2px] bg-emerald-400 rounded-full mt-0.5 animate-fade-in" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};