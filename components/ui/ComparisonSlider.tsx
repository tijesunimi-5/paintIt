'use client';

import React, { useState, useRef } from 'react';

export default function ComparisonSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-[500px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-neutral-900"
    >
      {/* Before Panel */}
      <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
        <div className="absolute top-6 left-6 font-mono text-xs text-neutral-400 bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-sm">BEFORE // RAW CONCRETE</div>
        <h3 className="text-3xl font-serif italic text-neutral-600 tracking-wider">Dull Spatial Context</h3>
      </div>

      {/* After Panel (Revealed via clipping boundary) */}
      <div
        className="absolute inset-0 bg-neutral-100 flex items-center justify-center transition-all duration-75"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <div className="absolute top-6 left-6 font-mono text-xs text-neutral-900 bg-white/60 px-3 py-1.5 rounded-md backdrop-blur-sm">AFTER // PAINTIT INTERIOR</div>
        <h3 className="text-3xl font-serif text-neutral-400 tracking-wider">Refined Atelier Aura</h3>
      </div>

      {/* Physical Slider Split-Line Element */}
      <div
        className="absolute top-0 bottom-0 w-[1px] bg-white z-20 shadow-xl"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-black rounded-full shadow-2xl flex items-center justify-center text-xs font-bold border border-neutral-300">
          ↔
        </div>
      </div>
    </div>
  );
}