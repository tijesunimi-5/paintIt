// src/components/WhyHomeowners.tsx
"use client";
import { motion } from "framer-motion";

const clientBenefits = [
  { title: "Confidence before spending money", desc: "Know exactly how your building modification looks before buying heavy buckets or paying a professional crew." },
  { title: "Test colour combinations freely", desc: "Mix bold main options or try horizontal split-wall tones on your screen first without any real mess." },
  { title: "See the whole room before painting starts", desc: "Preview how your individual walls match up together in realistic room layouts instead of holding up tiny cards." },
  { title: "Avoid expensive mistakes", desc: "Repainting a completed wall because you hate the final dried color shade is a massive waste of time and budget." }
];

export default function WhyHomeowners() {
  return (
    <section className="px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">For Property Owners</h2>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
          Why Homeowners Want This
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {clientBenefits.map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="p-6 border border-neutral-900 rounded-xl bg-neutral-950 flex flex-col gap-2"
          >
            <h3 className="text-base font-bold text-emerald-400">{benefit.title}</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">{benefit.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}