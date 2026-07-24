'use client';

import React, { useState } from 'react';
import { PaintFinishSelector } from "@/components/ui/PaintFinishSelector";
import { PaintFinishId } from "@/config/paintFinishes";
import { REAL_PAINTS_CATALOG } from '@/config/paints';

export interface CustomColor {
  name: string;
  hex: string;
  brand?: string;
  id?: string;
}

interface PaintPickerProps {
  activeSurface: string;
  roomColors: Record<string, string>;
  setRoomColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customColors: CustomColor[];
  setCustomColors: React.Dispatch<React.SetStateAction<CustomColor[]>>;
  detectedMeshes?: string[];
  onSurfaceSelect?: (meshName: string) => void;
  isReadOnly?: boolean;
  activeFinish?: PaintFinishId;
  onFinishChange?: (finish: PaintFinishId) => void;
}

export default function PaintPicker({
  activeSurface,
  roomColors,
  setRoomColors,
  customColors,
  setCustomColors,
  detectedMeshes = [],
  onSurfaceSelect,
  isReadOnly = false,
  activeFinish = "EMULSION",
  onFinishChange
}: PaintPickerProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#10B981");
  const [syncingState, setSyncingState] = useState(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Build the master structural color deck by mapping commercial presets with saved custom swatches
  const combinedPaintDeck = [
    ...REAL_PAINTS_CATALOG.map(p => ({ name: p.name, hex: p.code, brand: p.brand })),
    ...customColors.map(c => ({ name: c.name, hex: c.hex, brand: c.brand || "Custom Mix" }))
  ];

  const handleAddCustomColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !newColorName.trim() || !newColorHex.trim()) return;

    let formattedHex = newColorHex.trim();
    if (!formattedHex.startsWith("#")) {
      formattedHex = `#${formattedHex}`;
    }

    const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    if (!hexRegex.test(formattedHex)) {
      alert("Please enter a valid Hex color code (e.g., #FFBF00)");
      return;
    }

    const newColor: CustomColor = {
      name: newColorName.trim(),
      hex: formattedHex,
      brand: "Custom Mix"
    };

    // 1. Optimistic UI updates
    setCustomColors((prev) => [...prev, newColor]);
    setRoomColors((prev) => ({ ...prev, [activeSurface]: formattedHex }));
    setNewColorName("");
    setNewColorHex("#10B981");

    // 2. Global Profile Sync Hook Trigger (Fires silently if token is active)
    if (typeof window !== "undefined") {
      const activeToken = localStorage.getItem("paintit_access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (activeToken) {
        setSyncingState(true);
        try {
          await fetch(`${BACKEND_API_URL}/api/profile/custom-paints`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${activeToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: newColor.name,
              code: newColor.hex,
              brand: newColor.brand
            })
          });
        } catch (err) {
          console.error("Failed to sync custom color to universal database profile:", err);
        } finally {
          setSyncingState(false);
        }
      }
    }
  };

  const formatSurfaceName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  return (
    <div className="space-y-4">

      {/* ACTIVE SURFACE TARGET HUD */}
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

      {/* 🎯 MESH SELECTOR DROPDOWN */}
      {detectedMeshes.length > 0 && onSurfaceSelect && (
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 block">Select 3D Mesh Surface</span>
          <select
            value={activeSurface}
            onChange={(e) => onSurfaceSelect(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-2.5 rounded-xl text-xs text-neutral-200 font-bold focus:outline-none transition-all cursor-pointer font-sans"
          >
            {detectedMeshes.map((mesh) => (
              <option key={mesh} value={mesh}>
                {formatSurfaceName(mesh)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 🚀 COMBINED MAIN PAINTS & CUSTOM SWATCHES SLIDER */}
      <div className="space-y-2">
        <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500">Available Paint Catalog Decks</span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {combinedPaintDeck.map((paint, index) => {
            const isSelected = (roomColors[activeSurface] || '#ffffff').toUpperCase() === paint.hex.toUpperCase();
            return (
              <button
                key={`${paint.hex}-${index}`}
                type="button"
                onClick={() => setRoomColors((prev) => ({ ...prev, [activeSurface]: paint.hex }))}
                className={`snap-center shrink-0 w-28 p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${isSelected ? "bg-white border-white text-neutral-950" : "bg-neutral-900 border-neutral-850 text-white"
                  }`}
              >
                <div className="w-5 h-5 rounded-full border border-neutral-800/20" style={{ backgroundColor: paint.hex }} />
                <div className="mt-2">
                  <span className="text-[8px] uppercase font-bold text-emerald-500 block truncate leading-none mb-0.5">{paint.brand}</span>
                  <span className="text-[9px] font-black truncate block leading-tight">{paint.name}</span>
                </div>
                <span className="text-[8px] font-mono mt-1 opacity-60">{paint.hex.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MIX CUSTOM FORMULA SECTION */}
      {!isReadOnly && (
        <div className="border-t border-neutral-900 pt-3">
          <form onSubmit={handleAddCustomColor} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 block">Mix Custom Color</span>
              {syncingState && (
                <span className="text-[8px] uppercase tracking-widest font-mono text-cyan-400 font-bold animate-pulse">
                  Syncing to profile...
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Color Name (e.g. Custom Amber Glow)"
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
                  Add & Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 🎯 WALL PAINT FINISH & SHEEN SELECTOR */}
      {onFinishChange && (
        <div className="pt-2">
          <PaintFinishSelector
            currentFinish={activeFinish}
            onChangeFinish={onFinishChange}
          />
        </div>
      )}
    </div>
  );
}