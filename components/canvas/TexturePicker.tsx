'use client';

import React from 'react';

export interface MaterialTexture {
  id: string;
  name: string;
  fileName: string;
  category: "floor" | "wood" | "wall" | "ceiling";
}

interface TexturePickerProps {
  activeSurface: string;
  roomTextures: Record<string, string>;
  setRoomTextures: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function TexturePicker({
  activeSurface,
  roomTextures,
  setRoomTextures
}: TexturePickerProps) {
  const textures: MaterialTexture[] = [
    { id: "tiles_marble", name: "Carrara Marble", fileName: "marble_tiles", category: "floor" },
    { id: "wood_oak", name: "Executive Oak Wood", fileName: "oak_wood", category: "wood" },
    { id: "wall_pop", name: "POP Pattern Finish", fileName: "pop_stucco", category: "ceiling" },
    { id: "floor_parquet", name: "Classic Parquet Wood", fileName: "parquet_floor", category: "floor" }
  ];

  return (
    <div className="space-y-3">
      <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 block">
        Texture & Surface Finishes
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setRoomTextures((prev) => ({ ...prev, [activeSurface]: "none" }))}
          className={`p-3 rounded-xl border text-center font-black text-[10px] uppercase tracking-wider transition-all ${roomTextures[activeSurface] === "none" || !roomTextures[activeSurface]
              ? "bg-white border-white text-neutral-950"
              : "bg-neutral-900 border-neutral-850 text-white"
            }`}
        >
          🚫 Remove Texture
        </button>

        {textures.map((texture) => {
          const isSelected = roomTextures[activeSurface] === texture.fileName;
          return (
            <button
              key={texture.id}
              onClick={() => setRoomTextures((prev) => ({ ...prev, [activeSurface]: texture.fileName }))}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${isSelected ? "bg-white border-white text-neutral-950" : "bg-neutral-900 border-neutral-850 text-white"
                }`}
            >
              <span className="text-[10px] font-black">{texture.name}</span>
              <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold mt-1">
                {texture.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}