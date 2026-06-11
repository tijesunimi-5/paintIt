// app/(painter)/layout.tsx
"use client";

import React from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { BottomNav, NavItem } from "@/components/ui/BottomNav";

export default function PainterDashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // Centralized, precise multi-device site router maps
  const painterNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      label: "Portfolio",
      href: "/portfolio",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Designs",
      href: "/designs",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <RoleGuard allowedRole="PAINTER">
      {/* Balanced layout container with matching responsiveness offsets */}
      <div className="min-h-screen bg-black text-white relative pb-24 md:pb-0 md:pl-64 transition-all duration-200">

        {/* Mount centralized responsive multi-device sidebar / dock engine component */}
        <BottomNav items={painterNavItems} />

        {/* Dynamic Inner Component Dashboard Content Injector Area */}
        <main className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 animate-fade-in">
          {children}
        </main>

      </div>
    </RoleGuard>
  );
}