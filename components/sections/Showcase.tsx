'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from '../canvas/Scene';
import PaintPicker from '../ui/PaintPicker';
import { useStudio } from '@/context/StudioContext';

interface CameraProperties {
  position: [number, number, number];
  fov: number;
}

export default function Showcase() {
  const { activeSurface } = useStudio();

  const [cameraProps, setCameraProps] = useState<CameraProperties>({
    position: [2.0, 3.8, 8.0],
    fov: 58
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Pull camera way back and open up a wide-angle 75° FOV lens so the side walls and corners are instantly visible on load
        setCameraProps({ position: [0.0, 3.8, 15.5], fov: 75 });
      } else {
        setCameraProps({ position: [2.0, 3.8, 8.0], fov: 58 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const targetDate = new Date('2026-06-15T23:59:59').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference < 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
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

  const whatsappUrl = `https://wa.me/2347018268171?text=Hello%20PaintIt%20Studio...`;
  const emailUrl = `mailto:tijesunimiidowu16@gmail.com?subject=PaintIt...`;

  return (
    <section id="studio-showcase" className="relative w-full h-screen bg-[#0d0d0e] overflow-hidden select-none z-10">
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas camera={{ position: cameraProps.position, fov: cameraProps.fov }}>
          <Scene activeSurface={activeSurface} />
        </Canvas>
      </div>

      {/* TOP HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row justify-between items-center gap-3 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md border border-neutral-800/80 rounded-full py-1.5 px-4 shadow-lg pointer-events-auto">
          <p className="text-[11px] text-neutral-300 font-medium tracking-tight">
            👉 Swipe to look around or tap any wall to paint it
          </p>
        </div>
        <div className="bg-neutral-900/90 backdrop-blur-md border border-red-900/30 rounded-xl px-4 py-2 flex items-center gap-4 shadow-2xl pointer-events-auto">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold block">Founder&apos;s Beta Offer</span>
            <span className="text-[11px] text-neutral-400 font-light">40% off ends in:</span>
          </div>
          <div className="flex gap-2 text-white font-mono text-xs font-bold">
            <div className="bg-black/50 px-2 py-1 rounded border border-neutral-800">{timeLeft.days}d</div>
            <div className="bg-black/50 px-2 py-1 rounded border border-neutral-800">{timeLeft.hours}h</div>
            <div className="bg-black/50 px-2 py-1 rounded border border-neutral-800">{timeLeft.minutes}m</div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROL PANEL */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-6 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col items-center">
        <div className="w-full max-w-xl space-y-4">
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold block mb-1">Active Target</span>
            <span className="text-xs font-medium text-white px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full inline-block">
              📍 {getSurfaceLabel(activeSurface)}
            </span>
          </div>
          <PaintPicker />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-black text-center py-3 rounded-xl text-xs font-bold tracking-tight flex items-center justify-center gap-2 shadow-lg">
              💬 WhatsApp Direct
            </a>
            <a href={emailUrl} className="w-full bg-white text-black text-center py-3 rounded-xl text-xs font-bold tracking-tight flex items-center justify-center gap-2 shadow-lg">
              ✉️ Secure Studio Contract
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}