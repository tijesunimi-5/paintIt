'use client';

import React, { useState } from 'react';
import { useAlert } from "@/context/AlertContext";

export interface CustomColor {
  name: string;
  hex: string;
  brand?: string;
}

interface GlobalSwatchManagerProps {
  customColors: CustomColor[];
  setCustomColors: React.Dispatch<React.SetStateAction<CustomColor[]>>;
}

export default function GlobalSwatchManager({
  customColors,
  setCustomColors
}: GlobalSwatchManagerProps) {
  const { showToast } = useAlert();
  const [deletingHex, setDeletingHex] = useState<string | null>(null);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleDeleteSwatch = async (hex: string) => {
    if (typeof window === "undefined") return;

    const activeToken = localStorage.getItem("paintit_access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!activeToken) {
      showToast({ message: "Session invalid. Please re-authenticate.", severity: "error" });
      return;
    }

    setDeletingHex(hex);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/profile/custom-paints`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hex })
      });

      if (response.ok) {
        // Remove locally from state array
        setCustomColors(prev => prev.filter(c => c.hex.toUpperCase() !== hex.toUpperCase()));
        showToast({ message: "Color dropped from global inventory.", severity: "success" });
      } else {
        showToast({ message: "Failed to remove color asset from registry.", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Network synchronization error.", severity: "error" });
    } finally {
      setDeletingHex(null);
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl space-y-4 text-white">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-200">
          Global Color Inventory Deck
        </h3>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          Manage your custom mixed library entries. Dropped swatches will remain intact on past saved concepts but will clear from the active mixer options.
        </p>
      </div>

      {customColors.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-neutral-900 rounded-2xl">
          <span className="text-lg block">🎨</span>
          <span className="text-[10px] text-neutral-600 uppercase font-black tracking-widest block mt-1">
            No Custom Blends Mixed Yet
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customColors.map((color, idx) => (
            <div
              key={`${color.hex}-${idx}`}
              className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl flex items-center justify-between group hover:border-neutral-700 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl border border-neutral-800 shadow-inner shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0">
                  <span className="text-[8px] uppercase font-bold text-emerald-400 block tracking-wider leading-none mb-0.5">
                    {color.brand || "Custom Mix"}
                  </span>
                  <h4 className="text-xs font-bold truncate text-neutral-100 max-w-[120px] sm:max-w-[160px]">
                    {color.name}
                  </h4>
                  <span className="text-[9px] font-mono text-neutral-500 block uppercase tracking-tight">
                    {color.hex}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSwatch(color.hex)}
                disabled={deletingHex === color.hex}
                className="text-[10px] font-black uppercase tracking-wider text-neutral-600 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-neutral-950 transition-colors disabled:opacity-40"
              >
                {deletingHex === color.hex ? "..." : "Drop"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}