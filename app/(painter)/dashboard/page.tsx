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

interface ContentMetrics {
  totalProjects: number;
  totalImages: number;
}

interface InboundLead {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  project_description: string;
  conversion_source: string;
  created_at: string;
  isLocked?: boolean;
}

// ✅ FIX 1: Explicitly tracking database profile completeness states
interface ProfileCompletenessData {
  bio: string | null;
  location: string | null;
  skills: string[];
}

interface ProfileCompletenessCheck {
  id: string;
  label: string;
  isComplete: boolean;
  nudgeText: string;
}

export default function PainterDashboardPage() {
  const { user, accessToken } = useAuth();
  const { showToast } = useAlert();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics>({ totalProjects: 0, totalImages: 0 });
  const [leads, setLeads] = useState<InboundLead[]>([]);
  const [isPlanQualified, setIsPlanQualified] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ FIX 2: Added state to safely track incoming backend profile metrics
  const [onboardingMeta, setOnboardingMeta] = useState<ProfileCompletenessData>({
    bio: null,
    location: null,
    skills: []
  });

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const loadDashboardMasterData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch KPI Statistics Counters & Project Totals
        const overviewRes = await fetch(`${BACKEND_API_URL}/api/analytics/overview`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          if (overviewData.stats) setStats(overviewData.stats);

          const metricsSource = overviewData.contentMetrics || overviewData.data || {};
          setContentMetrics({
            totalProjects: parseInt(metricsSource.totalProjects || metricsSource.total_projects || "0", 10),
            totalImages: parseInt(metricsSource.totalImages || metricsSource.total_images || "0", 10)
          });

          // ✅ FIX 3: Pull dynamic db fields sent down from your backend overview object fallback
          setOnboardingMeta({
            bio: metricsSource.bio || overviewData.bio || null,
            location: metricsSource.location || overviewData.location || null,
            skills: overviewData.skills || metricsSource.skills || []
          });
        }

        // 2. Fetch Direct Customer Leads Feed Terminal
        const leadsRes = await fetch(`${BACKEND_API_URL}/api/analytics/leads`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(leadsData.leads || []);
          setIsPlanQualified(leadsData.qualified ?? true);
        }

      } catch (err) {
        console.error("Dashboard data pipeline hydration exception:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardMasterData();
  }, [accessToken, BACKEND_API_URL]);

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

  const targetName = user?.fullName || user?.full_name || "";
  const displayFirstName = targetName.trim() ? targetName.trim().split(" ")[0] : "Contractor";
  const nameInitialLetter = targetName.trim() ? targetName.trim().charAt(0).toUpperCase() : "P";
  const userAvatarImageSrc = user?.avatarUrl || user?.avatar_url || null;

  // 🧠 SECURE PROFILE VERIFICATION CALCULATIONS USING EXTRACTED BACKEND VALUES
  const isProfileCompleted = displayFirstName !== "Contractor" && !!targetName;
  const isBioConfigured = !!onboardingMeta.bio;
  const isLocationConfigured = !!onboardingMeta.location;
  const hasUploadedWork = contentMetrics.totalProjects > 0 || contentMetrics.totalImages > 0;
  const hasPublishedCanvas = (stats?.designViews || 0) > 0;

  // 📋 UPDATED CHECKLIST WITH STRONGER UPWORK-STYLE RETENTION COPY
  const onboardingChecklist: ProfileCompletenessCheck[] = [
    {
      id: "avatar",
      label: "Upload Profile Avatar",
      isComplete: !!userAvatarImageSrc,
      nudgeText: "Profiles with clear business branding generate up to 85% higher trust scores o!"
    },
    {
      id: "location",
      label: "Map Operational Base",
      isComplete: isLocationConfigured,
      nudgeText: "Required for visibility in area filter catalogs (e.g., Ibadan, Akobo)."
    },
    {
      id: "bio",
      label: "Write Studio Biography",
      isComplete: isBioConfigured,
      nudgeText: "Explain your finishing techniques to turn catalog traffic into secure job leads."
    },
    {
      id: "projects",
      label: "Publish Showcase Imagery",
      isComplete: hasUploadedWork,
      nudgeText: "Add your real satin or velvet stucco project history entries to unlock validation."
    }
  ];

  const pendingOnboardingTasks = onboardingChecklist.filter(item => !item.isComplete);
  const totalOnboardingCount = onboardingChecklist.length;
  const completedOnboardingCount = totalOnboardingCount - pendingOnboardingTasks.length;
  const profileCompletenessScore = Math.round((completedOnboardingCount / totalOnboardingCount) * 100);

  const dashboardSetupSteps: OnboardingStep[] = [
    { id: 1, label: `Complete Profile ${isProfileCompleted ? "✅" : ""}`, description: "Identity parameters mapped safely." },
    { id: 2, label: `Add Real Work ${hasUploadedWork ? "✅" : ""}`, description: "Upload project imagery to showcase finishes quality." },
    { id: 3, label: `Publish 3D Canvas ${hasPublishedCanvas ? "✅" : ""}`, description: "Create a room color preset layout for clients." },
    { id: 4, label: "Share Your Link", description: "Send your catalog profile directly to clients." }
  ];

  const isBrandNewAccount = !hasUploadedWork && !isProfileCompleted && leads.length === 0 && (!stats || (stats.profileViews === 0 && stats.designViews === 0));

  return (
    <div className="space-y-6 text-white animate-fade-in max-w-md mx-auto md:max-w-none pb-12 selection:bg-emerald-500 selection:text-black">

      {/* Header Context Block */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard/profile"
            className="w-10 h-10 rounded-xl bg-neutral-950 mercantile-border hover:border-emerald-500/30 flex items-center justify-center font-black text-sm text-emerald-400 tracking-wider overflow-hidden transition-all relative group shadow-inner shrink-0 select-none"
          >
            {userAvatarImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatarImageSrc} alt={displayFirstName} className="w-full h-full object-cover" />
            ) : (
              <span>{nameInitialLetter}</span>
            )}
          </a>
          <div>
            <h1 className="text-base font-black text-neutral-100">
              Welcome, <span className="text-emerald-400">{displayFirstName}</span>
            </h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">Track and manage your commercial business metrics.</p>
          </div>
        </div>
        <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md text-neutral-400 font-bold uppercase tracking-wider select-none">
          Painter OS
        </span>
      </div>

      {isBrandNewAccount ? (
        <div className="py-4 flex items-center justify-center">
          <StepOnboarding
            title="Activate Your Dashboard"
            subtitle="Your workspace is currently empty o! Follow these clear steps to set up your profile and start winning bids."
            steps={dashboardSetupSteps}
            ctaText="Continue Profile Setup"
            onCtaClick={handleTriggerProfileWizard}
            estimatedMinutes={3}
          />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ⚡ CANONICAL UPWORK-STYLE COMPLETENESS NUDGE WIDGET */}
          {pendingOnboardingTasks.length > 0 && (
            // ✅ FIX 4: Applied Tailwind CSS v4 canonical updates (bg-linear-to-br & from-neutral-950/2)
            <div className="p-5 border border-amber-500/10 bg-linear-to-br from-amber-500/2 via-neutral-950 to-neutral-950 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/2 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5 select-none">
                    ⚠️ Optimization Deficit Tracker
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed max-w-2xl font-medium">
                    Incomplete profile layouts trigger a decrease in search positioning. Resolve the matching parameters below to maximize visibility when clients query contractors.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Completeness</span>
                  <span className="text-lg font-mono font-black text-amber-400">{profileCompletenessScore}%</span>
                </div>
              </div>

              {/* Progress Slider Track */}
              <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-amber-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletenessScore}%` }}
                />
              </div>

              {/* Action Pending Items Grid Mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pendingOnboardingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl flex items-start gap-3 transition-colors hover:border-neutral-850"
                  >
                    <div className="w-4 h-4 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono text-[9px] font-black text-amber-400 mt-0.5 select-none shrink-0" >
                      !
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-neutral-200 uppercase tracking-wide">{task.label}</h4>
                      <p className="text-[10px] text-neutral-500 leading-relaxed mt-0.5 font-medium">{task.nudgeText}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleTriggerProfileWizard}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Complete Onboarding Deck ➔
                </button>
              </div>
            </div>
          )}

          {/* 📊 4-Column Live KPI Block Grid Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Profile Views</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.profileViews || 0}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Design Views</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.designViews || 0}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Saved Clones</span>
              <span className="text-xl font-black text-emerald-400 block mt-0.5">{stats?.savedClones || 0}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Conversion Velocity</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.conversionRate || 0}%</span>
            </div>
          </div>

          {/* Action Hub Panel */}
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-3 shadow-md">
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
                  const activeUserId = user?.id || user?._id;
                  const profileLink = `${window.location.origin}/painter/${activeUserId}`;
                  navigator.clipboard.writeText(profileLink);
                  showToast({ message: "WhatsApp link copied!", severity: "success" });
                }}
                className="flex-1 p-3 bg-neutral-900 border border-neutral-800 border-dashed rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
              >
                🔗 Copy Business Link
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* ⚡ TWO-COLUMN ANALYTICS METRIC GRID WORKSPACE             */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left Column: Hot Inbound Leads Feed Terminal */}
            <div className="md:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">Hot Customer Inquiries & Leads</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Direct project specs and popup subscribers channeled from your public links.</p>
                </div>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-full text-neutral-400 font-bold select-none">
                  {leads.length} Active
                </span>
              </div>

              {leads.length === 0 ? (
                <div className="py-12 text-center text-neutral-600 space-y-1">
                  <p className="text-xs font-bold">No inquiry responses logged yet o!</p>
                  <p className="text-[11px] text-neutral-700">Share your business profile link on WhatsApp to generate bids.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
                  {leads.map((lead) => {
                    const isPopupLead = lead.conversion_source === "CLIENT_POPUP" || lead.conversion_source === "POPUP_CAPTURE";

                    return (
                      <div
                        key={lead.id}
                        className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-2 transition-colors hover:bg-neutral-900/70"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            <span className="text-xs font-black tracking-tight text-neutral-200">
                              {lead.client_name || "Anonymous Visitor"}
                            </span>
                            <span className={`text-[9px] ml-2 uppercase tracking-widest border px-1.5 py-0.5 rounded ${isPopupLead
                              ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                              : "bg-neutral-950 border-neutral-850 text-neutral-500"
                              }`}>
                              {isPopupLead ? "🎯 Popup Subscriber" : lead.conversion_source?.replace("_", " ")}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-medium">
                            {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <p className="text-[11px] text-neutral-400 leading-relaxed italic bg-black/20 p-2.5 rounded-lg border border-neutral-900/40">
                          &apos;{lead.project_description}&apos;
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] border-t border-neutral-900/60 mt-2">
                          {lead.isLocked || !isPlanQualified ? (
                            <span className="text-neutral-500 font-bold flex items-center gap-1 select-none">
                              🔒 Upgrade to premium tier to view contact credentials o!
                            </span>
                          ) : (
                            <>
                              <span className="text-neutral-400 font-medium">✉️ <span className="select-all text-neutral-300 font-mono">{lead.client_email}</span></span>
                              {lead.client_phone && !isPopupLead && (
                                <a
                                  href={`https://wa.me/${lead.client_phone.replace(/\s+/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                                >
                                  💬 WhatsApp Line: {lead.client_phone}
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Mini Portfolio Quick Status Tracker Module */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl h-fit">
              <div className="border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">Asset Audit Status</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Current index parameters compiled on server.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-900/30 border border-neutral-900 rounded-xl">
                  <span className="text-xs text-neutral-400 font-medium">Showcase Projects</span>
                  <span className="text-xs font-black text-white">{contentMetrics.totalProjects} Items</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900/30 border border-neutral-900 rounded-xl">
                  <span className="text-xs text-neutral-400 font-medium">Cloud Allocations</span>
                  <span className="text-xs font-black text-emerald-400">{contentMetrics.totalImages} Images</span>
                </div>

                <div className="p-3.5 bg-neutral-900/20 border border-neutral-900 rounded-xl text-[10px] text-neutral-500 leading-relaxed">
                  💡 <span className="text-neutral-400 font-bold">Pro Tip:</span> Keeping your project list packed with different techniques like POP screeding or Stucco texturing increases conversion velocity o!
                </div>

                <a
                  href="/dashboard/portfolio"
                  className="block w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all mt-2 text-neutral-300"
                >
                  Edit Showcase Catalog
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}