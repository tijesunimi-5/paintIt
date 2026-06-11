// app/(painter)/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { StepOnboarding } from "@/components/ui/StepOnboarding";
import { OnboardingStep } from "@/types/index";

interface DashboardStats {
  profileViews: number;
  designViews: number;
  savedClones: number;
  conversionRate: number;
}

export default function PainterDashboardPage() {
  const { user, accessToken } = useAuth();
  const { showToast } = useAlert();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/analytics/overview`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Dashboard data query exception:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchDashboardAnalytics();
    }
  }, [accessToken, BACKEND_API_URL]);

  // Streamlined, professional instruction steps
  const dashboardSetupSteps: OnboardingStep[] = [
    { id: 1, label: "Complete Profile", description: "Set your work location and professional skills portfolio." },
    { id: 2, label: "Add Real Work", description: "Upload project imagery to showcase your finish quality." },
    { id: 3, label: "Publish 3D Canvas", description: "Create a room color preset layout for clients to explore." },
    { id: 4, label: "Share Your Link", description: "Send your catalog profile directly to clients via WhatsApp." }
  ];

  const handleTriggerProfileWizard = () => {
    showToast({ message: "Opening profile setup...", severity: "info" });
    window.location.href = "/dashboard/profile";
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isBrandNewAccount = !stats || (stats.profileViews === 0 && stats.designViews === 0);

  return (
    <div className="space-y-5 text-white animate-fade-in max-w-md mx-auto md:max-w-none">

      {/* Header Context Block */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div>
          <h1 className="text-base font-black text-neutral-100">
            Welcome, <span className="text-emerald-400">{user?.fullName?.split(" ")[0] || "Contractor"}</span>
          </h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">Track and manage your commercial business metrics.</p>
        </div>
        <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md text-neutral-400 font-bold uppercase tracking-wider">
          Painter OS
        </span>
      </div>

      {isBrandNewAccount ? (
        <div className="py-4 flex items-center justify-center">
          <StepOnboarding
            title="Activate Your Dashboard"
            subtitle="Your workspace is currently empty o! Follow these clear steps to set up your profile and start winning bids."
            steps={dashboardSetupSteps}
            ctaText="Start Profile Setup"
            onCtaClick={handleTriggerProfileWizard}
            estimatedMinutes={3}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 2-Column Mobile Grid scaling to 4 Columns on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Profile Views</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.profileViews}</span>
            </div>
            <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Design Views</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.designViews}</span>
            </div>
            <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Saved Clones</span>
              <span className="text-xl font-black text-emerald-400 block mt-0.5">{stats?.savedClones}</span>
            </div>
            <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Success Rate</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.conversionRate}%</span>
            </div>
          </div>

          {/* Action Hub Panel */}
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 tracking-wide">Quick Business Actions</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href="/dashboard/portfolio" className="flex-1 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                📁 Manage Portfolio
              </a>
              <a href="/dashboard/designs" className="flex-1 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                🎨 3D Studio Canvas
              </a>
              <button
                type="button"
                onClick={() => {
                  const profileLink = `${window.location.origin}/painter/${user?.id}`;
                  navigator.clipboard.writeText(profileLink);
                  showToast({ message: "WhatsApp link copied!", severity: "success" });
                }}
                className="flex-1 p-3 bg-neutral-900 border border-neutral-800 border-dashed rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
              >
                🔗 Copy Business Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}