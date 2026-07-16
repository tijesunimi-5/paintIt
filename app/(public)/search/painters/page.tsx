// app/(public)/search/painters/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PainterProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string;
  experience_rating: string;
  specialty_tags: string[];
  total_showcases: number;
}

export default function PublicPainterSearchPage() {
  const [painters, setPainters] = useState<PainterProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPublicDirectory = async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/profile/directory/painters`);
        if (res.ok) {
          const data = await res.json();
          setPainters(data.painters || []);
        }
      } catch (err) {
        console.error("Directory hydration error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicDirectory();
  }, [BACKEND_API_URL]);

  const filteredPainters = painters.filter((painter) =>
    painter.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    painter.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white selection:bg-emerald-500 selection:text-black">

      {/* Top Banner Control Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-neutral-100">Verified Pro Contractors</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Explore premium finishes, verified records, and real-time project deep-links.</p>
        </div>

        <input
          type="text"
          placeholder="Search by name or location (e.g., Ibadan)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2.5 bg-neutral-950 border border-neutral-900 rounded-xl text-xs w-full md:max-w-sm focus:outline-none focus:border-emerald-500/30 transition-all text-neutral-200 font-medium"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Reindexing Providers...</span>
        </div>
      ) : filteredPainters.length === 0 ? (

        /* ✅ ULTRAPR_EMIUM ZERO STATE MISS HANDLER CONTAINER */
        <div className="text-center py-16 border border-dashed border-neutral-900 rounded-3xl max-w-md mx-auto bg-neutral-950/10 space-y-4 px-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-900/50 border border-neutral-850 flex items-center justify-center mx-auto text-base shadow-inner select-none">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wide text-neutral-300">
              No Contractors Found for <span className="text-emerald-400 font-mono italic select-all font-bold">&quot;{searchQuery}&quot;</span>
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed max-w-xs mx-auto">
              We couldn&apos;t match that string parameter to any registered locations or company records.
            </p>
          </div>

          {/* Action Helper Link reset anchor */}
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-[10px] bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-emerald-400 font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all select-none"
          >
            ← Clear Parameters & Reset Filter
          </button>
        </div>
      ) : (
        /* Active Listing Cards Row */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPainters.map((painter) => (
            <div
              key={painter.id}
              className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-xs text-emerald-400 tracking-wider overflow-hidden shrink-0 select-none">
                    {painter.avatar_url ? (
                      <img src={painter.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{painter.full_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-neutral-200 group-hover:text-emerald-400 transition-colors uppercase tracking-wide">
                      {painter.full_name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">📍 {painter.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-900/60 text-[10px] font-bold text-neutral-400 select-none">
                  <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 rounded">🛡️ {painter.experience_rating}</span>
                  {painter.total_showcases > 0 && (
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 rounded">📸 {painter.total_showcases} Works</span>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-neutral-900/40">
                <Link
                  href={`/painter/${painter.id}`}
                  className="block w-full py-2.5 bg-neutral-900 hover:bg-emerald-500 border border-neutral-850 hover:border-emerald-500 text-center text-xs font-black uppercase tracking-wider text-neutral-300 hover:text-black rounded-xl transition-all"
                >
                  View Profile & Studio ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}