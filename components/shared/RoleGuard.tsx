// components/shared/RoleGuard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRole }) => {
  const { user, loading: authLoading, accessToken, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [serverVerifying, setServerVerifying] = useState<boolean>(true);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const runGlobalSecurityIntercept = async () => {
      // 🗺️ 1. Omit Public Routes (Bypass checks instantly)
      if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/painter')) {
        setServerVerifying(false);
        return;
      }

      // Wait until AuthContext finishes reading localStorage cookies
      if (authLoading) return;

      // 🔒 2. Absolute Token Check
      if (!accessToken) {
        setServerVerifying(false);
        router.replace('/login');
        return;
      }

      try {
        // 📡 3. Server Status Check (Lightweight endpoint to bypass analytics rate-limiting locks)
        const response = await fetch(`${BACKEND_API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refreshToken: localStorage.getItem('paintit_refresh_token')
          })
        });

        // 🚨 Kick user out instantly if session is revoked or dead on backend!
        if (response.status === 401 || response.status === 403) {
          console.warn("🔒 Stale session token detected. Enforcing system ejection...");
          await logout();
          return;
        }

        // 🛡️ 4. Role Isolation Gatehouse
        if (user?.role !== allowedRole) {
          if (user?.role === 'PAINTER') router.replace('/dashboard');
          else if (user?.role === 'CONSUMER') router.replace('/hub');
          else router.replace('/');
          return;
        }

        setServerVerifying(false);
      } catch (err) {
        console.error("Global guard security handshake failed o:", err);
        // Fallback flag allows rendering during complete network timeouts so app doesn't freeze
        setServerVerifying(false);
      }
    };

    runGlobalSecurityIntercept();
  }, [authLoading, accessToken, user, allowedRole, router, pathname, BACKEND_API_URL, logout]);

  // Combined UX Loading Layout
  if (authLoading || serverVerifying) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">
          Verifying secure framework layout access vectors...
        </span>
      </div>
    );
  }

  // Double check fallback properties prior to commit injection
  if (!accessToken || user?.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
};