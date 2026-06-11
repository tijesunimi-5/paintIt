// app/(painter)/portfolio/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { StepOnboarding } from "@/components/ui/StepOnboarding";
import { PortfolioProject, OnboardingStep } from "@/types/index";

export default function PainterPortfolioPage() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State Layer
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [colorsUsed, setColorsUsed] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Stabilized callback framework layer
  const fetchPortfolioProjects = React.useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/portfolio/projects`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.projects || [];
      }
      return [];
    } catch (err) {
      console.error("Failed to query portfolio project stream:", err);
      return [];
    }
  }, [accessToken, BACKEND_API_URL]);

  // ✅ FIXED: Clean asynchronous execution path to satisfy strict set-state-in-effect rules
  useEffect(() => {
    let isMounted = true;

    const synchronizeStateData = async () => {
      if (accessToken) {
        const fetchedProjects = await fetchPortfolioProjects();
        if (isMounted) {
          setProjects(fetchedProjects);
          setLoading(false);
        }
      } else {
        // Enforce state dispatch out of the primary macro task lane to avoid cascading render alerts
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    synchronizeStateData();

    return () => {
      isMounted = false;
    };
  }, [accessToken, fetchPortfolioProjects]);

  const portfolioSetupSteps: OnboardingStep[] = [
    { id: 1, label: "Click Add Project", description: "Open the submission sheet to insert a new job showcase entry." },
    { id: 2, label: "Fill Work Details", description: "Enter the project name, completion site location, and paint tags used." },
    { id: 3, label: "Upload Finishes", description: "Add image references showing off the precision quality of your work." },
    { id: 4, label: "Publish to Profile", description: "Save to automatically push the project onto your public live timeline catalog." }
  ];

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !location.trim()) {
      showToast({ message: "Project title and location fields are required.", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/portfolio/projects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim(),
          colorsUsed: colorsUsed.split(",").map(c => c.trim()).filter(Boolean),
          images: []
        }),
      });

      if (!response.ok) throw new Error("Failed to write project record into database.");

      showToast({ message: "Portfolio project cataloged successfully!", severity: "success" });

      setTitle("");
      setDescription("");
      setLocation("");
      setColorsUsed("");
      setIsModalOpen(false);

      setLoading(true);
      const updatedProjects = await fetchPortfolioProjects();
      setProjects(updatedProjects);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to record project catalog item.";
      showToast({ message: msg, severity: "error" });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 text-white animate-fade-in max-w-md mx-auto md:max-w-none">

      {/* Dynamic Mobile Header Panel Section Wrapper */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div>
          <h1 className="text-base font-black text-neutral-100">Real Works Catalog</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">Showcase your completed site projects to prospective clients.</p>
        </div>
        {projects.length > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/5"
          >
            + Add Work
          </button>
        )}
      </div>

      {/* Conditional Zero-State Content Loader Block */}
      {projects.length === 0 ? (
        <div className="py-6 flex items-center justify-center">
          <StepOnboarding
            title="Your Catalog is Empty"
            subtitle="Let's build out your digital business profile showcase o! Add your past painting projects to show clients your real-world quality."
            steps={portfolioSetupSteps}
            ctaText="Catalog Your First Job"
            onCtaClick={() => setIsModalOpen(true)}
            estimatedMinutes={2}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2.5">
              <div>
                <h3 className="text-sm font-bold text-neutral-200 truncate">{project.title}</h3>
                <span className="text-[10px] text-neutral-500 font-medium block mt-0.5">📍 {project.location}</span>
              </div>
              {project.description && (
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{project.description}</p>
              )}
              {project.colors_used && project.colors_used.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.colors_used.map((color, idx) => (
                    <span key={idx} className="text-[9px] font-bold bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-md">
                      {color}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile-First Custom Modal Bottom Sheet Overlay Frame */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => !submitting && setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl text-left overflow-hidden animate-slide-up z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black text-neutral-200 tracking-wide mb-4">Catalog New Project Work</h3>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="Modern Duplex Interior"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Location (City/Area)</label>
                <input
                  type="text"
                  required
                  placeholder="Bodija, Ibadan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Paint Codes / Swatches (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Hex Emerald Green, Charcoal White, Satin Trim"
                  value={colorsUsed}
                  onChange={(e) => setColorsUsed(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide premium details about wall prep work, finishing gloss texturing choices, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Save Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}