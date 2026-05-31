'use client';

import React from 'react';
import ComparisonSlider from '../ui/ComparisonSlider';

export default function BeforeAfter() {
  return (
    <section className="py-32 bg-black px-6 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Precision Control</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-6 font-serif">
            A radical shift in presentation clarity.
          </h2>
          <p className="text-neutral-400 font-light text-sm leading-relaxed mb-8">
            Ditch abstract concepts and traditional mockups. Give clients immediate, crystal-clear proof of your spatial and architectural decisions before committing resources.
          </p>
        </div>
        <div className="lg:col-span-8 w-full">
          <ComparisonSlider />
        </div>
      </div>
    </section>
  );
}