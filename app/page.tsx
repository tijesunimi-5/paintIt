'use client';

import { StudioProvider } from "@/context/StudioContext";
import Hero from "@/components/landing/Hero"; // Adjust your import path to match your layout folder
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Validation from "@/components/landing/Validation";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import EarlyAccessForm from "@/components/landing/EarlyAccessForm";
import FutureVision from "@/components/landing/FutureVision";
import Footer from "@/components/landing/Footer";
import { AlertProvider } from "@/context/AlertContext";

export default function Home() {
  return (
    // Wrap everything inside the StudioProvider so Hero and all subsequent sections can access state
    <AlertProvider>
      <StudioProvider>
        <main className="relative min-h-screen bg-neutral-950 selection:bg-emerald-500/30 selection:text-emerald-300">

          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent pointer-events-none z-0" />
          <div className="absolute top-[30%] right-0 w-75 h-75 bg-emerald-900/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-[20%] left-0 w-75 h-75 bg-emerald-900/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="relative z-10 space-y-24 md:space-y-36 pb-16">
            <Hero />
            <Problem />
            <Solution />
            <Validation />
            <Features />
            <HowItWorks />
            <EarlyAccessForm />
            <FutureVision />
            <Footer />
          </div>

        </main>
      </StudioProvider>
    </AlertProvider>
  );
}