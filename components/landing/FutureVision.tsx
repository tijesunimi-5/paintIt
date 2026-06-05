"use client";
import { motion } from "framer-motion";

export default function FutureVision() {
  return (
    <section className="px-4 max-w-4xl mx-auto text-center py-12 border-y border-neutral-900/60 bg-neutral-900/10 rounded-3xl relative overflow-hidden">
      {/* Premium subtle glow background */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded">
          On The Horizon
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-200 mt-4 mb-3">
          Continuous Innovation
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal max-w-xl mx-auto">
          More visualization tools and collaboration features are already in development to elevate your professional workflow.
        </p>
      </motion.div>
    </section>
  );
}