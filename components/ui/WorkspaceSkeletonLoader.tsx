'use client';

import React from 'react';

interface SkeletonProps {
  message?: string;
}

export function WorkspaceSkeletonLoader({ message = "Verifying Core Session Registry..." }: SkeletonProps) {
  return (
    <div className="fixed inset-0 bg-neutral-950 flex flex-col overflow-hidden select-none z-50 text-white font-sans">

      {/* HUD Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 bg-neutral-950/90 border-b border-neutral-900 px-4 py-3 z-50 flex items-center justify-between">
        <div className="space-y-2">
          {/* App Title Skeleton */}
          <div className="h-3 w-24 bg-neutral-800 rounded animate-pulse" />
          {/* Subtitle Skeleton */}
          <div className="h-2 w-32 bg-neutral-900 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          {/* Button Skeletons */}
          <div className="h-8 w-20 bg-neutral-900 rounded-xl animate-pulse" />
          <div className="h-8 w-24 bg-neutral-900 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* 3D Viewport Viewport Grid Mock */}
      <div className="flex-1 w-full h-full relative z-10 flex flex-col items-center justify-center bg-neutral-950">
        {/* Fine crosshair lines to mimic a loading 3D canvas viewport */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-full h-[1px] bg-neutral-800 absolute" />
          <div className="h-full w-[1px] bg-neutral-800 absolute" />
        </div>

        {/* Central Loader Matrix */}
        <div className="flex flex-col items-center gap-3 relative z-20">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-[10px] text-neutral-400 font-mono font-bold tracking-widest uppercase">
            {message}
          </span>
        </div>
      </div>

      {/* Floating Controls Skeletons */}
      <div className="absolute right-4 bottom-72 z-20 flex flex-col gap-2">
        <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 animate-pulse" />
      </div>

      {/* Bottom Sheet Control Panel Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 h-[280px] bg-neutral-950 border-t border-neutral-900 z-20 px-6 py-4 space-y-4">
        {/* Sheet Drag Handle */}
        <div className="w-full flex justify-center mb-2">
          <div className="w-12 h-1 bg-neutral-900 rounded-full" />
        </div>

        {/* Content Blocks Skeletons */}
        <div className="space-y-3">
          <div className="h-4 w-1/4 bg-neutral-900 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-neutral-900 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="h-16 bg-neutral-900 border border-neutral-850 rounded-xl animate-pulse" />
          <div className="h-16 bg-neutral-900 border border-neutral-850 rounded-xl animate-pulse" />
          <div className="h-16 bg-neutral-900 border border-neutral-850 rounded-xl animate-pulse" />
          <div className="h-16 bg-neutral-900 border border-neutral-850 rounded-xl animate-pulse" />
        </div>
      </div>

    </div>
  );
}

export default WorkspaceSkeletonLoader;