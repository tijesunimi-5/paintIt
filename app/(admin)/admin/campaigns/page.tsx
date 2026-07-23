"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminCampaignsComposer() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const [subject, setSubject] = useState<string>("");
  const [bodyContent, setBodyContent] = useState<string>("");
  const [targetGroup, setTargetGroup] = useState<string>("ALL");
  const [sending, setSending] = useState<boolean>(false);
  const [results, setResults] = useState<{ successCount: number; totalRecipients: number } | null>(null);

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !bodyContent.trim()) {
      showToast({ message: "⚠️ Subject and message body content are required.", severity: "error" });
      return;
    }

    setSending(true);
    setResults(null);

    try {
      const token = accessToken || localStorage.getItem("paintit_access_token") || "";
      const res = await fetch(`${BACKEND_API_URL}/api/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: subject.trim(),
          bodyContent: bodyContent.trim(),
          targetGroup
        })
      });

      const data = await res.json();

      if (res.ok) {
        setResults({
          successCount: data.successCount || 0,
          totalRecipients: data.totalRecipients || 0
        });
        showToast({ message: "📣 Campaign broadcast completed successfully!", severity: "success" });
        setSubject("");
        setBodyContent("");
      } else {
        showToast({ message: `❌ Broadcast failed: ${data.error || "Server error"}`, severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "💥 Connection or dispatch logic fault on network server.", severity: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-neutral-950 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-100">📣 Email Campaign Composer</h1>
        <p className="text-xs text-neutral-500 font-medium mt-1">
          Compose transactional announcements or marketing broadcasts directed at specific user segments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composition Form */}
        <div className="lg:col-span-2 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">Compose Broadcast</h3>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4">
            {/* Target Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Target Recipient Group</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all"
              >
                <option value="ALL">All Registered Users (Painters, Designers, Homeowners)</option>
                <option value="PAINTER">Registered Painters Only</option>
                <option value="DESIGNER">Registered Interior Designers Only</option>
                <option value="CONSUMER">Registered Property Homeowners Only</option>
                <option value="ARCHITECT">Registered Architects Only</option>
                <option value="WAITLIST">Waiting List Leads Signups Only</option>
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Email Subject Line</label>
              <input
                type="text"
                required
                placeholder="e.g. PaintIT Studio V2 is Live! Explore PBR Floor Textures Today"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none transition-all"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Email Content Body</label>
                <span className="text-[9px] text-neutral-600 font-mono">Plaintext with pre-wrap spacing support</span>
              </div>
              <textarea
                required
                rows={12}
                placeholder={`Dear Member,\n\nWe have just released an amazing new update to PaintIT Studio. You can now apply high-fidelity wood and marble floor textures to your models...\n\nSincerely,\nPaintIT Team`}
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-neutral-700 focus:outline-none transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-neutral-100 hover:bg-white text-neutral-950 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:bg-neutral-800 disabled:text-neutral-500 flex items-center justify-center gap-1"
            >
              {sending ? "📣 Dispatching Messages..." : "📣 Send Broadcast Mailer ➔"}
            </button>
          </form>
        </div>

        {/* Campaign Tips & Last Run Stats */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450">💡 Formatting Advice</h3>
            <ul className="space-y-2 text-[11px] text-neutral-400 list-disc list-inside leading-relaxed">
              <li>Use the dropdown target selector to focus on specific niches.</li>
              <li>Keep subject lines catchy to increase open rates (recommend 40-60 characters).</li>
              <li>PaintIT automatically wraps your text in a verified luxury dark email template for consistent aesthetics.</li>
              <li>Avoid spam triggers: limit exclamation marks and words like "FREE CASH".</li>
            </ul>
          </div>

          {/* Last Run Stats */}
          {results && (
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl space-y-4 animate-fade-in">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">📊 Last Broadcast Log</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Sent</span>
                  <span className="text-lg font-black text-white mt-1 block">{results.successCount}</span>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Recipients</span>
                  <span className="text-lg font-black text-white mt-1 block">{results.totalRecipients}</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                Email campaign completed delivery. Performance reports are tracked inside Brevo's outbound transactional portal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
