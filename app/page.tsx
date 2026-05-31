'use client';

import { StudioProvider } from '@/context/StudioContext';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Showcase from '@/components/sections/Showcase';
import NoiseOverlay from '@/components/ui/NoiseOverlay';

export default function Home() {
  return (
    <StudioProvider>
      <main className="relative w-full min-h-screen bg-black text-white selection:bg-white selection:text-black antialiased">

        {/* Subtle texture layout layer */}
        <NoiseOverlay />

        {/* 1. The Dynamic Business Value Presentation Text */}
        <Hero />

        {/* 2. The 3 Core Value Columns for the Contractor Bids */}
        <Features />

        {/* 3. The Absolute Full-Screen Mobile Optimized Interactive Room Viewport */}
        <Showcase />

      </main>
    </StudioProvider>
  );
}