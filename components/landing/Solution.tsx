"use client";
import { motion } from "framer-motion";

const solutions = [
  { title: "Preview Wall Colors Instantly", desc: "Show complete room changes across multiple walls and ceilings with absolute accuracy instead of guessing." },
  { title: "Test Structural Combinations", desc: "Mix and match deep base layers, primary palettes, and horizontal trim variants cleanly on-the-fly." },
  { title: "Compare Custom Designs", desc: "Switch design variants instantly right in front of the client to settle debates immediately." },
  { title: "Build Confidence Before Painting", desc: "Mitigate anxiety and guarantee project sign-off before a single drop of real paint is purchased." }
];

export default function Solution() {
  return (
    <section className="px-4 max-w-5xl mx-auto bg-neutral-950">
      <div className="border border-neutral-900 rounded-2xl bg-gradient-to-b from-neutral-900/40 to-transparent p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="max-w-2xl mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">The Solution</h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
            Show. Don&apos;t Explain.
          </p>
          <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
            Eliminate hours of verbal negotiation. Hand your client a structured mobile visualization link that acts as a concrete anchor for your contract execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {solutions.map((sol, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs mt-1 font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 text-base mb-1">{sol.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">{sol.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}