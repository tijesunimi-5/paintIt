// src/components/WhyPainters.tsx
"use client";
import { motion } from "framer-motion";

const painterBenefits = [
  { title: "Fewer colour disputes", desc: "No more clients saying 'this is not the exact shade I wanted' after you have bought materials and finished your labor layer." },
  { title: "Faster project approvals", desc: "Shorten endless back-and-forth choice debates down to simple minutes right from your smartphone screen." },
  { title: "Better client trust", desc: "Clients respect your brand and pay with peace of mind when they see you have a clear, visual plan for their house layout." },
  { title: "More professional presentations", desc: "Stand out completely from regular local competition by texting a custom room link directly over WhatsApp." }
];

export default function WhyPainters() {
  return (
    <section className="px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">For Contractors</h2>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
          Why Painters Want This
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {painterBenefits.map((benefit, idx) => (
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