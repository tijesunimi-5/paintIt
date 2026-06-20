// app/(client)/dashboard/design/page.tsx
"use client";

import React from "react";
import PaintItCanvas from "@/components/studio/PaintItCanvas";

export default function ClientDashboardDesignPage() {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-neutral-100">My Workspace Projects</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Configure spatial mock structures before broadcasting tenders to the directory feed.</p>
      </div>
      <div className="h-[70vh] w-full">
        <PaintItCanvas mode="CLIENT" onActionTrigger={(type, data) => console.log("Client Action:", type, data)} />
      </div>
    </div>
  );
}