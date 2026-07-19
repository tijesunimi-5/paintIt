// components/shared/RoleGuard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types';
import WorkspaceSkeletonLoader from '@/components/ui/WorkspaceSkeletonLoader';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRole }) => {
  const { user, loading: authLoading, accessToken, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [serverVerifying, setServerVerifying] = useState<boolean>(true);

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

      // 🛡️ 3. Role Isolation Gatehouse
      if (user?.role !== allowedRole) {
        if (user?.role === 'PAINTER') router.replace('/dashboard');
        else if (user?.role === 'CONSUMER') router.replace('/hub');
        else router.replace('/');
        return;
      }

      setServerVerifying(false);
    };

    runGlobalSecurityIntercept();
  }, [authLoading, accessToken, user, allowedRole, router, pathname, logout]);

  // Combined UX Loading Layout
  if (authLoading || serverVerifying) {
    return <WorkspaceSkeletonLoader message="Verifying Secure Session Registry..." />;
  }

  // Double check fallback properties prior to commit injection
  if (!accessToken || user?.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
};