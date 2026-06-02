'use client';

import React from 'react';
import { useStudio } from '@/context/StudioContext';
import { PaintPreset } from '@/types/index';
import { motion } from 'framer-motion';

// Ensured strict, non-optional hex definitions to pass the compiler guard parameters perfectly
const clearPresets: PaintPreset[] = [
  { id: 'p1', name: 'Alabaster White', type: 'flat', hex: '#F2EFE9', collection: 'Bright Rooms', description: 'Clean cream white that makes small rooms look bigger.' },
  { id: 'p2', name: 'Desert Sand', type: 'flat', hex: '#C4B199', collection: 'Warm Earth', description: 'Cozy tan shade, great for student hostel accent walls.' },
  { id: 'p3', name: 'Soft Sage Green', type: 'flat', hex: '#9BA498', collection: 'Modern Matte', description: 'Calming green that looks premium and clean.' },
  { id: 'p4', name: 'Charcoal Accent', type: 'flat', hex: '#37393D', collection: 'Bold Finishes', description: 'Dark slate gray, perfect behind beds or TVs.' },
  { id: 'p5', name: 'Ocean Slate Blue', type: 'flat', hex: '#5C6B73', collection: 'Modern Matte', description: 'Deep calming blue that gives a room premium character.' },
];

export default function PaintPicker() {
  const { activeSurface, setSurfaceColor, roomColors } = useStudio();

  // Safeguard: Force a clean string fallback context profile if activeSurface state signature drifts
  const currentActiveSurface = activeSurface || 'wallBack';
  const currentSurfaceColor = roomColors[currentActiveSurface] || '#F2EFE9';

  return (
    <div className="w-full bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl">
      {/* Horizontal Scroll Wrapper */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {clearPresets.map((preset) => {
          // Safeguard: Handle potential missing optional types gracefully using an explicit nullish fallback check
          const targetHex = preset.hex || '#F2EFE9';
          const isSelected = currentSurfaceColor === targetHex;

          return (
            <motion.div
              key={preset.id}
              onClick={() => setSurfaceColor(currentActiveSurface, targetHex)}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 snap-center w-36 p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${isSelected
                  ? 'bg-white border-white text-black shadow-lg shadow-white/5'
                  : 'bg-neutral-950/60 border-neutral-800/80 text-white hover:border-neutral-700'
                }`}
            >
              {/* Color Dot Indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-4 h-4 rounded-full border border-neutral-700/20 shadow-inner shrink-0"
                  style={{ backgroundColor: targetHex }}
                />
                <span className={`text-[11px] font-medium tracking-tight truncate ${isSelected ? 'text-black' : 'text-neutral-300'}`}>
                  {preset.name}
                </span>
              </div>

              {/* Bottom Metadata Info */}
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-[9px] ${isSelected ? 'text-neutral-500' : 'text-neutral-400'} font-light`}>
                  {preset.collection}
                </span>
                <span className={`text-[9px] font-mono ${isSelected ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  {targetHex.toUpperCase()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}