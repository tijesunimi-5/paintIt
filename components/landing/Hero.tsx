"use client";

import React from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { useStudio } from "@/context/StudioContext";
import Scene from "../canvas/Scene";
import PaintPicker from "../ui/PaintPicker";

export default function Hero() {
  const { activeSurface } = useStudio();

  return (
    <section className="relative px-4 pt-16 pb-6 max-w-5xl mx-auto text-center md:pt-36">
      {/* Clean Badge Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 text-xs border border-neutral-800 bg-neutral-900/80 rounded-full text-emerald-400 backdrop-blur-sm mb-6"
      >
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Built for Professional Painters & Contractors 
      </motion.div>

      {/* Main Copy */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent leading-tight max-w-4xl mx-auto px-2"
      >
        Help Clients See The Result Before The First Brush Stroke 
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed px-4"
      >
        PaintIt Studio lets painters show realistic room previews before painting begins, helping clients choose colors confidently and reducing costly changes.
      </motion.p>

      {/* Touch-optimized CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 max-w-sm sm:max-w-none mx-auto w-full"
      >
        <a
          href="#early-access"
          className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-neutral-950 font-semibold rounded-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition text-center min-h-[48px] flex items-center justify-center"
        >
          Join Early Access 
        </a>
        <a
          href="#demo"
          className="w-full sm:w-auto px-8 py-4 bg-neutral-900 text-neutral-200 border border-neutral-800 font-semibold rounded-lg hover:bg-neutral-800 active:scale-[0.98] transition text-center min-h-[48px] flex items-center justify-center"
        >
          Try Demo 
        </a>
      </motion.div>

      {/* Live Interactive 3D Demo Frame — Dynamic Stack Overhaul */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        id="demo"
        className="mt-12 md:mt-24 border border-neutral-800 rounded-2xl bg-neutral-900/40 p-2 backdrop-blur-sm relative shadow-2xl overflow-hidden w-full max-w-4xl mx-auto"
      >
        <div className="w-full rounded-xl bg-neutral-950 flex flex-col overflow-hidden relative">

          {/* Studio Canvas Control Bar */}
          <div className="h-12 border-b border-neutral-900 px-4 flex items-center justify-between bg-neutral-900/30 z-20 shrink-0">
            <div className="flex items-center gap-2 max-w-[70%]">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 shrink-0" />
              <span className="text-xs text-neutral-500 font-medium truncate">PaintIt Studio 3D Demo </span>
            </div>
            <div className="px-2 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 shrink-0">
              Active: {activeSurface || "wallBack"}
            </div>
          </div>

          {/* Render Area Frame — Swapped aspect ratio for static height variables on mobile */}
          <div className="w-full h-[260px] sm:h-[340px] md:h-[420px] bg-neutral-950 relative overflow-hidden">
            <Canvas
              camera={{ position: [0, 2.8, 5], fov: 65 }}
              gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
              <Scene activeSurface={activeSurface} />
            </Canvas>

            {/* Micro Gesture Guidance HUD */}
            <div className="absolute bottom-2 left-2 right-2 bg-neutral-950/80 border border-neutral-800/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-neutral-400 pointer-events-none z-10 text-center sm:text-left">
              Drag space to look around • Tap a wall surface to choose it 
            </div>
          </div>

          {/* Control board wrapper — Explicit padding properties to guarantee touch safety */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-900 z-20 shrink-0 w-full overflow-hidden">
            <PaintPicker />
          </div>

        </div>
      </motion.div>
    </section>
  );
}