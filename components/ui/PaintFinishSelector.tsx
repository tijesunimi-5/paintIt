"use client";

import React from "react";
import { PAINT_FINISH_PRESETS, PaintFinishId } from "@/config/paintFinishes";

interface PaintFinishSelectorProps {
  currentFinish: PaintFinishId;
  onChangeFinish: (finish: PaintFinishId) => void;
}

export function PaintFinishSelector({
  currentFinish,
  onChangeFinish,
}: PaintFinishSelectorProps) {
  const finishes: PaintFinishId[] = ["EMULSION", "SATIN", "GLOSS"];

  return (
    <div className="space-y-2 bg-neutral-950/80 backdrop-blur-md p-3 rounded-2xl border border-neutral-900 shadow-xl max-w-md w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
          Wall Paint Sheen & Finish
        </span>
        <span className="text-[9px] font-mono text-neutral-500 uppercase">
          {PAINT_FINISH_PRESETS[currentFinish].badge}
        </span>
      </div>

      {/* Segmented Control Track */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900/90 border border-neutral-850 rounded-xl">
        {finishes.map((id) => {
          const preset = PAINT_FINISH_PRESETS[id];
          const isActive = currentFinish === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeFinish(id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 select-none ${isActive
                  ? "bg-neutral-800 border border-neutral-700 text-emerald-400 shadow-md scale-[1.02]"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50"
                }`}
            >
              {/* Micro Visual Sheen Preview Swatch */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full border transition-all ${id === "EMULSION"
                      ? "bg-neutral-600 border-neutral-500 shadow-none"
                      : id === "SATIN"
                        ? "bg-gradient-to-tr from-neutral-600 to-neutral-300 border-white/40 shadow-sm"
                        : "bg-white border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    }`}
                />
                <span className="text-xs font-black tracking-tight">
                  {preset.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtitle Description Nudge */}
      <p className="text-[10px] text-neutral-400 font-medium px-1 text-center sm:text-left animate-fade-in">
        💡 {PAINT_FINISH_PRESETS[currentFinish].subtitle}
      </p>
    </div>
  );
}