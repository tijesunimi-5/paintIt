"use client";

import React, { useState, useEffect } from "react";
import { TEXTURE_PRESETS, TextureCategory, TexturePresetItem, getMeshCategory } from "@/utils/generateFloorTextures";

interface TexturePickerProps {
  activeTextures: Record<string, string>; // meshName or category -> textureId
  onTextureSelect: (surfaceOrCategory: string, textureId: string) => void;
  activeSurface?: string;
  availableMaterials?: string[];
  materialSwaps?: Record<string, string>;
  onMaterialSwap?: (meshName: string, materialName: string) => void;
}

export default function ClientTexturePicker({
  activeTextures,
  onTextureSelect,
  activeSurface = "",
  availableMaterials = [],
  materialSwaps = {},
  onMaterialSwap
}: TexturePickerProps) {
  const [activeTab, setActiveTab] = useState<TextureCategory>("FLOOR");

  const categories: { id: TextureCategory; label: string; icon: string }[] = [
    { id: "FLOOR", label: "Flooring", icon: "🪵" },
    { id: "WARDROBE", label: "Wardrobe", icon: "🗄️" },
    { id: "DOOR", label: "Doors & Trim", icon: "🚪" },
  ];

  // Auto-switch tabs based on the category of the selected surface
  useEffect(() => {
    if (!activeSurface) return;
    const resolvedCategory = getMeshCategory(activeSurface);
    if (resolvedCategory === "FLOOR" || resolvedCategory === "WARDROBE" || resolvedCategory === "DOOR") {
      setActiveTab(resolvedCategory);
    }
  }, [activeSurface]);

  const filteredPresets = TEXTURE_PRESETS.filter((item) => item.category === activeTab);

  return (
    <div className="space-y-4 text-white">
      {/* Top Category Tabs */}
      <div className="flex gap-2 border-b border-neutral-900 pb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === cat.id
                ? "bg-amber-500 text-neutral-950 shadow-lg scale-105"
                : "bg-neutral-900 hover:bg-neutral-850 text-neutral-400"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Preset Swatch Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
        {filteredPresets.map((item: TexturePresetItem) => {
          // Check if selected either specifically for activeSurface or as a category fallback
          const isSelected = (activeSurface && activeTextures[activeSurface] === item.id) || activeTextures[item.category] === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTextureSelect(activeSurface || item.category, item.id)}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                isSelected
                  ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 scale-105"
                  : "bg-neutral-900/60 border-neutral-850 hover:border-neutral-700"
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg border border-white/20 shadow-md shrink-0 relative overflow-hidden"
                style={{ backgroundColor: item.thumbnailColor }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-amber-400 text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-neutral-200 text-center truncate w-full">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Native Blender Materials Swapper Section */}
      {activeSurface && availableMaterials.length > 0 && onMaterialSwap && (
        <div className="space-y-2 pt-4 border-t border-neutral-900">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500">Native Model Materials</span>
            <span className="text-[8px] text-neutral-600 font-mono mt-0.5 truncate">Surface: {activeSurface}</span>
          </div>
          <select
            value={materialSwaps[activeSurface] || ""}
            onChange={(e) => onMaterialSwap(activeSurface, e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-850 hover:border-neutral-750 px-3 py-2.5 rounded-xl text-xs text-neutral-250 font-bold focus:outline-none transition-all cursor-pointer font-sans"
          >
            <option value="">(Default Preset Texture)</option>
            {availableMaterials.map((mat) => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
