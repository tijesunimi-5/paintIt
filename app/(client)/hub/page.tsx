"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { StepOnboarding } from "@/components/ui/StepOnboarding";
import { OnboardingStep } from "@/types/index";

interface SavedVisualization {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: Record<string, string> | string;
  created_at: string;
}

export default function HomeownerClientHubDashboard() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const { showToast } = useAlert();
  const router = useRouter();

  const [savedDesigns, setSavedDesigns] = useState<SavedVisualization[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const clientOnboardingSteps: OnboardingStep[] = [
    { id: 1, label: "Explore Catalogs", description: "Browse verified local painters and contractors active across Ibadan." },
    { id: 2, label: "Select 3D Preset", description: "Choose a studio design template from a painter's public portfolio." },
    { id: 3, label: "Remix Custom Colors", description: "Change wall combinations in real-time without modifying the original canvas." },
    { id: 4, label: "Request a Quote", description: "Save your remixed scheme and dispatch it to the contractor to lock in a bid." }
  ];

  // 🎯 FETCH REAL SAVED VISUALIZATIONS FROM BACKEND
  useEffect(() => {
    const fetchSavedVisualizations = async () => {
      const activeToken =
        accessToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("paintit_access_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken")
          : null);

      if (!activeToken) {
        setIsLoadingData(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${activeToken}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSavedDesigns(data.visualizations || []);
        }
      } catch (err) {
        console.error("Failed fetching client saved designs:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSavedVisualizations();
  }, [accessToken, BACKEND_API_URL]);

  // 🗑️ DELETE SAVED DESIGN
  const handleDeleteDesign = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const activeToken =
      accessToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("paintit_access_token") ||
        localStorage.getItem("token")
        : null);

    if (!activeToken) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/visualizations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setSavedDesigns((prev) => prev.filter((design) => design.id !== id));
        showToast({ message: "Design removed from your Hub.", severity: "success" });
      } else {
        showToast({ message: "Failed to delete design layout.", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Network connection error.", severity: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExploreMarketplace = () => {
    router.push("/search/designs");
  };

  // ⏳ AUTHENTICATION & DATA LOADING GUARD
  if (authLoading || isLoadingData) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center space-y-3 text-white">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600">
          Syncing Client Hub Settings...
        </span>
      </div>
    );
  }

  // Fallback user display identity
  let clientName = "Homeowner";
  if (user) {
    clientName = user.fullName ?? (user as { name?: string }).name ?? user.full_name ?? "Homeowner";
  } else if (typeof window !== "undefined") {
    const rawUser = localStorage.getItem("paintit_user_data");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        clientName = parsed.fullName || parsed.full_name || parsed.name || "Homeowner";
      } catch {
        clientName = "Homeowner";
      }
    }
  }
  const structuralFirstName = clientName.split(" ")[0];

  return (
    <div className="w-full text-white min-h-[75vh] flex flex-col justify-between animate-fade-in max-w-md mx-auto md:max-w-none pb-8 selection:bg-emerald-500 selection:text-black">

      {/* Top Header Section */}
      <div className="border-b border-neutral-900 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-neutral-100">
            Welcome back, <span className="text-emerald-400">{structuralFirstName}</span>!
          </h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Visualize adjustments, manage spaces, and connect with decorators.
          </p>
        </div>
        <button
          onClick={handleExploreMarketplace}
          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 shrink-0"
        >
          + New Design
        </button>
      </div>

      {/* Dynamic Data Handler */}
      {savedDesigns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-4">
          <StepOnboarding
            title="Your Design Hub is Empty!"
            subtitle="Follow these quick milestones to remodel your space using interactive 3D color presets."
            steps={clientOnboardingSteps}
            ctaText="Browse Design Templates"
            onCtaClick={handleExploreMarketplace}
            estimatedMinutes={2}
          />
        </div>
      ) : (
        <div className="space-y-3 my-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
              Saved Room Remixed Presentations ({savedDesigns.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDesigns.map((design) => {
              // Safe parsing for room colors
              let parsedColors: Record<string, string> = {};
              if (typeof design.room_data === "string") {
                try {
                  parsedColors = JSON.parse(design.room_data);
                } catch {
                  parsedColors = {};
                }
              } else if (design.room_data && typeof design.room_data === "object") {
                parsedColors = design.room_data;
              }

              return (
                <div
                  key={design.id}
                  onClick={() => router.push(`/view/${design.id}`)}
                  className="group bg-neutral-950 border border-neutral-900 hover:border-emerald-500/40 p-5 rounded-2xl flex flex-col justify-between cursor-pointer shadow-xl transition-all duration-200 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wide text-neutral-100 group-hover:text-emerald-400 transition-colors truncate max-w-[180px]">
                          {design.name}
                        </h4>
                        <span className="text-[9px] text-neutral-500 font-mono uppercase block mt-0.5">
                          Base: {design.parent_template_name || "Custom Architecture"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDesign(e, design.id)}
                        disabled={deletingId === design.id}
                        className="text-neutral-600 hover:text-red-400 text-xs p-1 rounded transition-colors"
                        title="Delete Design"
                      >
                        {deletingId === design.id ? "⌛" : "🗑️"}
                      </button>
                    </div>

                    {/* Color Swatch Preview Strip */}
                    {Object.keys(parsedColors).length > 0 && (
                      <div className="flex items-center gap-1.5 p-2 bg-neutral-900/50 border border-neutral-850 rounded-xl overflow-x-auto">
                        {Object.entries(parsedColors).slice(0, 5).map(([surface, hex]) => (
                          <div
                            key={surface}
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-inner"
                            style={{ backgroundColor: hex }}
                            title={`${surface}: ${hex}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60 text-[9px] font-bold text-neutral-500">
                    <span className="font-mono">
                      {new Date(design.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-emerald-400 uppercase tracking-wider group-hover:underline flex items-center gap-0.5">
                      Launch 3D Canvas ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile-Optimized Action Footer Signpost */}
      <div className="p-3.5 bg-neutral-950 border border-neutral-900/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs mt-auto">
        <span className="text-neutral-500 font-medium text-[11px] text-center sm:text-left">
          Need professional execution assistance?
        </span>
        <a
          href="/search/painters"
          className="text-emerald-400 font-bold hover:underline transition-all text-xs shrink-0"
        >
          Hire Verified Painter &rarr;
        </a>
      </div>

    </div>
  );
}