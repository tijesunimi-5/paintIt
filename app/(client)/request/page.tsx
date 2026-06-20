// app/(public)/request/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RequestFormWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extracts the specific painter parameter from the URL query line
  const painterId = searchParams.get("painterId") || "08e04f03-4d8d-44d4-aac7-df458827a04c";

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Form State Values Mapping
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectLocation: "",
    spaceType: "Residential Living Room",
    finishStyle: "Satin Finishes",
    budget: "",
    projectNotes: ""
  });

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const executeFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorBanner(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painterId, ...formData })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to log project specifications parameters.");

      setSuccessState(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network stream transaction failed.";
      setErrorBanner(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successState) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-neutral-950 border border-neutral-900 rounded-3xl p-8 space-y-4 shadow-2xl animate-fade-in text-white">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-xl mx-auto">🎉</div>
        <h2 className="text-base font-black uppercase tracking-wide text-neutral-100">Project Brief Logs Dispatched!</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Your surface remodeling specs have been synchronized straight with the contractor workspace console pipeline o!
        </p>
        <button
          onClick={() => router.push("/search/painters")}
          className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all"
        >
          Return to Marketplace Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-white space-y-6 animate-fade-in pb-16 selection:bg-emerald-500 selection:text-black">

      {/* Structural Stepper Header Tracker */}
      <div className="border-b border-neutral-900 pb-5 text-center sm:text-left flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight text-neutral-100">Consultation Request</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Specify job criteria metrics to extract accurate workspace timelines.</p>
        </div>
        <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-850 text-neutral-400 px-3 py-1 rounded-lg font-black uppercase tracking-widest">
          Step {step} of 3
        </span>
      </div>

      {errorBanner && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl">
          ⚠️ {errorBanner}
        </div>
      )}

      <form onSubmit={executeFormSubmission} className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-5 shadow-2xl">

        {/* STEP 1: CONTACT PIPELINE INFORMATION */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">Communication Credentials</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-neutral-400 block">Your Full Name</label>
              <input
                type="text"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="e.g., Idowu Tijesunimi"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500/30 text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-neutral-400 block">Email Route Node</label>
                <input
                  type="email"
                  name="clientEmail"
                  required
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500/30 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-neutral-400 block">Phone Contact String</label>
                <input
                  type="tel"
                  name="clientPhone"
                  required
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., +234..."
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500/30 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REMODELING SCOPE SELECTORS */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">Workspace & Architectural Matrix</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-neutral-400 block">Target Space Profile</label>
                <select
                  name="spaceType"
                  value={formData.spaceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/30"
                >
                  <option value="Residential Living Room">Residential Interior Room</option>
                  <option value="Full Duplex Transformation">Full Duplex Transformation</option>
                  <option value="Commercial Office Workspace">Commercial Office Studio</option>
                  <option value="Cinematic Accent Wall Structure">Cinematic Accent Structure</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-neutral-400 block">Finishing Texturing Criterias</label>
                <select
                  name="finishStyle"
                  value={formData.finishStyle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/30"
                >
                  <option value="Satin Finishes">Premium Satin / Silk Coat</option>
                  <option value="Stucco Texturing">Velvet Stucco Texturing</option>
                  <option value="POP Screeding Calibration">POP Screeding Calibration</option>
                  <option value="Metallic Epoxy Layers">Metallic Epoxy Coating</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-neutral-400 block">Physical Site Location Coordinates</label>
              <input
                type="text"
                name="projectLocation"
                required
                value={formData.projectLocation}
                onChange={handleInputChange}
                placeholder="e.g., Akobo, Ibadan, Nigeria"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500/30 text-white"
              />
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIAL ESTIMATION & BRIEF NOTES */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">Budgets & Context Notes</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-neutral-400 block">Estimated Allocation Budget (₦)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., 450000"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500/30 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-neutral-400 block">Custom Project Request Overview Details</label>
              <textarea
                name="projectNotes"
                rows={4}
                value={formData.projectNotes}
                onChange={handleInputChange}
                placeholder="Detail spatial layout details, window frame shapes, wall condition errors, or clean-up parameters..."
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500/30 text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Wizard Workflow Control Buttons Container */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-900/60">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 rounded-xl text-neutral-400 hover:text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:bg-neutral-900 disabled:text-neutral-600"
            >
              {isSubmitting ? "Transmitting Specification Data..." : "Dispatch Brief Request ➔"}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

export default function PublicRequestFormWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RequestFormWizardContent />
    </Suspense>
  );
}