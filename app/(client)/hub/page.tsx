// app/(client)/hub/page.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StepOnboarding } from '@/components/ui/StepOnboarding';
import { OnboardingStep } from '@/types/index';

export default function HomeownerClientHubDashboard() {
  // ✅ Supposing your context passes a 'loading' or 'isLoading' state flag
  const { user, loading } = useAuth();
  const [savedDesigns] = useState([]);

  const clientOnboardingSteps: OnboardingStep[] = [
    { id: 1, label: "Explore Catalogs", description: "Browse verified local painters and contractors active across Ibadan." },
    { id: 2, label: "Select 3D Preset", description: "Choose a studio design template from a painter's public portfolio." },
    { id: 3, label: "Remix Custom Colors", description: "Change wall combinations in real-time without modifying the original canvas." },
    { id: 4, label: "Request a Quote", description: "Save your remixed scheme and dispatch it to the contractor to lock in a bid." }
  ];

  const handleExploreMarketplace = () => {
    window.location.href = '/search/designs';
  };

  // ==========================================================
  // ⏳ AUTHENTICATION STATE GUARD INTERCEPTOR
  // ==========================================================
  // Prevents the page from crashing while Next.js pulls data out of storage
  if (loading || !user) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center space-y-3 text-white">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600">
          Syncing Client Hub Settings...
        </span>
      </div>
    );
  }

  // ✅ CHECK YOUR KEY NATIVE DEFINITION HERE
  // If your register payload returns 'user.name' instead of 'user.fullName', fall back safely!
  const clientName = user.fullName ?? (user as { name?: string }).name ?? "Homeowner";
  const structuralFirstName = clientName.split(" ")[0];

  return (
    <div className="w-full text-white min-h-[75vh] flex flex-col justify-between animate-fade-in max-w-md mx-auto md:max-w-none">

      {/* Top Header Section */}
      <div className="border-b border-neutral-900 pb-4 mb-4">
        <h1 className="text-base font-black text-neutral-100">
          Welcome back, <span className="text-emerald-400">{structuralFirstName}</span>!
        </h1>
        <p className="text-[11px] text-neutral-500 mt-0.5">Visualize adjustments, manage spaces, and connect with decorators.</p>
      </div>

      {/* Dynamic Zero-State Handler Element Grid */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4">
          <h3 className="text-xs font-bold text-neutral-400">Saved Room Remixed Presentations</h3>
        </div>
      )}

      {/* Mobile-Optimized Action Footer Signpost */}
      <div className="p-3.5 bg-neutral-950 border border-neutral-900/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs mt-auto">
        <span className="text-neutral-500 font-medium text-[11px] text-center sm:text-left">Need professional execution assistance?</span>
        <a href="/search/painters" className="text-emerald-400 font-bold hover:underline transition-all text-xs shrink-0">
          Hire Verified Painter &rarr;
        </a>
      </div>

    </div>
  );
}