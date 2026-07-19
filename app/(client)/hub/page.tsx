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

              // Extract key surfaces for the 3D abstract geometric room mockup preview
              const fallbackWall = parsedColors["wallBack"] || parsedColors["wallLeft"] || parsedColors["wallRight"] || "#5C6B73";
              const fallbackFloor = parsedColors["floor"] || "#C4B199";
              const fallbackCeiling = parsedColors["ceiling"] || "#F2EFE9";

              return (
                <div
                  key={design.id}
                  onClick={() => router.push(`/view/${design.id}`)}
                  className="group bg-neutral-950 border border-neutral-900 hover:border-emerald-500/40 p-4 rounded-2xl flex flex-col justify-between cursor-pointer shadow-xl transition-all duration-200 space-y-4"
                >
                  <div className="space-y-3">

                    {/* 🖼️ ISOMETRIC ABSTRACT IMAGE COMPONENT PREVIEW */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-850 flex items-center justify-center shadow-inner group-hover:border-neutral-800 transition-colors">
                      <div className="absolute inset-0 flex flex-col">
                        {/* Ceiling Component Mapping */}
                        <div
                          className="h-1/4 w-full border-b border-black/10 transition-colors duration-300 shadow-sm"
                          style={{ backgroundColor: fallbackCeiling }}
                        />
                        {/* Interactive Wall Layout Perspective Partition */}
                        <div className="flex-1 flex">
                          <div
                            className="w-1/2 h-full border-r border-black/10 transition-colors duration-300"
                            style={{ backgroundColor: parsedColors["wallLeft"] || fallbackWall }}
                          />
                          <div className="w-1/2 h-full flex flex-col">
                            <div
                              className="h-1/2 w-full transition-colors duration-300"
                              style={{ backgroundColor: parsedColors["wallBack"] || fallbackWall }}
                            />
                            <div
                              className="h-1/2 w-full transition-colors duration-300 border-t border-black/5"
                              style={{ backgroundColor: fallbackFloor }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* HUD Swatch Badge Overlays inside the Preview Frame */}
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-hidden pointer-events-none drop-shadow-md">
                        {Object.entries(parsedColors).slice(0, 4).map(([surface, hex]) => (
                          <div
                            key={surface}
                            className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm shrink-0"
                            style={{ backgroundColor: hex }}
                            title={`${surface}: ${hex}`}
                          />
                        ))}
                      </div>

                      {/* Launch Hover Action Overlay */}
                      <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-[9px] uppercase font-black tracking-widest bg-emerald-500 text-neutral-950 px-2.5 py-1.5 rounded-lg shadow-lg">
                          Launch Canvas
                        </span>
                      </div>
                    </div>

                    {/* 📝 METADATA DETAILS & TITLE INVENTORY */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 block mb-0.5">
                          {design.parent_template_name || "Custom Architecture Preset"}
                        </span>
                        <h4 className="text-xs font-black uppercase tracking-wide text-neutral-100 group-hover:text-emerald-400 transition-colors truncate">
                          {design.name || "Untitled Spatial View Configuration"}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDesign(e, design.id)}
                        disabled={deletingId === design.id}
                        className="text-neutral-600 hover:text-red-400 text-xs p-1 rounded transition-colors shrink-0"
                        title="Delete Design"
                      >
                        {deletingId === design.id ? "⌛" : "🗑️"}
                      </button>
                    </div>

                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60 text-[9px] font-bold text-neutral-500">
                    <span className="font-mono">
                      {new Date(design.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-emerald-400 uppercase tracking-wider group-hover:underline flex items-center gap-0.5">
                      Open Design &rarr;
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