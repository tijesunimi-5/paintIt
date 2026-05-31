'use client';

import React from 'react';
import { motion } from 'framer-motion';

const realWorldValues = [
  {
    num: "01",
    title: "Instant Client Confidence",
    desc: "Students and landlords can see their hostel rooms realistically in seconds. They choose their accent walls instantly, removing hesitation so you can close contracts on your first meeting."
  },
  {
    num: "02",
    title: "Zero Material Waste",
    desc: "When clients approve the color scheme digitally, there are no surprises on site. Eliminate costly re-painting mistakes, disputes, and wasted paint buckets entirely."
  },
  {
    num: "03",
    title: "Stand Out Professionally",
    desc: "Don't just text clients a basic price estimate. Send them a link to their custom interactive 3D room. It makes your business look like a premium agency and beats any local competitor."
  }
];

export default function Features() {
  return (
    <section id="value-matrix" className="py-32 bg-neutral-950 px-6 border-t border-neutral-900">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="mb-24">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-mono">Why Work With Us</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white max-w-2xl font-serif">
            Transforming how clients experience interior decoration.
          </h2>
        </div>

        {/* Value Core Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {realWorldValues.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: 'easeOut' }}
              viewport={{ once: true, margin: '-60px' }}
              className="p-8 bg-neutral-900/30 rounded-2xl border border-neutral-900/60 flex flex-col justify-between h-auto hover:border-neutral-800 transition-colors duration-300"
            >
              <div>
                <div className="text-xs font-mono text-neutral-600 mb-10">{value.num}</div>
                <h3 className="text-lg font-medium text-white mb-3 tracking-tight">{value.title}</h3>
                <p className="text-neutral-400 font-light text-sm leading-relaxed">{value.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Closing Pitch Footer */}
        <div className="mt-24 pt-12 border-t border-neutral-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-medium text-white tracking-tight">Ready to upgrade your client presentations?</h4>
            <p className="text-xs text-neutral-500 font-light mt-1">Let us build a custom interactive 3D portfolio tailored specifically for your business.</p>
          </div>
          <button
            onClick={() => document.getElementById('studio-showcase')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-mono font-medium text-black bg-white px-5 py-3 rounded-full hover:bg-neutral-200 transition-all shadow-md"
          >
            LET&apos;S LAUNCH THE DEMO →
          </button>
        </div>

      </div>
    </section>
  );
}