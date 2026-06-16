// components/modals/EditProjectModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { InfoTooltip } from "@/components/ui/InfoToolTip";

interface Project {
  id: string; // 🎯 Change this from number to string!
  title: string;
  description: string | null;
  location: string;
  images: string[];
  colors_used: string[];
  created_at: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null; // This will now match perfectly with your portfolio page!
  onProjectUpdated: () => void;
}

interface SelectedFileItem {
  file: File;
  previewUrl: string;
}

export default function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }: EditProjectModalProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [description, setDescription] = useState("");

  // Existing online image URLs pool
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // Newly chosen local file binaries array
  const [newFiles, setNewFiles] = useState<SelectedFileItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ FIX 1: Safely handle data synchronization from props to local states
  useEffect(() => {
    if (!isOpen) return;

    // Avoid calling setState synchronously inside effect body to prevent
    // cascading renders. Defer state updates to the next tick.
    const id = window.setTimeout(() => {
      if (project) {
        setTitle(project.title);
        setLocation(project.location);
        setColorInput(project.colors_used?.join(", ") || "");
        setDescription(project.description || "");
        setExistingImages(project.images || []);
      } else {
        // Clear out inputs safely if no project model context is present
        setTitle("");
        setLocation("");
        setColorInput("");
        setDescription("");
        setExistingImages([]);
      }
      setNewFiles([]);
      setErrorBanner(null);
    }, 0);

    return () => window.clearTimeout(id);
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalCurrentCount = existingImages.length + newFiles.length;
    const updatedList = [...newFiles];

    for (let i = 0; i < files.length; i++) {
      if (totalCurrentCount + i >= 4) {
        setErrorBanner("Maximum of 4 showcase images allowed per project.");
        break;
      }
      const file = files[i];
      updatedList.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }
    setNewFiles(updatedList);
  };

  // ✅ FIX 2: Fixed naming convention to match invocation inside layout grid row
  const removeSelectedFile = (index: number) => {
    setNewFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorBanner(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location || "Ibadan, Nigeria");
    formData.append("colorsUsed", colorInput);

    // Explicitly forward the trimmed array of retained older images 
    existingImages.forEach((url, i) => formData.append(`images[${i}]`, url));

    // Pass raw file blocks matching the target field signature 'files' array on backend
    newFiles.forEach((item) => formData.append("files", item.file));

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${BACKEND_URL}/api/portfolio/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.details?.[0] || "Update operation failed.");

      newFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
      onProjectUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An execution fault occurred.";
      setErrorBanner(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-900 rounded-2xl p-6 overflow-y-auto max-h-[90vh] text-left">

        <div className="mb-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black tracking-tight text-neutral-100">Edit Catalog Entry</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Correct details or add pictures to your showcase layout record.</p>
          </div>
          <span className="text-[10px] text-neutral-700 font-bold bg-neutral-900 px-2.5 py-1 rounded-md">ID: #{project.id}</span>
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
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">
              Paint Codes / Swatches
              {/* ✅ FIX 3: Utilized your imported InfoTooltip element inside the form UI body */}
              <InfoTooltip title="Color Swatches" what="A list of specific color codes or finishes used." why="Helps property owners easily clone or request your exact styling parameters." />
            </label>
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Manage Media Assets</label>
            <div onClick={() => fileInputRef.current?.click()} className="group w-full h-16 border border-dashed border-neutral-800 hover:border-emerald-500/40 rounded-xl bg-neutral-900/30 flex flex-col items-center justify-center cursor-pointer transition-colors">
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileSelection} className="hidden" />
              <span className="text-[11px] font-bold text-neutral-400 group-hover:text-emerald-400 transition-colors">📸 Append Additional Photos</span>
            </div>

            {/* Media Canvas Gallery Matrix Grid */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Render existing live Cloudinary links */}
              {existingImages.map((url, idx) => (
                <div key={`live-${idx}`} className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Showcase asset" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))} className="absolute inset-0 bg-red-950/80 text-red-400 text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">Delete</button>
                </div>
              ))}
              {/* Render local staging selection pre-views */}
              {newFiles.map((item, idx) => (
                <div key={`local-${idx}`} className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-900 bg-neutral-950 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt="Staging thumbnail" className="w-full h-full object-cover border-b border-emerald-900" />
                  <button type="button" onClick={() => removeSelectedFile(idx)} className="absolute inset-0 bg-red-950/80 text-red-400 text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">Remove</button>
                  <span className="absolute bottom-0 right-0 bg-emerald-500 text-black text-[7px] px-1 font-black uppercase rounded-tl">New</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Project Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors resize-none" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 py-3 bg-neutral-900 text-neutral-400 text-xs font-bold uppercase rounded-xl border border-neutral-800">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-emerald-500 text-black text-xs font-black uppercase rounded-xl shadow-lg">{isSaving ? "Updating Entry..." : "Apply Edits"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}