'use client';

import React from 'react';
import { motion } from 'framer-motion';

const futurePipeline = [
  { title: 'AI Recommendation Context', tag: 'Prerelease v2' },
  { title: 'Luminance Ray-Tracing Maps', tag: 'R&D Pipeline' },
  { title: 'BIM File Matrix Ingestion', tag: 'Under Construction' },
];

export default function Vision() {
  return (
    <section className="py-32 bg-black px-6 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Future Ecosystem Architecture</p>
        <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-20 max-w-xl font-serif">
          Our upcoming systems map.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {futurePipeline.map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 flex flex-col justify-between h-[200px] hover:border-neutral-800 transition-colors duration-300">
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md self-start">
                {item.tag}
              </span>
              <h3 className="text-lg font-medium text-neutral-200 tracking-tight">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}