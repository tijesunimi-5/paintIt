// app/(public)/view/layout.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // ✅ Added to extract dynamic route params safely
import { useAuth } from '@/context/AuthContext';
import { QuickLeadPopup } from '@/components/analytics/QuickLeadPopup'; // ✅ Hooked up the capture popup

export default function PublicMarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const params = useParams(); // ✅ Extract dynamic painter context parameters

  // Pull the unique artist hash key from the active route context mapping
  const painterId = params?.id as string;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col relative">
      {/* Premium Public Marketplace Header */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2">
            <span className="text-emerald-500 font-black text-lg tracking-wider uppercase">
              PaintIt <span className="text-white font-medium text-xs lowercase">Studio</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-neutral-400">
            <Link href="/search/painters" className="hover:text-emerald-400 transition-colors">Find Painters</Link>
            <Link href="/search/designs" className="hover:text-emerald-400 transition-colors">3D Templates</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href={user?.role === 'PAINTER' ? '/dashboard' : '/hub'}
                  className="text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold px-3.5 py-2 rounded-xl transition-all border border-neutral-800"
                >
                  Workspace
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-neutral-500 hover:text-red-400 font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black px-4 py-2 rounded-xl transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Embedded Viewport Frame Output Slot */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* ✅ GLOBAL CAPTURE CONTEXT: Fires on all public view sub-routes cleanly */}
      {painterId && <QuickLeadPopup painterId={painterId} />}
    </div>
  );
}