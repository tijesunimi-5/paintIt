"use client";
import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Open PaintIt Mobile", desc: "Access the lightweight interface right on your phone at the job site with zero heavy downloads." },
  { step: "02", title: "Select Target Colors", desc: "Pick from curated commercial color charts or specify custom hex inputs dynamically." },
  { step: "03", title: "Configure The Walls", desc: "Toggle standard or split-wall modes to customize the room template to match the job site." },
  { step: "04", title: "Export Web Share Link", desc: "Generate a secure, compressed visualization link ready to text to your client over WhatsApp." },
  { step: "05", title: "Get Secure Approval", desc: "Lock in color choices before buying materials, protecting you from mid-project changes." }
];

export default function HowItWorks() {
  return (
    <section className="px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Workflow Workflow</h2>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
          Five Steps To Complete Protection
        </p>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {steps.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="relative flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono font-bold text-emerald-500 mb-2">{item.step}</div>
              <h3 className="text-sm font-bold text-neutral-200 mb-1">{item.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">{item.desc}</p>
            </div>
            {idx < 4 && (
              <div className="hidden lg:block absolute top-2 right-[-12px] w-[24px] h-[1px] bg-neutral-800" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}