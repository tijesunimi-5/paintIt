"use client";
import { motion } from "framer-motion";

const pipeline = [
  { title: "Exterior Optimization", horizon: "Phase 2", desc: "Expanding visual mapping structures over high-rise commercial structures and fence boundaries." },
  { title: "Interior Decoration Modules", horizon: "Phase 2", desc: "Overlay curtain variants, ambient accent lighting channels, and basic soft furnishing components." },
  { title: "Furniture Spatial Placement", horizon: "Phase 3", desc: "Incorporate drag-and-drop dimensions for structural elements like wardrobes and bedding profiles." },
  { title: "AI Color Match Suggestions", horizon: "Phase 3", desc: "Smart contextual recommendations recommending secondary accents based on native room parameters." },
  { title: "Vetted Professional Marketplace", horizon: "Phase 4", desc: "Connecting authenticated homeowners and interior designers directly to premium painters." }
];

export default function FutureVision() {
  return (
    <section className="px-4 max-w-5xl mx-auto opacity-75">
      <div className="max-w-xl mx-auto text-center mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">Long-Term Product Pipeline</h2>
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-300">Future Product Roadmap</p>
        <p className="text-xs text-neutral-500 mt-2 font-normal">We are focusing completely on basic internal room rendering first. Here is what we plan to explore next.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {pipeline.map((item, idx) => (
          <div key={idx} className="p-4 border border-neutral-900 rounded-lg bg-neutral-900/5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] px-2 py-0.5 border border-neutral-800 rounded-sm text-neutral-500 bg-neutral-950 font-mono inline-block mb-3">{item.horizon}</span>
              <h3 className="text-xs font-bold text-neutral-300 mb-1">{item.title}</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-normal">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}