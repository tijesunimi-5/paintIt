"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { StepOnboarding } from "@/components/ui/StepOnboarding";
import { OnboardingStep } from "@/types/index";
import { ClientInquiryCard } from "@/components/ui/ClientInquiryCard";

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
  roomColors?: Record<string, string> | null;
}

interface RawBackendLead {
  id: number;
  email: string;
  conversion_source: string;
  meta_tracking_data?: string | Record<string, unknown> | null;
  project_description?: string;
  created_at: string;
  isLocked?: boolean;
}

interface ProfileCompletenessCheck {
  id: string;
  label: string;
  isComplete: boolean;
  nudgeText: string;
}


/* ==========================================================
   MAIN PAINTER DASHBOARD PAGE
   ========================================================== */
export default function PainterDashboardPage() {
  const { user, accessToken, updateUser } = useAuth();
  const { showToast } = useAlert();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics>({ totalProjects: 0, totalImages: 0 });
  const [leads, setLeads] = useState<InboundLead[]>([]);
  const [isPlanQualified] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

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

          if (p.avatar_url) {
            updateUser({ avatarUrl: p.avatar_url, avatar_url: p.avatar_url });
          }
        }

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

        // Fetch client job requests and 3D feedback
        const leadsRes = await fetch(`${BACKEND_API_URL}/api/leads/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          const rawLeads: RawBackendLead[] = leadsData.pipelineLeads || leadsData.leads || [];

          const formattedLeads: InboundLead[] = rawLeads.map((item) => {
            let meta: Record<string, unknown> = {};
            if (typeof item.meta_tracking_data === "string") {
              try {
                meta = JSON.parse(item.meta_tracking_data);
              } catch {
                meta = {};
              }
            } else if (item.meta_tracking_data && typeof item.meta_tracking_data === "object") {
              meta = item.meta_tracking_data as Record<string, unknown>;
            }

            // Real email extraction: check item.client_email, item.email, and meta keys
            const rawEmail = (item as unknown as { client_email?: string }).client_email || item.email || (meta.email as string) || (meta.clientEmail as string) || (meta.client_email as string);
            const resolvedEmail = rawEmail && rawEmail.trim() ? rawEmail.trim() : "client@paintit.app";

            const rawName = (item as unknown as { client_name?: string }).client_name || (meta.clientName as string) || (meta.client_name as string);
            const resolvedName = rawName && rawName.trim() ? rawName.trim() : (resolvedEmail.includes("@") ? resolvedEmail.split("@")[0] : "Interested Client");

            const rawPhone = (item as unknown as { client_phone?: string }).client_phone || (meta.phone as string) || (meta.clientPhone as string) || null;

            return {
              id: item.id,
              client_name: resolvedName,
              client_email: resolvedEmail,
              client_phone: rawPhone,
              project_description:
                item.project_description ||
                (meta.message as string) ||
                "Interested in custom painting services.",
              conversion_source: item.conversion_source,
              created_at: item.created_at,
              isLocked: false, // Always unlock real client contact details for painter
              roomColors: (meta.roomColors as Record<string, string>) || null,
              finish: (meta.finish as string) || null
            } as InboundLead;
          });

          setLeads(formattedLeads);
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

  const userAvatarImageSrc = dbProfile.avatar_url || user?.avatarUrl || user?.avatar_url || null;

  const isProfileCompleted = displayFirstName !== "Painter" && displayFirstName !== "Contractor" && !!targetName;
  const isBioConfigured = !!dbProfile.bio;
  const isLocationConfigured = !!dbProfile.location;
  const hasUploadedWork = contentMetrics.totalProjects > 0 || contentMetrics.totalImages > 0;
  const hasPublishedCanvas = (stats?.designViews || 0) > 0;

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
            <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">Track your page traffic and client messages.</p>
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

              <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-amber-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletenessScore}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pendingOnboardingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl flex items-start gap-3 transition-colors hover:border-neutral-850"
                  >
                    <div className="w-4 h-4 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono text-[9px] font-black text-amber-400 mt-0.5 select-none shrink-0">
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

          {/* Business Counters */}
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
              <a href="/workspace" className="flex-1 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                🎨 Open 3D Canvas
              </a>
              <button
                type="button"
                onClick={() => {
                  const activeUserId = user?.id || user?._id;
                  const profileLink = `${window.location.origin}/painter/${activeUserId}`;
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

            <div className="md:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">Customer Messages & 3D Revisions</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">Job requests, notes, and color feedback sent by clients.</p>
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
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {leads.map((lead) => (
                    <ClientInquiryCard key={lead.id} lead={lead} isPlanQualified={isPlanQualified} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Mini Gallery Stats */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl h-fit">
              <div className="border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">Gallery Stats</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">Your catalog items currently live on your page.</p>
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

                <a
                  href="/portfolio"
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