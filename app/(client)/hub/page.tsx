// app/(client)/hub/page.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StepOnboarding, OnboardingStep } from '@/components/ui/StepOnboarding';

export default function HomeownerClientHubDashboard() {
  const { user } = useAuth();
  const [savedDesigns, setSavedDesigns] = useState([]); // Array data mapping from GET /api/visualizations

  const clientOnboardingSteps: OnboardingStep[] = [
    { id: 1, label: "Explore painter catalogs", description: "Browse verified local painters and contractors active across Ibadan." },
    { id: 2, label: "Open a 3D canvas preset", description: "Select any studio design template from a painter's public timeline portfolio." },
    { id: 3, label: "Remix with custom colors", description: "Change wall combinations in real-time. The painter's original layout stays untouched." },
    { id: 4, label: "Request a project quote", description: "Save your custom color version and send it to the contractor to lock in your job." }
  ];

  const handleExploreMarketplace = () => {
    // Programmatic routing switch to public search gallery
    window.location.href = '/search/designs';
  };

  return (
    <div className="w-full text-white min-h-[80vh] flex flex-col justify-between animate-fade-in">
      {/* Top Banner Context Greetings Section */}
      <div className="mb-6">
        <h1 className="text-xl font-black tracking-tight text-neutral-100">
          Welcome back, <span className="text-emerald-400 font-black">{user?.fullName || 'Homeowner'}</span>!
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">Visualize adjustments, manage project estimates, and connect with decorators.</p>
      </div>

      {/* Dynamic Zero-State Handler Element Grid */}
      {savedDesigns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center my-8">
          <StepOnboarding
            title="Your Design Hub is Empty!"
            subtitle="Follow these quick milestones to remodel your space using interactive 3D color presets."
            steps={clientOnboardingSteps}
            ctaText="Browse Studio Design Templates"
            onCtaClick={handleExploreMarketplace}
            estimatedMinutes={2}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Render list content objects here when lengths are populated */}
          <h3 className="text-sm font-bold text-neutral-400">Saved Room Remixed Presentations</h3>
        </div>
      )}

      {/* Trust Signpost Footer Segment Wrapper */}
      <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between text-xs mt-auto">
        <span className="text-neutral-500 font-medium">Need professional execution assistance?</span>
        <a href="/search/painters" className="text-emerald-400 font-bold hover:underline transition-all">
          Hire Verified Painter →
        </a>
      </div>
    </div>
  );
}