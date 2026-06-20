// app/(public)/search/design/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

interface DesignTemplate {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string;
  polygons_count: string;
  lighting_setup: string;
  popularity_score: number;
}

export default function PublicDesignTemplatesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Hardcoded premium mock architecture layers matching your MVP vision
  const availableTemplates: DesignTemplate[] = [
    {
      id: "tmpl_living_lux",
      title: "Luxury Minimalist Living Room",
      category: "INTERIOR",
      thumbnail_url: "🛋️",
      polygons_count: "42k Polys",
      lighting_setup: "Cinematic Day/Studio",
      popularity_score: 98
    },
    {
      id: "tmpl_bed_nordic",
      title: "Nordic Executive Bedroom Layout",
      category: "INTERIOR",
      thumbnail_url: "🛏️",
      polygons_count: "29k Polys",
      lighting_setup: "Soft Ambient Evening",
      popularity_score: 89
    },
    {
      id: "tmpl_office_corp",
      title: "Corporate Creative Studio Office",
      category: "COMMERCIAL",
      thumbnail_url: "🏢",
      polygons_count: "56k Polys",
      lighting_setup: "High-Key Daylight Panels",
      popularity_score: 92
    },
    {
      id: "tmpl_accent_cinematic",
      title: "POP Screeding Accent Geometric Wall",
      category: "ACCENT",
      thumbnail_url: "📐",
      polygons_count: "12k Polys",
      lighting_setup: "Directional Spotlights",
      popularity_score: 95
    }
  ];

  const filteredTemplates = availableTemplates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.lighting_setup.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white selection:bg-emerald-500 selection:text-black animate-fade-in pb-16">

      {/* 🏷️ CONTROL LAYER: HEADERS & PARAMETER FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-neutral-100">3D Workspace Templates</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Select an interactive 3D model architecture scene to experiment with dynamic texture swatches and color schemes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-xl">
          {/* Category Quick Filter Segments */}
          <div className="flex bg-neutral-950 border border-neutral-900 p-1 rounded-xl w-full sm:w-auto shrink-0">
            {["ALL", "INTERIOR", "COMMERCIAL", "ACCENT"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all w-full sm:w-auto text-center ${selectedCategory === cat
                  ? "bg-neutral-900 text-emerald-400 border border-neutral-800"
                  : "text-neutral-500 hover:text-neutral-300"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search spatial templates (e.g., Luxury, Ambient)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 bg-neutral-950 border border-neutral-900 rounded-xl text-xs w-full focus:outline-none focus:border-emerald-500/30 transition-all text-neutral-200 font-medium"
          />
        </div>
      </div>

      {/* 📦 GRID CONTAINER LAYER */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-900 rounded-3xl max-w-md mx-auto bg-neutral-950/10 space-y-3">
          <span className="text-xl">📐</span>
          <h3 className="text-xs font-black uppercase tracking-wide text-neutral-300">No Environment Matches</h3>
          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
            We couldn&apos;t find any 3D layout geometries matching your active search string parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-200"
            >
              <div className="space-y-4">
                {/* 3D Scene Interactive Mock Canvas Box */}
                <div className="w-full h-40 bg-neutral-900 border border-neutral-850 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group-hover:border-neutral-700 transition-colors shadow-inner select-none">
                  <div className="absolute top-0 right-0 p-2.5">
                    <span className="text-[9px] font-mono bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {template.category}
                    </span>
                  </div>

                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
                    {template.thumbnail_url}
                  </span>

                  <span className="text-[9px] font-mono tracking-widest uppercase font-black text-neutral-600 mt-3 block">
                    [ Click to Initialize Canvas ]
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-neutral-200 group-hover:text-emerald-400 transition-colors uppercase tracking-wide">
                    {template.title}
                  </h3>

                  {/* Performance Specs & Parameters */}
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-neutral-500 select-none">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 rounded-md">
                      ⚙️ {template.polygons_count}
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 rounded-md">
                      💡 {template.lighting_setup}
                    </span>
                  </div>
                </div>
              </div>

              {/* Viewport Initializer Core Link Trigger */}
              <div className="pt-5 mt-4 border-t border-neutral-900/60">
                <Link
                  href={`/workspace?template=${template.id}`}
                  className="block w-full py-2.5 bg-neutral-900 hover:bg-emerald-500 border border-neutral-850 hover:border-emerald-500 text-center text-xs font-black uppercase tracking-wider text-neutral-300 hover:text-black rounded-xl transition-all shadow-inner"
                >
                  Load 3D Environment Studio ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}