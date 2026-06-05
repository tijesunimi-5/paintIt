"use client";
import { motion } from "framer-motion";

const stats = [
  {
    value: "89%",
    label: "Confidence Boost",
    desc: "Of all surveyed consumers stated that structured pre-painting visualization directly increases their willingness to move forward with a project."
  },
  {
    value: "100%",
    label: "Professionalism Loop",
    desc: "Of active professional painters confirmed that utilizing a visualization application differentiates them instantly and builds deep trust."
  },
  {
    value: "75%",
    label: "Color Choice Anxiety",
    desc: "Of homeowners explicitly cite constant worry that the dried paint variation will look completely mismatched compared to their original target."
  }
];

export default function Validation() {
  return (
    <section className="px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Market Validation</h2>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
          Backed By Real Market Data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-6 border border-neutral-900 rounded-xl bg-neutral-900/10 text-center flex flex-col justify-between group hover:border-neutral-800 transition duration-300"
          >
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-50 bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">{stat.label}</div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}