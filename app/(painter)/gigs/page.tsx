// app/(painter)/dashboard/gigs/page.tsx
"use client";

import React, { useState } from "react";

interface FeatureBlueprint {
  icon: string;
  title: string;
  description: string;
  metric: string;
}

export default function UpcomingGigsBoardHub() {
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const futureBlueprints: FeatureBlueprint[] = [
    {
      icon: "🎯",
      title: "Smart Location Matching",
      description: "Get real-time workspace radar alerts immediately when clients in Ibadan post finishing specs near you.",
      metric: "Proximity Alerts"
    },
    {
      icon: "⚡",
      title: "Direct Proposal Engine",
      description: "Pitch custom texture estimates, screeding timelines, and structural cost breakdowns straight to open boards.",
      metric: "1-Click Bidding"
    },
    {
      icon: "💬",
      title: "Real-time Studio Chat",
      description: "Secure cross-side communication layers to negotiate swatches and details before locking down contracts.",
      metric: "Instant Messaging"
    }
  ];

  const triggerNotificationSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setHasSubscribed(true);
      setIsSimulating(false);
    }, 900);
  };

  return (
    <div className="w-full text-white space-y-8 selection:bg-emerald-500 selection:text-black animate-fade-in pb-12">

      {/* 🏷️ SECTION 1: HEADER CONTROLS ZONE */}
      <div className="border-b border-neutral-900 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-neutral-100">Open Gigs Marketplace</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Preview the blueprint for PaintIt&apos;s upcoming open-bidding contractor request ecosystem.
          </p>
        </div>
        <span className="w-fit text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest animate-pulse select-none">
          🚀 Next Major Release Pipeline
        </span>
      </div>

      {/* 💳 SECTION 2: THE MAIN INTERACTIVE HERO BANNER */}
      <div className="relative border border-neutral-900 rounded-3xl p-6 md:p-8 bg-gradient-to-br from-neutral-950 via-neutral-950 to-emerald-950/20 shadow-2xl overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-neutral-900 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl space-y-4 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm shadow-inner select-none">
            🛠️
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black uppercase tracking-wide text-neutral-100">
              Upwork-Style Job Feed is Materializing
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              We are architecting a collaborative open pool where clients can publish architectural room profiles, wall texture preferences, and raw budget parameters. Any verified painter can analyze the request data frames and fire off custom proposals.
            </p>
          </div>

          <div className="pt-2">
            {hasSubscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-fade-in bg-emerald-950/20 border border-emerald-500/20 w-fit px-4 py-2 rounded-xl">
                <span>✓</span> Early Access Lock Activated. We will alert your workspace node on release day!
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerNotificationSimulation}
                disabled={isSimulating}
                className="text-[10px] bg-neutral-100 hover:bg-white text-black font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg active:scale-[99%] disabled:opacity-50"
              >
                {isSimulating ? "Synchronizing Beta Manifest..." : "Notify Me When Feed Goes Live ➔"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📦 SECTION 3: THE SPECIFICATIONS BLUEPRINT MATRIX */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 pl-1">
          Marketplace Operational Blueprints
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {futureBlueprints.map((blueprint, idx) => (
            <div
              key={idx}
              className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-neutral-850 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-sm select-none">
                    {blueprint.icon}
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 font-bold uppercase tracking-wider">
                    {blueprint.metric}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wide text-neutral-200">
                    {blueprint.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed font-medium">
                    {blueprint.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-neutral-900/60 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500/40 select-none">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                Under Construction
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}