"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import ConfirmModal from "@/components/modals/ConfirmModal";

interface MasterTemplate {
  id: string;
  title: string;
  category: string;
  model_url: string;
  plan_type: string;
  price: string;
  thumbnail_icon: string;
}

interface SavedVisualization {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: unknown;
  created_at: string;
}

export default function Painter3DStudioDashboardHub() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const [catalog, setCatalog] = useState<MasterTemplate[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<SavedVisualization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Modal Configuration States Tracker
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MasterTemplate | null>(null);

  // Deletion Tracking Parameters
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [designTargetForDelete, setDesignTargetForDelete] = useState<SavedVisualization | null>(null);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let isMounted = true;

    const loadDashboardStudioData = async () => {
      if (!accessToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const fallbackCatalog: MasterTemplate[] = [
          { id: "tmpl_living_lux", title: "Luxury Minimalist Living Room", category: "INTERIOR", model_url: "/models/living_lux.glb", plan_type: "FREE", price: "0.00", thumbnail_icon: "🛋️" },
          { id: "tmpl_bed_nordic", title: "Nordic Executive Bedroom Layout", category: "INTERIOR", model_url: "/models/bed_nordic.glb", plan_type: "RENTAL", price: "2500.00", thumbnail_icon: "🛏️" },
          { id: "tmpl_office_corp", title: "Corporate Creative Studio Office", category: "COMMERCIAL", model_url: "/models/office_corp.glb", plan_type: "BUY", price: "6000.00", thumbnail_icon: "🏢" },
          { id: "tmpl_accent_geometric", title: "Geometric POP Screeding Accent Wall", category: "ACCENT", model_url: "/models/accent_geometric.glb", plan_type: "FREE", price: "0.00", thumbnail_icon: "📐" }
        ];

        const catalogRes = await fetch(`${BACKEND_API_URL}/api/visualizations/catalog`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch(() => null);

        if (isMounted) {
          if (catalogRes && catalogRes.ok) {
            const catData = await catalogRes.json();
            setCatalog(catData.catalog?.length ? catData.catalog : fallbackCatalog);
          } else {
            setCatalog(fallbackCatalog);
          }
        }

        const savedRes = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }).catch(() => null);

        if (isMounted && savedRes && savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedDesigns(savedData.visualizations || []);
        }

      } catch (err) {
        console.error("3D Studio data processing exception:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardStudioData();

    return () => { isMounted = false; };
  }, [accessToken, BACKEND_API_URL]);

  useEffect(() => {
    if (!redirectUrl) return;
    window.location.href = redirectUrl;
  }, [redirectUrl]);

  const shareToWhatsAppStream = async (design: SavedVisualization) => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/visualizations/${design.id}/share`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        const whatsappText = encodeURIComponent(
          `Hello! Check out the custom 3D wall color scheme layout I designed for your property on PaintIt Studio: ${window.location.origin}/view/${data.shareId}`
        );
        window.open(`https://wa.me/?text=${whatsappText}`, "_blank");
        showToast({ message: "WhatsApp link generated successfully.", severity: "success" });
      } else {
        throw new Error("Sharing endpoint failure.");
      }
    } catch (err) {
      console.error("Link generation failure:", err);
      navigator.clipboard.writeText(`${window.location.origin}/workspace?id=${design.id}`);
      showToast({ message: "Workspace workspace url link copied directly.", severity: "info" });
    }
  };

  const handleLaunchRequest = (template: MasterTemplate) => {
    setSelectedTemplate(template);
    setModalSuccess(false);
    setModalOpen(true);
  };

  const executeTemplateLoad = () => {
    if (!selectedTemplate) return;
    setModalSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
      setRedirectUrl(`/workspace?template=${selectedTemplate.id}`);
    }, 1500);
  };

  const initializeDeleteWorkflow = (e: React.MouseEvent, design: SavedVisualization) => {
    e.preventDefault();
    e.stopPropagation();
    setDesignTargetForDelete(design);
    setDeleteOpen(true);
  };

  const commitDeletionToDatabase = async () => {
    if (!designTargetForDelete) return;

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/visualizations/${designTargetForDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      if (res.ok) {
        setSavedDesigns((prev) => prev.filter(item => item.id !== designTargetForDelete.id));
        showToast({ message: "Project mockup cleanly deleted from dashboard.", severity: "success" });
      } else {
        showToast({ message: "Failed removing entry from cloud indices.", severity: "error" });
      }
    } catch (err) {
      console.error("Delete exception caught:", err);
    }
  };

  const filteredCatalog = catalog.filter(item => activeTab === "ALL" || item.category === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] w-full flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase text-neutral-600 font-bold tracking-widest">Opening 3D Workspace Engine...</span>
      </div>
    );
  }

  return (
    <div className="w-full text-white space-y-8 animate-fade-in pb-16 selection:bg-emerald-500 selection:text-black">

      {/* HEADER SECTION */}
      <div className="border-b border-neutral-900 pb-5">
        <h1 className="text-xl font-black uppercase tracking-tight text-neutral-100">3D Design Studio</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Select structural rooms, experiment with dynamic color variations, and share realistic 3D visualizations with your clients.
        </p>
      </div>

      {/* ZONE 1: PAINTER'S SAVED WORKSPACES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pl-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-400">Your Saved Color Concepts</h2>
          <span className="text-[10px] bg-neutral-900 text-neutral-500 border border-neutral-850 font-mono px-2 py-0.5 rounded-md">
            {savedDesigns.length} Mockups
          </span>
        </div>

        {savedDesigns.length === 0 ? (
          <div className="p-10 bg-neutral-950/40 border border-neutral-900 border-dashed rounded-3xl text-center space-y-3 flex flex-col items-center justify-center max-w-md mx-auto">
            <span className="text-2xl select-none opacity-40">🎨</span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide text-neutral-300">Your custom designs library is empty</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed max-w-xs mx-auto mt-1">
                Pick an available room model from the catalog below to apply your color schemes, then save them here for quick client viewing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("catalog-section-scroller")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
            >
              ↓ View Room Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDesigns.map((design) => (
              <div
                key={design.id}
                className="group p-5 bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-2xl flex flex-col justify-between shadow-xl transition-all duration-150 relative"
              >
                <button
                  type="button"
                  onClick={(e) => initializeDeleteWorkflow(e, design)}
                  className="absolute top-4 right-4 text-neutral-600 hover:text-red-400 text-[10px] font-bold uppercase transition-colors"
                  title="Delete this layout concept variant safely"
                >
                  ✕ Delete
                </button>

                <div className="space-y-3 pr-12">
                  <div>
                    <h4 className="text-sm font-black text-neutral-100 uppercase tracking-wide group-hover:text-emerald-400 transition-colors truncate">
                      {design.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                      Template: <span className="text-neutral-400 font-bold">{design.parent_template_name}</span>
                    </p>
                  </div>
                  <span className="text-[9px] text-neutral-600 font-bold block">
                    Created: {new Date(design.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <div className="flex gap-2 pt-4 mt-4 border-t border-neutral-900/60">
                  <button
                    type="button"
                    onClick={() => { window.location.href = `/workspace?id=${design.id}`; }}
                    className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-neutral-300"
                  >
                    Open Canvas ➔
                  </button>
                  <button
                    type="button"
                    onClick={() => shareToWhatsAppStream(design)}
                    className="px-3.5 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 border border-emerald-500/20 hover:text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center"
                  >
                    💬 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ZONE 2: MASTER BLENDER SCENE CATALOG */}
      <div id="catalog-section-scroller" className="space-y-4 pt-4 border-t border-neutral-900/40">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-1">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-400">Available 3D Room Templates</h2>
            <p className="text-[10px] text-neutral-500 mt-0.5">Load pre-built structures straight into the coloring tool deck panels.</p>
          </div>

          <div className="flex bg-neutral-950 border border-neutral-900 p-0.5 rounded-xl w-fit self-start sm:self-auto">
            {["ALL", "INTERIOR", "COMMERCIAL", "ACCENT"].map((categoryKey) => (
              <button
                key={categoryKey}
                type="button"
                onClick={() => setActiveTab(categoryKey)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === categoryKey
                  ? "bg-neutral-900 text-emerald-400 border border-neutral-800"
                  : "text-neutral-500 hover:text-neutral-300"
                  }`}
              >
                {categoryKey}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCatalog.map((template) => {
            const isPremiumPlan = template.plan_type !== "FREE";

            return (
              <div
                key={template.id}
                className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-850 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all"
              >
                <div className="space-y-4">
                  <div className="w-full h-32 bg-neutral-900 border border-neutral-850 group-hover:border-neutral-750 transition-colors rounded-xl flex flex-col items-center justify-center relative overflow-hidden select-none">

                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${isPremiumPlan
                        ? "bg-amber-950/40 border-amber-900/50 text-amber-400"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400"
                        }`}>
                        {template.plan_type}
                      </span>
                    </div>

                    <span className="text-3xl filter drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                      {template.thumbnail_icon}
                    </span>

                    <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest mt-2 block">
                      {template.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-neutral-200 uppercase tracking-wide group-hover:text-emerald-400 transition-colors truncate">
                      {template.title}
                    </h3>
                    <div className="mt-1 text-[11px] text-neutral-500 font-medium">
                      {isPremiumPlan ? (
                        <p>Cost to Unlock: <span className="text-amber-400 font-mono font-bold">₦{Number(template.price).toLocaleString()}</span></p>
                      ) : (
                        <p className="text-emerald-500/80 font-bold">Included Free</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-neutral-900/60">
                  <button
                    type="button"
                    onClick={() => handleLaunchRequest(template)}
                    className={`w-full py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border ${isPremiumPlan
                      ? "bg-neutral-900/40 border-neutral-850 text-amber-400 hover:bg-neutral-900 hover:border-amber-500/20"
                      : "bg-neutral-900 hover:bg-emerald-500 border-neutral-850 hover:border-emerald-500 text-neutral-300 hover:text-black shadow-inner"
                      }`}
                  >
                    {isPremiumPlan ? "Launch Trial Mode ➔" : "Load Room Studio ➔"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRMATION POPUP MODAL */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={executeTemplateLoad}
        title={modalSuccess ? "Workspace Ready" : "Load Room Template"}
        message={
          modalSuccess
            ? `Setting up canvas layout environment paths for "${selectedTemplate?.title}" structure.`
            : `Are you sure you want to load "${selectedTemplate?.title}" into your main workspace studio canvas?`
        }
        confirmText="Launch Engine"
        cancelText="Go Back"
        isSuccessState={modalSuccess}
      />

      {/* SAfE DELETION DECK CONFIRMATION INTERFACE POPUP */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          commitDeletionToDatabase();
          setDeleteOpen(false);
        }}
        title="Delete Design Layout?"
        message={`Are you sure you want to permanently remove "${designTargetForDelete?.name}" from your saved studio layouts folder? This action cannot be reversed.`}
        confirmText="Yes, Delete Design"
        cancelText="Cancel"
      />

    </div>
  );
}