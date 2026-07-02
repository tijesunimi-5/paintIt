// app/(client)/layout.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientGroupDashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  // Core exploratory features navigation links list
  const coreNavigationTabs = [
    { name: "Design Hub", path: "/hub", icon: "🏠" },
    { name: "Explore Painters", path: "/search/painters", icon: "🔍" },
    { name: "Visualizer Canvas", path: "/design", icon: "🎨" },
  ];

  // Dedicated single node configuration reference for profile settings
  const profileTab = { name: "My Profile", path: "/profile-page", icon: "👤" };

  // Mobile navigation combines all paths seamlessly to populate the bottom floating dock bar
  const mobileNavigationTabs = [...coreNavigationTabs, profileTab];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">

      {/* ========================================================== */}
      {/* 🖥️ DESKTOP SIDEBAR NAVIGATION FRAME                          */}
      {/* ========================================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-950 border-r border-neutral-900 p-5 shrink-0 justify-between">

        {/* Top Section: Branding Identity & Exploratory Links */}
        <div className="space-y-6">
          {/* Platform Identity Branding */}
          <div className="px-2">
            <span className="text-sm font-black tracking-widest text-emerald-400 uppercase">PAINTIT</span>
            <span className="text-[10px] font-bold text-neutral-500 ml-1.5 uppercase tracking-wide">Client Portal</span>
          </div>

          {/* Main Core Links Stack */}
          <nav className="space-y-1">
            {coreNavigationTabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${isActive
                      ? "bg-emerald-500 text-black shadow-lg"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                    }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Container Section */}
        <div className="border-t border-neutral-900 pt-4 space-y-1.5">

          {/* ✅ FIXED: Profile action link anchor isolated at the bottom above logout link component */}
          <Link
            href={profileTab.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${pathname === profileTab.path
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
          >
            <span className="text-sm">{profileTab.icon}</span>
            {profileTab.name}
          </Link>

          {/* Log Out Button Trigger */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-950/20 rounded-xl transition-all"
          >
            <span>🚪</span>
            Log Out Account
          </button>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* 📱 MOBILE TOP HEADER CONTROLLER PANEL                      */}
      {/* ========================================================== */}
      <header className="md:hidden w-full bg-neutral-950 border-b border-neutral-900 px-5 py-4 flex items-center justify-between z-40">
        <div>
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">PAINTIT</span>
          <span className="text-[9px] font-bold text-neutral-500 ml-1 uppercase tracking-wide">Hub</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-[10px] font-black uppercase tracking-wider text-red-400 px-2 py-1 bg-red-950/10 border border-red-900/30 rounded-lg"
        >
          Exit
        </button>
      </header>

      {/* ========================================================== */}
      {/* 🚀 CENTRAL OPERATIONAL VIEW DISPLAY CANVAS                 */}
      {/* ========================================================== */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
        {children}
      </main>

      {/* ========================================================== */}
      {/* 📱 MOBILE FLOATING BOTTOM FLOATING DOCK                    */}
      {/* ========================================================== */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-neutral-950/80 backdrop-blur-md border border-neutral-900 rounded-2xl flex items-center justify-around px-2 z-40 shadow-2xl">
        {mobileNavigationTabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${isActive ? "text-emerald-400 font-black scale-105" : "text-neutral-500"
                }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="text-[7px] font-black uppercase tracking-widest mt-0.5 text-center truncate max-w-full px-0.5">
                {tab.name.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}