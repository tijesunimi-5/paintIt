'use client';

import React from 'react';
import MagneticButton from '../ui/MagneticButton';

export default function Hero() {
  const triggerDemoScroll = () => {
    document.getElementById('studio-showcase')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-screen bg-black flex flex-col justify-center items-center px-6 overflow-hidden select-none">

      {/* Premium subtle ambient illumination background background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-neutral-900/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="z-10 text-center max-w-4xl flex flex-col items-center">

        <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-neutral-400 font-bold mb-5">
          The New Standard For Modern Painters & Interior Designers
        </p>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tighter text-white font-serif leading-[1.02] mb-8">
          Win More Bids.<br />
          <span className="text-neutral-400 italic">Eradicate Color Arguments.</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 font-light max-w-lg leading-relaxed mb-12 tracking-tight">
          Stop carrying confusing paper color charts to site meetings. Let hostel owners and private landlords customize their space in full 3D before buying a single bucket of paint.
        </p>

        {/* Clear Call to Action Handles */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
          <MagneticButton onClick={triggerDemoScroll} className="w-full sm:w-auto bg-white text-black border-white hover:bg-neutral-200 py-4 text-center text-sm font-semibold">
            Launch 3D Room Simulator →
          </MagneticButton>
          <MagneticButton
            onClick={() => document.getElementById('value-matrix')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto text-neutral-300 border-neutral-800 bg-transparent hover:bg-neutral-950 py-4 text-center text-sm"
          >
            See Business Value
          </MagneticButton>
        </div>

      </div>

      {/* Interactive Micro-Cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-700">
        <span className="text-[9px] tracking-[0.25em] uppercase font-mono">Scroll Down</span>
        <div className="w-[1px] h-8 bg-neutral-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-neutral-500 animate-pulse" />
        </div>
      </div>
    </section>
  );
}