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

interface ProfileCompletenessCheck {
  id: string;
  label: string;
  isComplete: boolean;
  nudgeText: string;
}

export default function PainterDashboardPage() {
  const { user, accessToken, updateUser } = useAuth();
  const { showToast } = useAlert();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics>({ totalProjects: 0, totalImages: 0 });
  const [leads, setLeads] = useState<InboundLead[]>([]);
  const [isPlanQualified, setIsPlanQualified] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Dedicated dynamic state to pull profile properties straight from the database row
  const [dbProfile, setDbProfile] = useState<{
    bio: string | null;
    location: string | null;
    avatar_url: string | null;
  }>({ bio: null, location: null, avatar_url: null });

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const loadDashboardMasterData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch dynamic profile data directly from your fresh endpoint layout
        const profileRes = await fetch(`${BACKEND_API_URL}/api/profile/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const p = profileData.profile || {};

          setDbProfile({
            bio: p.bio || null,
            location: p.location || null,
            avatar_url: p.avatar_url || null
          });

          // Centralize update immediately synchronizes the welcome block picture globally
          if (p.avatar_url) {
            updateUser({ avatarUrl: p.avatar_url, avatar_url: p.avatar_url });
          }
        }

        // 2. Fetch business performance counters
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
        }

        // 3. Fetch client job requests
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
        console.error("Error updating dashboard details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardMasterData();
  }, [accessToken, BACKEND_API_URL, updateUser]);

  const handleTriggerProfileWizard = () => {
    showToast({ message: "Opening profile setup...", severity: "info" });
    window.location.href = "/profile";
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const targetName = user?.fullName || user?.full_name || "";
  const displayFirstName = targetName.trim() ? targetName.trim().split(" ")[0] : "Painter";
  const nameInitialLetter = targetName.trim() ? targetName.trim().charAt(0).toUpperCase() : "P";

  // Read the active database profile asset link directly
  const userAvatarImageSrc = dbProfile.avatar_url || user?.avatarUrl || user?.avatar_url || null;

  const isProfileCompleted = displayFirstName !== "Painter" && displayFirstName !== "Contractor" && !!targetName;
  const isBioConfigured = !!dbProfile.bio;
  const isLocationConfigured = !!dbProfile.location;
  const hasUploadedWork = contentMetrics.totalProjects > 0 || contentMetrics.totalImages > 0;
  const hasPublishedCanvas = (stats?.designViews || 0) > 0;

  // 📋 SIMPLIFIED LAYMAN PROFILE CHECKS
  const onboardingChecklist: ProfileCompletenessCheck[] = [
    {
      id: "avatar",
      label: "Upload Profile Photo",
      isComplete: !!userAvatarImageSrc,
      nudgeText: "Profiles with a clear photo build immediate trust and get more work from clients."
    },
    {
      id: "location",
      label: "Set Your City or Area",
      isComplete: isLocationConfigured,
      nudgeText: "Helps homeowners find your business when looking for local painters in your area."
    },
    {
      id: "bio",
      label: "Fill Out Your About Description",
      isComplete: isBioConfigured,
      nudgeText: "Describe your professional skills and styling techniques to attract high-paying jobs."
    },
    {
      id: "projects",
      label: "Add Photos of Past Projects",
      isComplete: hasUploadedWork,
      nudgeText: "Showcase real examples of your paint finishes to prove your experience."
    }
  ];

  const pendingOnboardingTasks = onboardingChecklist.filter(item => !item.isComplete);
  const totalOnboardingCount = onboardingChecklist.length;
  const completedOnboardingCount = totalOnboardingCount - pendingOnboardingTasks.length;
  const profileCompletenessScore = Math.round((completedOnboardingCount / totalOnboardingCount) * 100);

  const dashboardSetupSteps: OnboardingStep[] = [
    { id: 1, label: `Fill Out Profile ${isProfileCompleted ? "✅" : ""}`, description: "Enter your personal details." },
    { id: 2, label: `Add Work Photos ${hasUploadedWork ? "✅" : ""}`, description: "Upload examples of your real finishing projects." },
    { id: 3, label: `Publish 3D Design ${hasPublishedCanvas ? "✅" : ""}`, description: "Save a custom color scheme template for clients." },
    { id: 4, label: "Share Profile Link", description: "Send your web link directly to potential clients." }
  ];

  const isBrandNewAccount = !hasUploadedWork && !isProfileCompleted && leads.length === 0 && (!stats || (stats.profileViews === 0 && stats.designViews === 0));

  return (
    <div className="space-y-6 text-white animate-fade-in max-w-md mx-auto md:max-w-none pb-12 selection:bg-emerald-500 selection:text-black">

      {/* Header Context Block */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <a
            href="/profile"
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
            <p className="text-[11px] text-neutral-500 mt-0.5">Track your page traffic and client messages.</p>
          </div>
        </div>
        <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md text-neutral-400 font-bold uppercase tracking-wider select-none">
          Workspace Admin
        </span>
      </div>

      {isBrandNewAccount ? (
        <div className="py-4 flex items-center justify-center">
          <StepOnboarding
            title="Setup Your Profile Dashboard"
            subtitle="Your workspace is currently empty. Follow these simple steps to build your profile and start attracting clients."
            steps={dashboardSetupSteps}
            ctaText="Continue Dashboard Setup"
            onCtaClick={handleTriggerProfileWizard}
            estimatedMinutes={3}
          />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ⚡ SIMPLIFIED PROFILE SETUP RADAR */}
          {pendingOnboardingTasks.length > 0 && (
            <div className="p-5 border border-amber-500/10 bg-linear-to-br from-amber-500/2 via-neutral-950 to-neutral-950 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/2 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5 select-none">
                    ⚠️ Profile Setup Notice
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed max-w-2xl font-medium">
                    Your profile is missing crucial details. Incomplete pages drop lower on the directory list, making it harder for homeowners to discover your business.
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
                  Update Profile Now ➔
                </button>
              </div>
            </div>
          )}

          {/* 📊 4-Column Business Performance Indicator Block */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Profile Views</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.profileViews || 0}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">3D Studio Views</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.designViews || 0}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Saved Designs</span>
              <span className="text-xl font-black text-emerald-400 block mt-0.5">{stats?.savedClones || 0}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Customer Response</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.conversionRate || 0}%</span>
            </div>
          </div>

          {/* Quick Shortcuts Hub */}
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-3 shadow-md">
            <h3 className="text-xs font-bold text-neutral-300 tracking-wide">Quick Actions</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href="/portfolio" className="flex-1 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                📁 Manage Work Photos
              </a>
              <a href="/designs" className="flex-1 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                🎨 Open 3D Canvas
              </a>
              <button
                type="button"
                onClick={() => {
                  const activeUserId = user?.id || user?._id;
                  const profileLink = `${window.location.origin}/view/${activeUserId}`;
                  navigator.clipboard.writeText(profileLink);
                  showToast({ message: "Your business link has been copied to your clipboard.", severity: "success" });
                }}
                className="flex-1 p-3 bg-neutral-900 border border-neutral-800 border-dashed rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
              >
                🔗 Copy Business Page Link
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* ⚡ CLIENT INQUIRIES FEED INBOX MODULE                      */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left Column: Client Messages List */}
            <div className="md:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">Customer Messages</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Job requests and notes sent by clients interested in your services.</p>
                </div>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-full text-neutral-400 font-bold select-none">
                  {leads.length} Inquiries
                </span>
              </div>

              {leads.length === 0 ? (
                <div className="py-12 text-center text-neutral-600 space-y-1">
                  <p className="text-xs font-bold">No messages received yet.</p>
                  <p className="text-[11px] text-neutral-700">Share your business page link on WhatsApp to collect customer requests.</p>
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
                              {lead.client_name || "Interested Homeowner"}
                            </span>
                            <span className={`text-[9px] ml-2 uppercase tracking-widest border px-1.5 py-0.5 rounded ${isPopupLead
                              ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                              : "bg-neutral-950 border-neutral-850 text-neutral-500"
                              }`}>
                              {isPopupLead ? "🎯 Subscriber" : "💼 Job Request"}
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
                              🔒 Upgrade your account plan to unlock this client&apos;s phone number.
                            </span>
                          ) : (
                            <>
                              <span className="text-neutral-400 font-medium">Email: <span className="select-all text-neutral-300 font-mono">{lead.client_email}</span></span>
                              {lead.client_phone && !isPopupLead && (
                                <a
                                  href={`https://wa.me/${lead.client_phone.replace(/\s+/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                                >
                                  💬 Chat on WhatsApp: {lead.client_phone}
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

            {/* Right Column: Mini Project Summary Status Tracker Module */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl h-fit">
              <div className="border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">Gallery Stats</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Your catalog items currently live on your page.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-900/30 border border-neutral-900 rounded-xl">
                  <span className="text-xs text-neutral-400 font-medium">Project Albums</span>
                  <span className="text-xs font-black text-white">{contentMetrics.totalProjects} Items</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900/30 border border-neutral-900 rounded-xl">
                  <span className="text-xs text-neutral-400 font-medium">Uploaded Photos</span>
                  <span className="text-xs font-black text-emerald-400">{contentMetrics.totalImages} Photos</span>
                </div>

                <div className="p-3.5 bg-neutral-900/20 border border-neutral-900 rounded-xl text-[10px] text-neutral-500 leading-relaxed">
                  💡 <span className="text-neutral-400 font-bold">Tip:</span> Keeping your gallery updated with clean work photos helps you attract more local client orders.
                </div>

                <a
                  href="/dashboard/portfolio"
                  className="block w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all mt-2 text-neutral-300"
                >
                  Manage Photos
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}