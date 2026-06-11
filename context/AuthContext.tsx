// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSessionData, UserRole } from '@/types/index';

interface AuthContextType {
  user: UserSessionData | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, userData: UserSessionData) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Absolute fallback backend origin pointer mapping to your local Express server
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSessionData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // On initialization, verify if a persistent token signature is active inside the client lifecycle
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('paintit_access_token');
      const storedUser = localStorage.getItem('paintit_user_data');

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (token: string, refresh: string, userData: UserSessionData) => {
    setAccessToken(token);
    setUser(userData);

    localStorage.setItem('paintit_access_token', token);
    localStorage.setItem('paintit_refresh_token', refresh);
    localStorage.setItem('paintit_user_data', JSON.stringify(userData));

    // Dynamic role sorting authorization rules routing
    if (userData.role === 'PAINTER') {
      router.push('/dashboard');
    } else if (userData.role === 'CONSUMER') {
      router.push('/dashboard'); // Routes to homeowner workspace layout automatically
    } else {
      router.push('/');
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${BACKEND_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
      }
    } catch (err) {
      console.error("Session logout cleanup communication exception:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('paintit_access_token');
      localStorage.removeItem('paintit_refresh_token');
      localStorage.removeItem('paintit_user_data');
      router.push('/login');
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = localStorage.getItem('paintit_refresh_token');
      if (!currentRefreshToken) throw new Error("No active refresh references available.");

      const response = await fetch(`${BACKEND_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken })
      });

      if (!response.ok) throw new Error("Refresh token lease has expired.");

      const data = await response.json();
      setAccessToken(data.accessToken);
      localStorage.setItem('paintit_access_token', data.accessToken);
      return true;
    } catch (err) {
      setAccessToken(null);
      setUser(null);
      localStorage.clear();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      isAuthenticated: !!accessToken,
      login,
      logout,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth framework call parameter must be nested inside an AuthProvider boundary context module.');
  }
  return context;
};