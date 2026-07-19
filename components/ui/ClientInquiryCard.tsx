"use client";
import { useState } from "react";
import { InboundLead } from "@/types/feedback";

interface InquiryCardProps {
  lead: InboundLead;
  isPlanQualified?: boolean;
}

const SURFACE_LABELS: Record<string, string> = {
  wallLeft: "Left Wall",
  wallRight: "Right Wall",
  wallBack: "Back Wall",
  wallFront: "Front Accent Wall",
  ceiling: "Ceiling",
  floor: "Floor / Base"
};

export function ClientInquiryCard({ lead, isPlanQualified = true }: InquiryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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

  // Real client email resolution
  const displayEmail = lead.client_email && lead.client_email.trim() ? lead.client_email.trim() : "client@paintit.app";

  return (
    <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-3 transition-colors hover:bg-neutral-900/70 shadow-md">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-tight text-neutral-200">
            {lead.client_name || "Interested Client"}
          </span>
          <span
            className={`text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded font-bold ${
              is3DFeedback
                ? "bg-cyan-950/40 border-cyan-800/60 text-cyan-400"
                : isPopupLead
                ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                : "bg-neutral-950 border-neutral-850 text-neutral-400"
            }`}
          >
            {is3DFeedback ? "🎨 3D Color Selection" : isPopupLead ? "🎯 Subscriber" : "💼 Job Request"}
          </span>
          {lead.finish && (
            <span className="text-[9px] uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded font-bold">
              ✨ {lead.finish}
            </span>
          )}
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">
          {new Date(lead.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Clean User Note */}
      <div className="bg-black/40 p-3 rounded-lg border border-neutral-900/60">
        <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
          {userNote || "No text attached."}
        </p>
      </div>

      {/* 🎨 Prominent 3D Color Preference Visual Swatches */}
      {extractedColors && Object.keys(extractedColors).length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              🎨 Selected 3D Room Colors ({Object.keys(extractedColors).length} Surfaces)
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px] text-neutral-400 hover:text-white uppercase font-bold"
            >
              {isExpanded ? "Collapse ▲" : "Expand ▼"}
            </button>
          </div>

          {isExpanded && (
            <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2.5 shadow-inner">
              {Object.entries(extractedColors).map(([surface, hex]) => (
                <div key={surface} className="flex items-center gap-2.5 p-2 bg-neutral-900/80 border border-neutral-800 rounded-lg">
                  {/* Visual Color Preview Box */}
                  <div
                    className="w-7 h-7 rounded-md border border-white/20 shrink-0 shadow-md transition-transform hover:scale-110"
                    style={{ backgroundColor: hex }}
                    title={`${SURFACE_LABELS[surface] || surface}: ${hex}`}
                  />
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] font-bold text-neutral-200 truncate">
                      {SURFACE_LABELS[surface] || surface}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold">
                      {hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Contact Info - Always Loads Real Client Email & Pre-Filled WhatsApp */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-900/60 text-[11px]">
        {lead.isLocked ? (
          <span className="text-neutral-500 font-bold flex items-center gap-1 select-none text-[10px]">
            🔒 Contact details locked by system admin.
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5 w-full justify-between">
            <a
              href={`mailto:${displayEmail}?subject=${encodeURIComponent(`PaintIT Studio - Project Inquiry for ${lead.client_name || 'Client'}`)}&body=${encodeURIComponent(`Hi ${lead.client_name || 'there'},\n\nI reviewed your inquiry on PaintIT Studio${extractedColors ? ` and your 3D color selections (${Object.keys(extractedColors).length} surfaces${lead.finish ? ` in ${lead.finish} finish` : ''})` : ''}.\n\nI would be delighted to provide a quote and assist with your project!\n\nBest regards,`)}`}
              className="text-neutral-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors group"
            >
              ✉️ Real Email: <span className="select-all text-emerald-300 font-mono font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 group-hover:border-emerald-500/50">{displayEmail}</span>
            </a>

            {lead.client_phone ? (
              <a
                href={`https://wa.me/${lead.client_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${lead.client_name || 'there'}! I'm reviewing your inquiry on PaintIT Studio${extractedColors ? ` regarding your 3D color selection (${Object.keys(extractedColors).length} surfaces${lead.finish ? ` in ${lead.finish} finish` : ''})` : ''}. I'd love to assist with your project and provide a quote!`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                💬 WhatsApp Client ➔
              </a>
            ) : (
              <a
                href={`mailto:${displayEmail}?subject=${encodeURIComponent(`PaintIT Studio - Project Inquiry`)}`}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center gap-1 text-[10px] uppercase tracking-wider bg-cyan-950/40 border border-cyan-800/60 px-2.5 py-1 rounded-lg transition-all"
              >
                ✉️ Email Client ➔
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}