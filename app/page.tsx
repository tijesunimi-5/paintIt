'use client';

import React, { useEffect, useState } from "react";
import { StudioProvider } from "@/context/StudioContext";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Validation from "@/components/landing/Validation";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import EarlyAccessForm from "@/components/landing/EarlyAccessForm";
import Footer from "@/components/landing/Footer";
import { AlertProvider } from "@/context/AlertContext";
import { startTrackingLifecycle, identifyUserSession } from "@/utils/tracker";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [showPopupNudge, setShowPopupNudge] = useState(false);
  const [nudgeEmail, setNudgeEmail] = useState("");
  const [nudgeSubmitted, setNudgeSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Initialize our custom session tracking loop when the page mounts
  useEffect(() => {
    const cleanUpTracker = startTrackingLifecycle(() => {
      setShowPopupNudge(true);
    });

    // 🔒 FIX: Only invoke the cleanup function if it actually exists
    return () => {
      if (typeof cleanUpTracker === "function") {
        cleanUpTracker();
      }
    };
  }, []);

  // 2. Handle immediate identity updates when they fill out the quick nudge box
  const handleNudgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nudgeEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await identifyUserSession(nudgeEmail.toLowerCase().trim());
      setNudgeSubmitted(true);

      setTimeout(() => {
        setShowPopupNudge(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to update visitor session identity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertProvider>
      <StudioProvider>
        <main className="relative min-h-screen bg-neutral-950 selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden">

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
            <Footer />
          </div>

          {/* 3. High-Converting Premium Identity Nudge Popup Overlay */}
          <AnimatePresence>
            {showPopupNudge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 p-5 sm:p-6 bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-auto mx-auto sm:mx-0"
              >
                {/* 🎨 FIX: Simplified canonical Tailwind utility classes below */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500 via-transparent to-transparent" />

                {!nudgeSubmitted ? (
                  <>
                    <h4 className="font-bold text-sm sm:text-base text-neutral-100 tracking-tight">
                      Want to save your room layouts?
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-normal font-normal">
                      Drop your email to secure your custom colors and room combinations automatically[cite: 1].
                    </p>

                    <form onSubmit={handleNudgeSubmit} className="mt-4 space-y-2">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                        value={nudgeEmail}
                        onChange={(e) => setNudgeEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                      {/* 🎨 FIX: Cleaned up min-h property token tag */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-10 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-neutral-950 font-bold rounded-lg text-xs transition flex items-center justify-center min-h-10"
                      >
                        {isSubmitting ? "Securing..." : "Save My Designs"}
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={() => setShowPopupNudge(false)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-400 font-medium transition mt-3 block mx-auto text-center w-full"
                    >
                      Maybe later
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-4 text-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2 font-bold text-sm">
                      ✓
                    </div>
                    <h5 className="font-bold text-neutral-200 text-sm">Identity Linked Successfully</h5>
                    <p className="text-[11px] text-neutral-500 mt-0.5 font-normal">Your browsing timeline metrics are locked in[cite: 1].</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </StudioProvider>
    </AlertProvider>
  );
}