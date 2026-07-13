'use client';

import React, { useState, useRef } from 'react';
import { DynamicLightInstance } from '@/types/index';

// Ensure this matches the exact ceiling height variable we set earlier
const MAX_CEILING_HEIGHT = 15.0;

interface AdminPanelProps {
  activeSurface: string;
  sceneLights: DynamicLightInstance[];
  selectedLightId: string | null;
  gizmoMode: 'translate' | 'rotate' | 'scale';
  onGizmoModeChange: (mode: 'translate' | 'rotate' | 'scale') => void;
  onAddLight: (type: 'point' | 'spot') => void;
  onSelectLight: (id: string | null) => void;
  onDeleteLight: (id: string) => void;
  onScalarUpdate: (property: 'intensity' | 'distance', value: number) => void;
  onVectorUpdate: (property: 'position' | 'rotation' | 'scale', axisIndex: number, value: number) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  onCameraPan: (direction: 'up' | 'down' | 'left' | 'right', step?: number) => void;
  onCameraZoomChange: (zoomValue: number) => void;
  currentZoomValue: number;
  isLocked: boolean;
  onToggleLock: () => void;
  onSaveToDatabase: () => void;
}

// 👑 EXACT NAMED EXPORT MATCH FOR THE TARGET MODULE:
export function FloatingAdminPanel({
  activeSurface, sceneLights, selectedLightId, gizmoMode, onGizmoModeChange,
  onAddLight, onSelectLight, onDeleteLight, onScalarUpdate, onVectorUpdate,
  currentColor, onColorChange, onCameraPan, onCameraZoomChange, currentZoomValue,
  isLocked, onToggleLock, onSaveToDatabase
}: AdminPanelProps) {
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [size, setSize] = useState({ width: 340, height: 490 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({ x: touch.clientX - dragStart.current.x, y: touch.clientY - dragStart.current.y });
  };

  const handleMouseUp = () => setIsDragging(false);
  const activeLight = sceneLights.find((l) => l.id === selectedLightId);

  const PRESET_SWATCHES = ['#F2EFE9', '#9BA498', '#C4B199', '#3b82f6', '#ef4444', '#10b981', '#171717'];

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${size.width}px`, height: `${size.height}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="absolute pointer-events-auto bg-neutral-900/95 border border-neutral-800 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none z-40 max-w-[calc(100vw-32px)] max-h-[calc(100vh-40px)]"
    >
      <div onMouseDown={handleMouseDown} className="drag-handle bg-neutral-950/80 px-4 py-3 border-b border-neutral-800/60 cursor-move flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-[11px] font-black tracking-wider text-white uppercase">Design Workspace HUD</span>
          <span className="text-[9px] text-neutral-400 font-medium tracking-wide">Selected Mesh: <span className="text-cyan-400 font-bold font-mono">{activeSurface}</span></span>
        </div>
        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${isLocked ? 'bg-red-950 text-red-400 border border-red-900/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'}`}>
          {isLocked ? '🔒 Locked' : '🔓 Editing'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onToggleLock}
            className={`text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all border ${isLocked ? 'bg-amber-600 text-white border-amber-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'}`}
          >
            {isLocked ? '🔓 Open Sandbox Settings' : '🔒 Lock Scenery Limits'}
          </button>
          <button type="button" onClick={onSaveToDatabase} className="bg-neutral-900 hover:bg-neutral-800 text-cyan-400 border border-neutral-800 text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all">💾 Sync Live DB</button>
        </div>

        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider">Surface Painter Tool</span>
            <span className="text-[9px] font-mono text-neutral-500 uppercase">{currentColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-800 shrink-0 cursor-pointer shadow-inner">
              <input type="color" value={currentColor || '#ffffff'} onChange={(e) => onColorChange(e.target.value)} className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" />
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {PRESET_SWATCHES.map((hex) => (
                <button key={hex} type="button" onClick={() => onColorChange(hex)} style={{ backgroundColor: hex }} className={`w-5 h-5 rounded-md border transition-all transform active:scale-90 ${(currentColor || '#ffffff').toLowerCase() === hex.toLowerCase() ? 'border-cyan-400 scale-105 shadow-md' : 'border-neutral-800'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 space-y-3">
          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider block">📱 Camera Navigation HUD</span>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-semibold text-neutral-400 uppercase font-mono">
              <span>Lens Zoom Distance</span>
              <span className="text-cyan-400">{currentZoomValue.toFixed(2)}m</span>
            </div>
            <input type="range" min="0.1" max="2.5" step="0.05" value={currentZoomValue} onChange={(e) => onCameraZoomChange(parseFloat(e.target.value))} className="w-full accent-cyan-500 bg-neutral-900 h-1.5 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="space-y-1.5 pt-1 border-t border-neutral-900 flex flex-col items-center">
            <button type="button" onClick={() => onCameraPan('up')} className="w-10 h-8 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-all">▲</button>
            <div className="flex justify-center items-center gap-4 w-full">
              <button type="button" onClick={() => onCameraPan('left')} className="w-10 h-8 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-all">◀</button>
              <div className="text-[9px] text-neutral-600 font-bold font-mono uppercase">PAN</div>
              <button type="button" onClick={() => onCameraPan('right')} className="w-10 h-8 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-all">▶</button>
            </div>
            <button type="button" onClick={() => onCameraPan('down')} className="w-10 h-8 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-all">▼</button>
          </div>
        </div>

        {!isLocked ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onAddLight('point')} className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md">💡 + Point Light</button>
              <button onClick={() => onAddLight('spot')} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md">🎯 + Spot Light</button>
            </div>
            {activeLight && (
              <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/80 space-y-1.5">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider block">Gizmo Vector Target:</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['translate', 'rotate', 'scale'] as const).map((m) => (
                    <button key={m} onClick={() => onGizmoModeChange(m)} className={`py-1.5 text-[9px] font-black uppercase rounded-lg tracking-wider transition-all ${gizmoMode === m ? 'bg-amber-500 text-neutral-950 shadow font-black' : 'bg-neutral-900 text-neutral-400'}`}>{m === 'translate' ? 'Position' : m === 'rotate' ? 'Rotation' : 'Scale'}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-dashed border-neutral-800 text-center text-neutral-500 text-[9px] font-black tracking-wider uppercase">⚠️ Light modifications locked.<br />Unlock settings to add or move bulbs.</div>
        )}

        {sceneLights.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider">Active Bulbs Stack:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {sceneLights.map((l, idx) => (
                <button key={l.id} onClick={() => onSelectLight(selectedLightId === l.id ? null : l.id)} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border shrink-0 transition-all ${selectedLightId === l.id ? 'bg-amber-500 text-neutral-950 border-amber-400 font-black' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>Bulb #{idx + 1}</button>
              ))}
            </div>
          </div>
        )}

        {activeLight && !isLocked && (
          <div className="space-y-4 border-t border-neutral-800/80 pt-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase"><span>Brightness Scale</span><span className="text-amber-400 font-mono">{activeLight.intensity}</span></div>
              <input type="range" min="0.1" max="12" step="0.1" value={activeLight.intensity} onChange={(e) => onScalarUpdate('intensity', parseFloat(e.target.value))} className="w-full accent-amber-500 bg-neutral-950 h-1.5 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase"><span>Horizon Reach</span><span className="text-amber-400 font-mono">{activeLight.distance}m</span></div>
              <input type="range" min="1" max="30" step="0.5" value={activeLight.distance} onChange={(e) => onScalarUpdate('distance', parseFloat(e.target.value))} className="w-full accent-amber-500 bg-neutral-950 h-1.5 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="border-t border-neutral-800/60 pt-3 space-y-3">
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block">Panel Vector Fine Tuning:</span>
              {(() => {
                const vectorKey = gizmoMode === 'translate' ? 'position' : gizmoMode === 'rotate' ? 'rotation' : 'scale';
                const currentVector = activeLight[vectorKey];
                const sliderConfig = vectorKey === 'position'
                  ? {
                    min: -4.0,
                    max: MAX_CEILING_HEIGHT,
                    step: 0.02,
                    customLimits: [null, [0.05, MAX_CEILING_HEIGHT - 0.05], null],
                    labels: ['X (Left/Right)', 'Y (Height)', 'Z (Front/Back)']
                  }
                  : vectorKey === 'rotation'
                    ? { min: -Math.PI, max: Math.PI, step: 0.02, labels: ['Pitch (X)', 'Yaw (Y)', 'Roll (Z)'] }
                    : { min: 0.2, max: 3.0, step: 0.05, labels: ['Width (X Scale)', 'Length (Y Scale)', 'Depth (Z Scale)'] };

                return (
                  <div className="space-y-2.5">
                    {sliderConfig.labels.map((label, index) => {
                      let minVal = sliderConfig.min;
                      let maxVal = sliderConfig.max;
                      if (vectorKey === 'position' && sliderConfig.customLimits && sliderConfig.customLimits[index]) {
                        const limits = sliderConfig.customLimits[index] as [number, number];
                        minVal = limits[0];
                        maxVal = limits[1];
                      }
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-semibold text-neutral-400 uppercase font-mono"><span>{label}</span><span className="text-cyan-400">{currentVector[index]}</span></div>
                          <input type="range" min={minVal} max={maxVal} step={sliderConfig.step} value={currentVector[index]} onChange={(e) => onVectorUpdate(vectorKey, index, parseFloat(e.target.value))} className="w-full accent-cyan-500 bg-neutral-950 h-1 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <button onClick={() => onDeleteLight(activeLight.id)} className="w-full bg-red-950/30 text-red-400 text-[9px] font-black uppercase tracking-wider py-2 rounded-xl border border-red-900/20 transition-all">🗑️ Delete Bulb Instance</button>
          </div>
        )}
      </div>

      <div className="bg-neutral-950/40 p-2 border-t border-neutral-800/60 flex items-center justify-between shrink-0">
        <span className="text-[8px] text-neutral-600 font-mono tracking-widest uppercase">HUD_SECURE_V1.55</span>
        <div className="hidden md:flex flex-col gap-1 w-24">
          <input type="range" min="280" max="600" step="10" value={size.width} onChange={(e) => setSize(p => ({ ...p, width: parseInt(e.target.value) }))} className="w-full accent-neutral-500 h-0.5 bg-neutral-950 rounded" />
          <input type="range" min="300" max="800" step="10" value={size.height} onChange={(e) => setSize(p => ({ ...p, height: parseInt(e.target.value) }))} className="w-full accent-neutral-500 h-0.5 bg-neutral-950 rounded" />
        </div>
      </div>
    </div>
  );
}