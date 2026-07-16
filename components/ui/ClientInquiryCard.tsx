"use client";
import { useState } from "react";
import { InboundLead } from "@/types/feedback";

interface InquiryCardProps {
  lead: InboundLead;
  isPlanQualified: boolean;
}

export function ClientInquiryCard({ lead, isPlanQualified }: InquiryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const is3DFeedback = lead.conversion_source === "DESIGN_FEEDBACK";
  const isPopupLead = lead.conversion_source === "CLIENT_POPUP" || lead.conversion_source === "POPUP_CAPTURE";

  // Parse raw text to separate user note from color swatches
  let userNote = lead.project_description || "";
  let extractedColors: Record<string, string> | null = lead.roomColors || null;

  if (userNote.includes("🎨 Chosen Colors:")) {
    const parts = userNote.split("🎨 Chosen Colors:");
    userNote = parts[0].trim();
    if (!extractedColors && parts[1]) {
      try {
        extractedColors = JSON.parse(parts[1].trim());
      } catch {
        extractedColors = null;
      }
    }
  }

  return (
    <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-3 transition-colors hover:bg-neutral-900/70 shadow-md">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-tight text-neutral-200">
            {lead.client_name || "Interested Client"}
          </span>
          <span
            className={`text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded font-bold ${is3DFeedback
                ? "bg-cyan-950/40 border-cyan-800/60 text-cyan-400"
                : isPopupLead
                  ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                  : "bg-neutral-950 border-neutral-850 text-neutral-400"
              }`}
          >
            {is3DFeedback ? "🎨 3D Color Selection" : isPopupLead ? "🎯 Subscriber" : "💼 Job Request"}
          </span>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">
          {new Date(lead.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Clean User Note */}
      <div className="bg-black/40 p-3 rounded-lg border border-neutral-900/60">
        <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
          {userNote || "No text attached."}
        </p>
      </div>

      {/* 🎨 Expandable Visual Swatches Accordion (For 3D Selection Leads) */}
      {extractedColors && Object.keys(extractedColors).length > 0 && (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>{isExpanded ? "Hide Swatch Matrix ▲" : "Inspect Selected Swatches (▼)"}</span>
          </button>

          {isExpanded && (
            <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in">
              {Object.entries(extractedColors).map(([surface, hex]) => (
                <div key={surface} className="flex items-center gap-2 p-1.5 bg-neutral-900/60 border border-neutral-850 rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-inner"
                    style={{ backgroundColor: hex }}
                  />
                  <div className="flex flex-col truncate">
                    <span className="text-[9px] font-bold text-neutral-300 uppercase truncate">{surface}</span>
                    <span className="text-[8px] font-mono text-neutral-500 uppercase">{hex}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Contact Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-900/60 text-[11px]">
        {lead.isLocked || !isPlanQualified ? (
          <span className="text-neutral-500 font-bold flex items-center gap-1 select-none text-[10px]">
            🔒 Upgrade plan to view client contact details.
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-3 w-full justify-between">
            <span className="text-neutral-400 font-medium">
              Email: <span className="select-all text-neutral-200 font-mono font-bold">{lead.client_email}</span>
            </span>
            {lead.client_phone && !isPopupLead && (
              <a
                href={`https://wa.me/${lead.client_phone.replace(/\s+/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1 text-[10px] uppercase tracking-wider"
              >
                💬 WhatsApp Chat ➔
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}