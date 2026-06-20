// app/(public)/workspace/page.tsx
"use client";

import React from "react";
import PaintItCanvas, { SwatchActionMeta } from "@/components/studio/PaintItCanvas";

export default function PublicFullscreenWorkspacePage() {
  // ✅ FIX 2 & 3: Specified explicit metadata types and removed the unused parameter constraint
  const handlePublicCanvasAction = (actionType: string, _meta: SwatchActionMeta | Record<string, unknown>) => {
    if (actionType === "UPSELL_CLICK") {
      alert("🔥 Product Hook: Love this finish? Create a free PaintIt account to save this custom scheme or send it straight to premium verified local painters in Ibadan! o");
    }
  };

  return (
    <div className="h-[80vh] w-full p-2 max-w-7xl mx-auto">
      <PaintItCanvas mode="PUBLIC" onActionTrigger={handlePublicCanvasAction} />
    </div>
  );
}