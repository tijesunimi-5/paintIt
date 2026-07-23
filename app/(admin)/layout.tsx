"use client";

import React from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const navItems = [
    { name: "📊 Analytics Dashboard", path: "/admin/dashboard" },
    { name: "📣 Campaign Broadcasts", path: "/admin/campaigns" },
    { name: "🎨 3D Playground Catalog", path: "/admin/playground" },
  ];

  return (
    <RoleGuard allowedRole="ADMIN">
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-between shrink-0">
          <div>
            {/* Header Brand */}
            <div className="p-6 border-b border-neutral-800/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black tracking-[0.2em] uppercase text-emerald-400">PaintIT Studio</h2>
                <p className="text-[9px] font-mono text-neutral-500 uppercase mt-0.5">Master Admin Hub</p>
              </div>
              <span className="text-xs bg-neutral-800 border border-neutral-750 px-2 py-0.5 rounded text-neutral-400 font-mono">
                v1.2
              </span>
            </div>

            {/* Nav Links */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-neutral-800 border border-neutral-750 text-emerald-400 shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-850 border border-transparent"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Profile Footer */}
          <div className="p-4 border-t border-neutral-800/60 bg-neutral-950/40 flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-[10px] font-black uppercase text-neutral-350 truncate">{user?.fullName || "Administrator"}</p>
              <p className="text-[9px] font-mono text-neutral-600 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-red-950/20 hover:text-red-400 border border-neutral-800 hover:border-red-900/40 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all shrink-0"
              title="Log Out Admin"
            >
              Exit
            </button>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
