'use client';

import React, { useState } from 'react';

export interface CustomColor {
  name: string;
  hex: string;
}

interface PaintPickerProps {
  activeSurface: string;
  roomColors: Record<string, string>;
  setRoomColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customColors: CustomColor[];
  setCustomColors: React.Dispatch<React.SetStateAction<CustomColor[]>>;
}

export default function PaintPicker({
  activeSurface,
  roomColors,
  setRoomColors,
  customColors,
  setCustomColors
}: PaintPickerProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#10B981");

  const presets = [
    { name: "Alabaster White", hex: "#F2EFE9" },
    { name: "Desert Sand", hex: "#C4B199" },
    { name: "Soft Sage", hex: "#9BA498" },
    { name: "Slate Grey", hex: "#5C6B73" },
    { name: "Charcoal Black", hex: "#37393D" }
  ];

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim() || !newColorHex.trim()) return;

    let formattedHex = newColorHex.trim();
    if (!formattedHex.startsWith("#")) {
      formattedHex = `#${formattedHex}`;
    }

    const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    if (!hexRegex.test(formattedHex)) {
      alert("Please enter a valid Hex color code (e.g., #FFBF00 or F2EFE9)");
      return;
    }

    const newColor: CustomColor = {
      name: newColorName.trim(),
      hex: formattedHex
    };

    setCustomColors((prev) => [...prev, newColor]);
    setRoomColors((prev) => ({ ...prev, [activeSurface]: formattedHex }));

    setNewColorName("");
    setNewColorHex("#10B981");
  };

  // Helper to format surface names cleanly for the HUD (e.g., "wallLeft" -> "WALL LEFT")
  const formatSurfaceName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* 🎯 ACTIVE SURFACE TARGET HUD */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-[8px] uppercase font-black text-neutral-500 tracking-wider block">Currently Painting</span>
          <span className="text-xs font-black uppercase text-emerald-400 tracking-wide">
            {formatSurfaceName(activeSurface)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-neutral-700 shadow-inner"
            style={{ backgroundColor: roomColors[activeSurface] || '#ffffff' }}
          />
          <span className="text-[9px] font-mono text-neutral-400">
            {(roomColors[activeSurface] || '#FFFFFF').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Preset Decks */}
      <div className="space-y-2">
        <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500">Preset Decks</span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {presets.map((preset) => {
            const isSelected = roomColors[activeSurface] === preset.hex;
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setRoomColors((prev) => ({ ...prev, [activeSurface]: preset.hex }))}
                className={`snap-center shrink-0 w-28 p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${isSelected ? "bg-white border-white text-neutral-950" : "bg-neutral-900 border-neutral-850 text-white"
                  }`}
              >
                <div className="w-5 h-5 rounded-full border border-neutral-800" style={{ backgroundColor: preset.hex }} />
                <span className="text-[9px] font-black truncate mt-2">{preset.name}</span>
                <span className="text-[8px] font-mono mt-0.5 opacity-60">{preset.hex}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Mixer */}
      <div className="border-t border-neutral-900 pt-3">
        <form onSubmit={handleAddCustomColor} className="space-y-3">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 block">Mix Custom Color</span>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Color Name (e.g. Dulux Amber Glow)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
              />
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-10 h-9 bg-transparent border border-neutral-850 rounded-xl cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-mono">#</span>
                <input
                  type="text"
                  placeholder="HEX Code (e.g. FFBF00)"
                  value={newColorHex.replace("#", "")}
                  onChange={(e) => setNewColorHex(`#${e.target.value}`)}
                  maxLength={6}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-6 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white font-mono uppercase tracking-wider"
                />
              </div>
              <button
                type="submit"
                className="px-5 bg-emerald-500 text-neutral-950 font-black rounded-xl text-[10px] uppercase tracking-wider"
              >
                Add Color
              </button>
            </div>
          </div>
        </form>

        {customColors.length > 0 && (
          <div className="space-y-2 mt-4">
            <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 block">My Custom Swatches</span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {customColors.map((color, index) => {
                const isSelected = roomColors[activeSurface] === color.hex;
                return (
                  <button
                    key={`${color.hex}-${index}`}
                    type="button"
                    onClick={() => setRoomColors((prev) => ({ ...prev, [activeSurface]: color.hex }))}
                    className={`shrink-0 flex items-center gap-2 border p-2 rounded-xl text-[10px] transition-all ${isSelected ? "bg-white border-white text-neutral-950" : "bg-neutral-900 border-neutral-850 text-white"
                      }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full border border-neutral-800" style={{ backgroundColor: color.hex }} />
                    <span className="font-bold">{color.name}</span>
                    <span className="font-mono opacity-60 text-[8px]">{color.hex}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}