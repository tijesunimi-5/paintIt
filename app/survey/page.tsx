'use client';

import React from 'react';
import NoiseOverlay from '@/components/ui/NoiseOverlay';
import SurveyContainer from '@/components/survey/SurveyContainer';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const triggerDemoRedirect = () => {
    // Smooth navigation anchor transition point to the demo module
    document.getElementById('feedback-flow-module')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative w-full min-h-screen bg-black text-white selection:bg-white selection:text-black antialiased overflow-x-hidden">
      <NoiseOverlay />

      {/* LANDING MARKETING INTRO */}
      <section className="relative w-full h-[65vh] flex flex-col justify-center items-center text-center px-6 select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-neutral-900/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 max-w-3xl space-y-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold"
          >
            Co-Creation Vector Engine
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl font-normal font-serif tracking-tighter text-white"
          >
            Help Us Build <span className="italic text-neutral-400">PaintIt</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-neutral-400 font-light max-w-lg mx-auto leading-relaxed tracking-tight"
          >
            We&apos;re creating tools that help people visualize rooms before painting and help professionals present their ideas more clearly. Your feedback will directly shape the future of PaintIt.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 items-center justify-center pt-4"
          >
            <button
              onClick={triggerDemoRedirect}
              className="bg-white text-black text-xs font-mono font-bold px-6 py-3.5 rounded-full hover:bg-neutral-200 transition-colors"
            >
              TAKE SURVEY ↓
            </button>
            <Link
              href="/#studio-showcase"
              className="text-neutral-400 border border-neutral-900 text-xs font-mono px-6 py-3.5 rounded-full hover:bg-neutral-950 transition-colors"
            >
              TRY DEMO SPACE
            </Link>
          </motion.div>
        </div>
      </section>

      {/* DYNAMIC INTERACTIVE SURVEY ANCHOR PLATFORM */}
      <section id="feedback-flow-module" className="w-full pb-32 px-4">
        <SurveyContainer />
      </section>
    </main>
  );
}