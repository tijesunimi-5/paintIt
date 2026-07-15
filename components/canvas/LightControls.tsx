'use client';

import React from 'react';

export interface BulbState {
  id: string;
  type: "point" | "spot";
  name: string;
  intensity: number;
  color: string;
  enabled: boolean;
  visible?: boolean; // 🎯 Handle DB visible parameter
  position: [number, number, number];
  rotation?: [number, number, number];
  distance?: number;
}

interface LightControlsProps {
  bulbs: BulbState[];
  setBulbs: React.Dispatch<React.SetStateAction<BulbState[]>>;
  isNightMode: boolean;
  setIsNightMode: (val: boolean) => void;
}

export default function LightControls({
  bulbs,
  setBulbs,
  isNightMode,
  setIsNightMode
}: LightControlsProps) {

  const toggleBulb = (id: string) => {
    setBulbs((prev) =>
      prev.map((bulb) => {
        if (bulb.id === id) {
          // Toggle both enabled and visible key attributes to satisfy both structures
          const nextState = bulb.visible !== undefined ? !bulb.visible : !bulb.enabled;
          return { ...bulb, enabled: nextState, visible: nextState };
        }
        return bulb;
      })
    );
  };

  return (
    <div className="space-y-6">

      {/* ☀️ Daylight & Atmosphere Toggles */}
      <div className="space-y-2">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500">Daylight & Atmosphere</span>
          <span className="text-[10px] text-neutral-400 mt-0.5">Toggle ambient illumination structures to show how room colors adapt to lighting shifts.</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsNightMode(false)}
            className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all text-[10px] uppercase font-black tracking-wider ${!isNightMode
                ? "bg-amber-500/10 border-amber-500 text-amber-400"
                : "bg-neutral-900 border-neutral-850 text-neutral-500"
              }`}
          >
            <span>☀️</span> Day Mode
          </button>

          <button
            type="button"
            onClick={() => setIsNightMode(true)}
            className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all text-[10px] uppercase font-black tracking-wider ${isNightMode
                ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                : "bg-neutral-900 border-neutral-850 text-neutral-500"
              }`}
          >
            <span>🌙</span> Night Mode
          </button>
        </div>
      </div>

      {/* 💡 Dynamic Database Bulbs Switcher */}
      <div className="space-y-2 border-t border-neutral-900 pt-4">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500">Active Room Bulbs ({bulbs.length})</span>
          <span className="text-[10px] text-neutral-400 mt-0.5">Toggle active overhead physical fixtures retrieved from your design database.</span>
        </div>

        {bulbs.length === 0 ? (
          <div className="py-4 text-center border border-dashed border-neutral-900 rounded-xl">
            <p className="text-[10px] uppercase font-black text-neutral-600">No Bulb Fixtures Found in DB</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bulbs.map((bulb, index) => {
              const isOn = bulb.visible !== undefined ? bulb.visible : bulb.enabled;
              return (
                <button
                  key={bulb.id}
                  type="button"
                  onClick={() => toggleBulb(bulb.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${isOn
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-neutral-900 border-neutral-850 text-neutral-500"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{isOn ? "💡" : "🔌"}</span>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider">Bulb #{index + 1}</p>
                      <p className="text-[8px] opacity-60 font-mono mt-0.5">INTENSITY: {bulb.intensity} -- {bulb.color}</p>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${isOn ? "bg-emerald-400 animate-pulse" : "bg-neutral-850"}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}