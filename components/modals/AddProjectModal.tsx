"use client";

import React, { useState, useRef } from "react";
import { InfoTooltip } from "@/components/ui/InfoToolTip";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

interface LocalPreview {
  file: File;
  previewUrl: string;
}

export default function AddProjectModal({ isOpen, onClose, onProjectAdded }: AddProjectModalProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [description, setDescription] = useState("");

  // Track local file selections and visual blob URLs for snappy immediate previews
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ==========================================================
  // 📸 LOCAL FILE SELECTION TRACKING HANDLER
  // ==========================================================
  const handleFileSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setErrorBanner(null);
    const updatedPreviews = [...localPreviews];

    for (let i = 0; i < selectedFiles.length; i++) {
      if (updatedPreviews.length >= 4) {
        setErrorBanner("Maximum of 4 showcase images allowed per project.");
        break;
      }

      const file = selectedFiles[i];
      updatedPreviews.push({
        file,
        previewUrl: URL.createObjectURL(file), // Generates local memory URL for the thumbnail grid
      });
    }

    setLocalPreviews(updatedPreviews);

    // Reset inputs so user can select the same file again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeLocalSelectedFile = (indexToRemove: number) => {
    setLocalPreviews((prev) => {
      const target = prev[indexToRemove];
      if (target) URL.revokeObjectURL(target.previewUrl); // Clear browser memory cache allocation
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // ==========================================================
  // 💾 UNIFIED BACKEND FORM DATA DISPATCH CORE
  // ==========================================================
  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorBanner("Project Title and Description parameters are mandatory.");
      return;
    }

    setIsSaving(true);
    setErrorBanner(null);

    // Build multi-part payload container natively supporting string fields and file binaries
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location || "Ibadan, Nigeria");
    formData.append("colorsUsed", colorInput); // Passed as comma text string, split natively on Express server

    // Append raw file blocks matching the target field signature 'files' array on backend
    localPreviews.forEach((previewItem) => {
      formData.append("files", previewItem.file);
    });

    try {
      const response = await fetch("http://localhost:5000/api/portfolio/projects", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
          // ⚠️ CRITICAL note: DO NOT write 'Content-Type': 'multipart/form-data' here! 
          // Leaving it blank lets the browser automatically configure boundary tokens safely.
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details?.[0] || "Server database sync aborted.");
      }

      // Cleanup preview memory loops
      localPreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));

      onProjectAdded();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected execution fault occurred.";
      console.error("💥 Unified Project Creation Fault:", msg);
      setErrorBanner(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-900 rounded-2xl p-6 overflow-y-auto max-h-[90vh] text-left">

        <div className="mb-5">
          <h3 className="text-base font-black tracking-tight text-neutral-100">Catalog New Project Work</h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">Showcase completed real-world projects with photos and paint parameters to prospective clients.</p>
        </div>

        {errorBanner && (
          <div className="mb-4 p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl font-medium">
            ⚠️ {errorBanner}
          </div>
        )}

        <form onSubmit={handleFormSubmission} className="space-y-4">

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Modern Duplex Interior"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Location (City/Area)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Bodija, Ibadan"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">
              Paint Codes / Swatches (Comma Separated)
              <InfoTooltip title="Color Swatches" what="A list of specific color codes or finishes used." why="Helps property owners easily clone or request your exact styling layout parameters." />
            </label>
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="Hex Emerald Green, Charcoal White, Satin Trim"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>

          {/* ========================================================== */}
          {/* 🖼️ HIGH FIDELITY SECURE LOCAL BINARY PICKER DROPZONE       */}
          {/* ========================================================== */}
          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">
              Project Imagery Showcase
              <InfoTooltip title="Project Media" what="Real photos of your completed painting sites." why="Visual proof drives conversions." />
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group w-full h-24 border border-dashed border-neutral-800 hover:border-emerald-500/40 rounded-xl bg-neutral-900/30 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelectionChange}
                className="hidden"
              />
              <span className="text-[11px] font-bold text-neutral-400 group-hover:text-emerald-400 transition-colors">
                📸 Click to select site pictures
              </span>
              <span className="text-[9px] text-neutral-500 font-medium block mt-0.5">Supports PNG, JPG up to 4 images total</span>
            </div>

            {/* Instant UI thumbnail view preview row tracks selection blocks safely */}
            {localPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-2 bg-neutral-900/60 border border-neutral-900 rounded-xl">
                {localPreviews.map((previewItem, index) => (
                  <div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewItem.previewUrl} alt="Selection preview allocation" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLocalSelectedFile(index);
                      }}
                      className="absolute inset-0 bg-red-950/80 text-red-400 text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Project Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide premium details about wall prep work, finishing gloss texturing choices, etc."
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-neutral-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-black disabled:text-neutral-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              {isSaving ? "Uploading & Saving Project..." : "Save Project"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}