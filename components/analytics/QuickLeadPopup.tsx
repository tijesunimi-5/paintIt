// components/analytics/QuickLeadPopup.tsx
"use client";

import React, { useState, useEffect } from "react";

interface QuickLeadPopupProps {
  painterId: string;
}

export function QuickLeadPopup({ painterId }: QuickLeadPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    // Check if they already dismissed or signed up during this browser run
    const activeSubCheck = sessionStorage.getItem(`paintit_popup_subscribed_${painterId}`);
    if (activeSubCheck) return;

    // Wait 5 seconds after page load so it's non-disturbing
    const popupTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(popupTimer);
  }, [painterId]);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/analytics/quick-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, painterId, source: "CLIENT_POPUP" })
      });

      if (res.ok) {
        setSubmitted(true);
        sessionStorage.setItem(`paintit_popup_subscribed_${painterId}`, "true");
        // Dismiss after 2 seconds on success view state
        setTimeout(() => setIsVisible(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-xs w-full bg-neutral-950 border border-neutral-800 p-4 rounded-2xl shadow-2xl animate-slide-up text-white selection:bg-emerald-500 selection:text-black">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">⚡ PaintIt Insider Updates</span>
        <button
          onClick={() => { setIsVisible(false); sessionStorage.setItem(`paintit_popup_subscribed_${painterId}`, "dismissed"); }}
          className="text-neutral-500 hover:text-neutral-300 text-xs font-bold px-1"
        >
          ✕
        </button>
      </div>

      {submitted ? (
        <p className="text-[11px] text-emerald-400 font-bold py-4 text-center">🎉 Locked in! Thanks for joining o!</p>
      ) : (
        <form onSubmit={handleQuickSubmit} className="space-y-2">
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Drop your details to stay updated with premium finishes, discounts, and visualizer tools from this studio space.
          </p>
          <input
            type="text"
            placeholder="Your First Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-[11px] text-white focus:outline-none focus:border-emerald-500/30"
          />
          <input
            type="email"
            required
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-[11px] text-white focus:outline-none focus:border-emerald-500/30"
          />
          <button
            type="submit"
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
          >
            Get Updates
          </button>
        </form>
      )}
    </div>
  );
}