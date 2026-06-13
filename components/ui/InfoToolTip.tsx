// components/ui/InfoTooltip.tsx
"use client";

import React, { useState } from "react";

interface InfoTooltipProps {
  title: string;
  what: string;
  why: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, what, why }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inline-block relative ml-1.5 align-middle">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-3.5 h-3.5 inline-flex items-center justify-center text-[10px] font-black rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
      >
        i
      </button>

      {/* Popover Card Overlay */}
      {isOpen && (
        <>
          {/* Transparent click-away backing overlay layer */}
          <div
            className="fixed inset-0 z-50 bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-1/2 -translate-x-1/2 bottom-5 mb-2 w-56 p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-55 animate-slide-up text-left">
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-neutral-900 border-b border-r border-neutral-800 rotate-45" />

            <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-wide border-b border-neutral-800/60 pb-1.5 mb-1.5">
              💡 {title}
            </h5>
            <div className="space-y-1.5 text-[10px] leading-relaxed text-neutral-300">
              <p>
                <strong className="text-white">What:</strong> {what}
              </p>
              <p>
                <strong className="text-white">Why:</strong> {why}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};