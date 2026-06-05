"use client";
import { motion } from "framer-motion";

const pains = [
  {
    title: "Clients Can't Visualize Colors",
    desc: "Homeowners struggle to map tiny swatch cards to massive walls. This causes endless color confusion and communication breakdown.",
  },
  {
    title: "Pinterest Doesn't Match Reality",
    desc: "Clients bring heavily filtered Pinterest screenshots. They do not understand that physical lighting variations change the color in real life.",
  },
  {
    title: "Mid-Project Client Mind Changes",
    desc: "When the real color hits the wall, clients panic and change their minds mid-project. This causes massive financial loss and project delays for you.",
  },
  {
    title: "Too Much Time Spent Explaining",
    desc: "You waste hours arguing over color outcomes with verbal agreements and no concrete visual anchors.",
  },
  {
    title: "Projects Become Highly Stressful",
    desc: "Mismatched expectations ruin job satisfaction, break client trust, and impact your professional references.",
  }
];

export default function Problem() {
  return (
    <section className="px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-3">The Pain Point</h2>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
          Painting Is Easy. Choosing Colors Isn&apos;t.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pains.map((pain, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="p-6 rounded-xl border border-neutral-900 bg-neutral-900/20 backdrop-blur-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-1.5 h-6 bg-red-500/40 rounded-full mb-4" />
              <h3 className="text-lg font-bold text-neutral-200 mb-2">{pain.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-normal">{pain.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}