"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function EarlyAccessForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "Painter" });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      // 1. Send a flat, clean schema layout matching the backend Zod validator fields
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Capture specific error hints from the backend schema flat validation map
        setErrorMessage(data.error || "Validation error processing registration.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Network communication exception context:", err);
      setErrorMessage("Unable to connect to registration servers. Please check your network context connection.");
    }
  };

  return (
    <section id="early-access" className="px-4 max-w-3xl mx-auto scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="border border-neutral-800 rounded-2xl bg-neutral-900/40 p-6 sm:p-10 backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-transparent to-transparent" />

        <div className="text-center sm:text-left max-w-xl mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">Help shape the future of PaintIt Studio</h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-normal">
            Join the Founder&apos;s Circle. Early access members lock in priority pricing updates, direct input into the product engineering queue, and priority customer support.
          </p>
        </div>

        {/* Dynamic Warning Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center">
            {errorMessage}
          </div>
        )}

        {submitted ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center text-emerald-400">
            <h3 className="font-bold text-base mb-1">Welcome to the Waitlist!</h3>
            <p className="text-xs text-neutral-400">We will notify you immediately when your early access slot opens up.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Samuel Idowu"
                  className="w-full h-11 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="samuel@example.com"
                  className="w-full h-11 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., +2348012345678"
                  className="w-full h-11 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1.5">Your Core Role</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-emerald-500/60 transition appearance-none cursor-pointer"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Painter">Professional Painter</option>
                    <option value="Homeowner">Homeowner / Renter</option>
                    <option value="Designer">Interior Designer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 mt-2 bg-neutral-50 hover:bg-neutral-200 active:scale-[0.99] transition text-neutral-950 font-bold rounded-lg text-sm flex items-center justify-center shadow-lg min-h-[48px]"
            >
              Secure My Priority Access Slot
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
}