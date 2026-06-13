// components/shared/BottomNav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
  const { user, logout } = useAuth();

  return (
    <>
      {/* ========================================================== */}
      {/* 🖥️ DESKTOP LEFT SIDEBAR LAYOUT                           */}
      {/* ========================================================== */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-neutral-950 border-r border-neutral-900/80 flex-col justify-between p-5 z-30">
        <div className="w-full">
          <div className="mb-8 px-2">
            <Link href="/dashboard" className="inline-block">
              <span className="text-emerald-500 text-lg font-black tracking-wider uppercase">
                PaintIt <span className="text-white text-xs font-medium lowercase">Studio OS</span>
              </span>
            </Link>
          </div>

          <nav className="space-y-1.5">
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
        </div>

        {/* 👤 NEW: Desktop Sidebar Profile & Account Management Footer Footer */}
        <div className="border-t border-neutral-900 pt-4 space-y-3">
          <Link
            href="/profile"
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all border ${pathname === "/profile"
                ? "bg-neutral-900 border-neutral-800"
                : "border-transparent hover:bg-neutral-900/40"
              }`}
          >
            {/* Minimalistic Alpha Character Avatar Profile Circle */}
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black uppercase shrink-0">
              {user?.fullName ? user.fullName.charAt(0) : "P"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-neutral-200 truncate leading-tight">
                {user?.fullName || "Active Contractor"}
              </h4>
              <span className="text-[9px] text-neutral-500 font-bold tracking-wider uppercase truncate block mt-0.5">
                View Profile Settings
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 bg-neutral-950 hover:bg-red-950/20 border border-neutral-900 hover:border-red-900/30 text-neutral-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            LOG OUT
          </button>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* 📱 MOBILE FLOATING BOTTOM DOCK LAYOUT                   */}
      {/* ========================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/90 to-transparent z-40 px-4 flex items-center justify-center pb-safe-bottom">
        <div className="w-full max-w-sm h-12 bg-neutral-900/80 border border-neutral-800/60 rounded-xl backdrop-blur-md flex items-center justify-around px-1 shadow-2xl">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-all ${isActive ? "text-emerald-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
                  }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-4 h-[2px] bg-emerald-400 rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* ✅ MOBILE ADDITION: Explicit direct route hook for Profile configuration */}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-all ${pathname === "/profile" ? "text-emerald-400 font-bold" : "text-neutral-500"
              }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider">Profile</span>
            {pathname === "/dashboard/profile" && (
              <span className="w-4 h-[2px] bg-emerald-400 rounded-full mt-0.5" />
            )}
          </Link>
        </div>
      </div>
    </>
  );
};