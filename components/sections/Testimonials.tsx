'use client';

import React from 'react';
import { motion } from 'framer-motion';

const systemReviews = [
  { quote: "PaintIt converted our spatial layout workflows instantly. We can map out interior variations directly alongside homeowners within minutes.", author: "Evelyn Sterling", role: "Principal Architect, Atelier Studio" },
  { quote: "Client hesitation disappeared entirely. We hit spatial approval milestones twice as fast by using these clean digital preview boards.", author: "Marcus Thorne", role: "Senior Lead Interior Designer" }
];

export default function Testimonials() {
  return (
    <section className="py-32 bg-neutral-950 px-6 border-t border-neutral-900">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-neutral-500 text-center mb-16">Ecosystem Endorsements</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {systemReviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="flex flex-col justify-between p-8 rounded-2xl bg-neutral-900/20 border border-neutral-900"
            >
              <p className="text-lg text-neutral-300 font-light italic leading-relaxed mb-8">
                &ldquo;{review.quote}&rdquo;
              </p>
              <div>
                <h4 className="text-sm font-medium text-white tracking-tight">{review.author}</h4>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-mono mt-1">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}