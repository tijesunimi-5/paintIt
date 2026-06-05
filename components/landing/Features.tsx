"use client";
import { motion } from "framer-motion";

const features = [
  { title: "Dynamic Color Preview", desc: "Select and overlay over 50+ localized, real-world paint brand equivalents with precise color accuracy." },
  { title: "Split-Wall Architecture", desc: "Apply two distinct tones divided cleanly horizontally on a single wall structure. A feature requested directly by painters." },
  { title: "Paint Pattern Previews", desc: "Simulate stripes, accent borders, and contrasting color boundaries smoothly to upsell premium services." },
  { title: "Professional Presentations", desc: "Elevate your business profile. Win commercial bids by stepping completely away from legacy paper color booklets." },
  { title: "Accelerated Client Decisions", desc: "Shorten client hesitation cycles from weeks down to minutes, allowing you to close and start work faster." },
  { title: "WhatsApp Project Sharing", desc: "Export unique visualization web links instantly to clients over WhatsApp, optimized for smooth mobile viewing." }
];

export default function Features() {
  return (
    <section className="px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Core Engine Features</h2>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
          Everything Needed To Close Clients Faster
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="p-6 border border-neutral-900 rounded-xl bg-neutral-950 relative overflow-hidden group hover:border-emerald-500/20 transition duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
            <h3 className="text-base font-bold text-neutral-200 mb-2">{feat.title}</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}