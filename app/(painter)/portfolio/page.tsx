// app/(painter)/portfolio/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import AddProjectModal from "@/components/modals/AddProjectModal"; // Adjust path to match your file position

interface Project {
  id: number;
  title: string;
  description: string | null;
  location: string;
  images: string[];
  colors_used: string[];
  created_at: string;
}

export default function PainterPortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // ==========================================================
  // 🔄 FETCH DATA STREAM VECTOR
  // ==========================================================
  const fetchContractorProjects = useCallback(async () => {
    setErrorBanner(null);
    try {
      // ✅ FIX: Target the exact key from your browser storage screenshot
      const tokenKey = "paintit_access_token";
      const activeToken = localStorage.getItem(tokenKey);

      if (!activeToken) {
        setErrorBanner("Authentication session token missing. Please sign in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/portfolio/projects`, {
        method: "GET",
        headers: {
          // ✅ Attaches the correct token string
          "Authorization": `Bearer ${activeToken}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Session invalid or expired. Please re-authenticate.");
      }

      if (!response.ok) throw new Error("Failed to load catalog records.");

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database synchronization dropped.";
      setErrorBanner(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Safe async initialization routine satisfies the cascading state rule
  useEffect(() => {
    let isMounted = true;

    const initializeWorkspaceStream = async () => {
      if (isMounted) {
        await fetchContractorProjects();
      }
    };

    initializeWorkspaceStream();

    return () => {
      isMounted = false;
    };
  }, [fetchContractorProjects]);

  return (
    <div className="w-full text-white space-y-6">

      {/* Top Header Management Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-neutral-100">Real Works Catalog</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Showcase your completed site projects with photos and paint parameters to prospective clients.</p>
        </div>

        {projects.length > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.98] shrink-0"
          >
            + Add Work
          </button>
        )}
      </div>

      {errorBanner && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl">
          ⚠️ {errorBanner}
        </div>
      )}

      {/* ========================================================== */}
      {/* ⏳ CORE APP STATE ROUTING INTERCEPTORS                     */}
      {/* ========================================================== */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Syncing Workspace Assets...</span>
        </div>
      ) : projects.length === 0 ? (

        /* ✅ PREMIUM ZERO-STATE HANDLER DISPLAY */
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 border border-dashed border-neutral-900 rounded-2xl bg-neutral-950/20 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl mb-4">
            📸
          </div>
          <h3 className="text-sm font-black text-neutral-200 uppercase tracking-wide">No Projects Cataloged Yet o!</h3>
          <p className="text-xs text-neutral-500 max-w-xs mt-1.5 leading-relaxed">
            Your workspace is completely empty. Upload high-fidelity photos of your real paint jobs to back up your experience metrics.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-5 px-6 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
          >
            Initialize First Showcase
          </button>
        </div>
      ) : (

        /* ========================================================== */
        /* 🎨 HIGH-FIDELITY PORTFOLIO IMAGE DISPLAY GRID               */
        /* ========================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-200"
            >
              <div>
                {/* Visual Image Header Showcase Node */}
                <div className="relative w-full h-48 bg-neutral-900 border-b border-neutral-900 overflow-hidden">
                  {project.images && project.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 bg-neutral-950">
                      <span className="text-2xl mb-1">🎨</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider">No Image Attachments</span>
                    </div>
                  )}

                  {/* Floating Location Badge Element */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-neutral-800/60 rounded-full text-[10px] font-bold tracking-wide text-neutral-300">
                    📍 {project.location}
                  </div>
                </div>

                {/* Content details platform wrapper */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-sm font-black uppercase text-neutral-200 tracking-wide group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                      {project.description || "No project overview layout notes cataloged."}
                    </p>
                  </div>

                  {/* Render Color Swatches Tokens Matrix */}
                  {project.colors_used && project.colors_used.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-neutral-900/60">
                      <span className="text-[9px] uppercase font-black tracking-widest text-neutral-600 block">Colors Used // Swatches</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.colors_used.map((color, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-neutral-900 border border-neutral-800/80 rounded-md text-[10px] text-neutral-400 font-semibold uppercase tracking-wider"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Meta Timeline Anchor Footer */}
              <div className="px-5 py-3.5 bg-neutral-950 border-t border-neutral-900/40 flex items-center justify-between text-[9px] text-neutral-600 font-bold tracking-widest uppercase">
                <span>Showcase Record ID: #{project.id}</span>
                <span>{new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================== */}
      {/* 🚀 MOUNTED POPUP INTERACTION CONTROLLER LAYER              */}
      {/* ========================================================== */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectAdded={fetchContractorProjects}
      />

    </div>
  );
}