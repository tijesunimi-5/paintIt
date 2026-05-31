'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from '../canvas/Scene';
import PaintPicker from '../ui/PaintPicker';
import { useStudio } from '@/context/StudioContext';

// Define a strict camera properties interface to enforce Three.js tuple requirements
interface CameraProperties {
  position: [number, number, number]; // Strictly exactly 3 elements!
  fov: number;
}

export default function Showcase() {
  const { activeSurface } = useStudio();

  // Enforce the custom type layout here so TypeScript compiles flawlessly
  const [cameraProps, setCameraProps] = useState<CameraProperties>({
    position: [2.0, 3.8, 6.5],
    fov: 58
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 1. DYNAMIC RESPONSIVE 3D CAMERA RESIZING
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile camera position tracking corner intersection
        setCameraProps({ position: [1.8, 4.2, 8.5], fov: 68 });
      } else {
        // Desktop landscape view configuration
        setCameraProps({ position: [2.0, 3.8, 6.5], fov: 58 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. COUNTER SYSTEM (June 15 Target)
  useEffect(() => {
    const targetDate = new Date('2026-06-15T23:59:59').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getSurfaceLabel = (surface: string) => {
    if (surface === 'wallBack') return 'Back Wall';
    if (surface === 'wallLeft') return 'Left Wall';
    if (surface === 'wallRight') return 'Right Wall';
    if (surface === 'floor') return 'Floor';
    if (surface === 'ceiling') return 'Ceiling';
    return surface;
  };

  const whatsappUrl = `https://wa.me/2347018268171?text=Hello%20PaintIt%20Studio,%20I%20just%20went%20through%20your%203D%20room%20simulator%20demo.%20I'm%20an%20interior%20professional%20and%20I'd%20love%20to%20discuss%20building%20a%20custom%203D%20interactive%20portfolio%20for%20my%20business.`;
  const emailUrl = `mailto:tijesunimiidowu16@gmail.com?subject=PaintIt%20Studio%20-%20Custom%203D%20Portfolio%20Inquiry&body=Hello%20PaintIt,%20I've%20tested%20your%203D%20interactive%20demo%20and%20want%20to%20know%20more%20about%20how%20we%20can%20collaborate%20to%20upgrade%20my%20client%20presentations.`;

  return (
    <section id="studio-showcase" className="relative w-full h-screen bg-[#0d0d0e] overflow-hidden select-none">

      {/* 3D WORKSPACE */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas camera={{ position: cameraProps.position, fov: cameraProps.fov }}>
          <Scene />
        </Canvas>
      </div>

      {/* TOP FLOATING CONTEXT URGENCY MODULE */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row justify-between items-center gap-3 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md border border-neutral-800/80 rounded-full py-1.5 px-4 shadow-lg pointer-events-auto">
          <p className="text-[11px] text-neutral-300 font-medium tracking-tight">
            👉 Tap any wall inside the 3D room to change its paint color
          </p>
        </div>

        <div className="bg-neutral-900/90 backdrop-blur-md border border-red-900/30 rounded-xl px-4 py-2 flex items-center gap-4 shadow-2xl pointer-events-auto">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold block">Founder&apos;s Beta Offer</span>
            <span className="text-[11px] text-neutral-400 font-light">Custom 3D spaces at 40% off ends in:</span>
          </div>
          <div className="flex gap-2 text-white font-mono text-xs font-bold">
            <div className="bg-black/50 px-2 py-1 rounded border border-neutral-800">{timeLeft.days}d</div>
            <div className="bg-black/50 px-2 py-1 rounded border border-neutral-800">{timeLeft.hours}h</div>
            <div className="bg-black/50 px-2 py-1 rounded border border-neutral-800">{timeLeft.minutes}m</div>
          </div>
        </div>
      </div>

      {/* FIXED CONTROLS BOTTOM PANEL */}
      {/* Applied the new canonical Tailwind CSS v4 bg-linear-to-t token */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-6 bg-linear-to-t from-black via-black/90 to-transparent flex flex-col items-center">
        <div className="w-full max-w-xl space-y-4">

          <div className="text-center">
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold block mb-1">Active Target</span>
            <span className="text-xs font-medium text-white px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full inline-block">
              📍 {getSurfaceLabel(activeSurface)}
            </span>
          </div>

          <PaintPicker />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-black text-center py-3 rounded-xl text-xs font-bold tracking-tight hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
            >
              💬 WhatsApp Direct
            </a>

            <a
              href={emailUrl}
              className="w-full bg-white text-black text-center py-3 rounded-xl text-xs font-bold tracking-tight hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              ✉️ Secure Studio Contract
            </a>
          </div>

          <p className="text-[10px] text-center text-neutral-500 font-light">
            Drag one finger over the screen to look around the room structure.
          </p>
        </div>
      </div>

    </section>
  );
}