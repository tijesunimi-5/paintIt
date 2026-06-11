// components/shared/RoleGuard.tsx
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role !== allowedRole) {
        // Safe role isolation fallback router redirection mechanisms
        if (user?.role === 'PAINTER') router.replace('/dashboard');
        else if (user?.role === 'CONSUMER') router.replace('/hub');
        else router.replace('/');
      }
    }
  }, [loading, isAuthenticated, user, allowedRole, router]);

  if (loading || !isAuthenticated || user?.role !== allowedRole) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">
          Verifying secure framework layout access vectors...
        </span>
      </div>
    );
  }

  return <>{children}</>;
};