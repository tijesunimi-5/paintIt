"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

// Modular Canvas & Controls
import WorkspaceCanvas from "@/components/canvas/WorkspaceCanvas";
import PaintPicker, { CustomColor } from "@/components/canvas/PaintPicker";
import LightControls, { BulbState } from "@/components/canvas/LightControls";

export interface DBCameraConfig {
  position?: [number, number, number];
  target?: [number, number, number];
  floorLimitAngle?: number;
  ceilingLimitAngle?: number;
  maxZoomDistance?: number;
}

export interface DBRawLight {
  id: string;
  type: "point" | "spot";
  color: string;
  intensity: number;
  position: [number, number, number];
  visible?: boolean;
  scale?: [number, number, number];
  rotation?: [number, number, number];
  distance?: number;
}

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const urlDesignId = searchParams?.get("id") || null;
  const urlTemplateId = searchParams?.get("template") || "tmpl_hostel_lux";

  // System UI Panels States
  const [activeTab, setActiveTab] = useState<"paint" | "lighting">("paint");
  const [activeSurface, setActiveSurface] = useState<string>("wallFront");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Custom Save Modal States
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Bottom Resizable Panel Sheet Configurations
  const [panelHeight, setPanelHeight] = useState<number>(280);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);
  const isDragging = useRef<boolean>(false);

  // Dynamic Scene States
  const [designTitle, setDesignTitle] = useState<string>("Custom Design Concept");
  const [modelUrl, setModelUrl] = useState<string>("/models/selfcon.glb");
  const [templateId, setTemplateId] = useState<string>(urlTemplateId);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  // Default Fallback Colors (if DB is empty)
  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    floor: "#f2f0ea",
    ceiling: "#ffffff",
    wallFront: "#C4B199",
    wallBack: "#C4B199",
    wallLeft: "#C4B199",
    wallRight: "#C4B199",
    toilet: "#C4B199"
  });

  const [bulbs, setBulbs] = useState<BulbState[]>([]);

  const [cameraConfig, setCameraConfig] = useState<DBCameraConfig>({
    position: [-2.73, 3.28, -2.51],
    target: [-1.94, 2.7, 0.05],
    floorLimitAngle: 1.85,
    ceilingLimitAngle: 0,
    maxZoomDistance: 0.55
  });

  const [customColors, setCustomColors] = useState<CustomColor[]>([]);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const initialRoomColorsRef = useRef(roomColors);
  const initialCameraConfigRef = useRef(cameraConfig);

  // Deep Hydration Loop
  useEffect(() => {
    let isMounted = true;
    const hydrateWorkspace = async () => {
      try {
        const activeToken = accessToken || (typeof window !== "undefined" ? localStorage.getItem("paintit_access_token") : null);
        let resolvedTemplateId = urlTemplateId;
        let activeColors = { ...initialRoomColorsRef.current };
        let activeLights: BulbState[] = [];
        let activeCamera = { ...initialCameraConfigRef.current };
        let loadedTitle = "Custom Design Concept";
        let resolvedModelPath = "/models/selfcon.glb";
        let resolvedNightMode = false;

        // 🚀 FETCH 1: Get complete template configurations
        const templateRes = await fetch(`${BACKEND_API_URL}/api/visualizations/catalog/${resolvedTemplateId}`).catch(() => null);

        if (templateRes && templateRes.ok) {
          const templateData = await templateRes.json();
          console.log("📥 Deep Hydrated Catalog Template Config:", templateData);

          if (templateData) {
            loadedTitle = templateData.title || loadedTitle;
            resolvedModelPath = templateData.model_url || resolvedModelPath;

            if (templateData.default_room_data) {
              activeColors = templateData.default_room_data;
            }

            if (templateData.lighting_settings) {
              activeLights = templateData.lighting_settings.map((light: DBRawLight) => ({
                ...light,
                enabled: light.visible !== undefined ? light.visible : true,
                visible: light.visible !== undefined ? light.visible : true
              }));
            }

            if (templateData.camera_settings) {
              activeCamera = templateData.camera_settings;
            }

            if (templateData.global_environment) {
              resolvedNightMode = templateData.global_environment.isNightMode ?? false;
            }
          }
        }

        // 🚀 FETCH 2: Overwrite defaults if editing a saved project design ID
        if (urlDesignId && activeToken) {
          const visRes = await fetch(`${BACKEND_API_URL}/api/visualizations/${urlDesignId}`, {
            headers: { "Authorization": `Bearer ${activeToken}` }
          }).catch(() => null);

          if (visRes && visRes.ok) {
            const visData = await visRes.json();
            console.log("📥 Deep Hydrated Saved Layout:", visData);
            if (visData.visualization) {
              loadedTitle = visData.visualization.name;
              activeColors = visData.visualization.room_data || visData.visualization.roomData || activeColors;

              const savedLights = visData.visualization.light_data || visData.visualization.lightData;
              if (savedLights && savedLights.length > 0) {
                activeLights = savedLights.map((light: DBRawLight) => ({
                  ...light,
                  enabled: light.visible !== undefined ? light.visible : true,
                  visible: light.visible !== undefined ? light.visible : true
                }));
              }

              if (visData.visualization.camera_data || visData.visualization.cameraData) {
                activeCamera = visData.visualization.camera_data || visData.visualization.cameraData;
              }

              if (visData.visualization.global_environment || visData.visualization.globalEnvironment) {
                const env = visData.visualization.global_environment || visData.visualization.globalEnvironment;
                resolvedNightMode = env.isNightMode ?? resolvedNightMode;
              }
              resolvedTemplateId = visData.visualization.master_design_id || visData.visualization.masterDesignId || visData.visualization.parent_template_id || urlTemplateId;
            }
          }
        }

        if (isMounted) {
          setRoomColors(activeColors);
          setBulbs(activeLights);
          setCameraConfig(activeCamera);
          setTemplateId(resolvedTemplateId);
          setDesignTitle(loadedTitle);
          setSaveName(loadedTitle);
          setModelUrl(resolvedModelPath);
          setIsNightMode(resolvedNightMode);
        }
      } catch (err) {
        console.error("Hydration processing error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrateWorkspace();
    return () => { isMounted = false; };
  }, [urlDesignId, urlTemplateId, accessToken, BACKEND_API_URL]);

  useEffect(() => {
      const lockOrientation = async () => {
        try {
          // Check if Screen Orientation API is supported on the device
          if (typeof window !== "undefined" && "orientation" in screen && "lock" in screen.orientation) {
            // Force landscape orientation
            await (screen.orientation as ScreenOrientation).lock("landscape");
          }
        } catch (err) {
          // Mobile browsers require a user gesture (like clicking 'Launch Visualizer') to lock orientation
          console.log("Auto-landscape lock requires user interaction or isn't supported on this browser:", err);
        }
      };
  
      lockOrientation();
  
      // 🎯 Clean up: Return to portrait/any orientation when leaving the 3D page
      return () => {
        try {
          if (typeof window !== "undefined" && "orientation" in screen && "unlock" in screen.orientation) {
            screen.orientation.unlock();
          }
        } catch (err) {
          console.log("Failed to unlock orientation:", err);
        }
      };
    }, []);

  const startDrag = () => {
    isDragging.current = true;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", onDrag);
    document.addEventListener("touchend", stopDrag);
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const calculatedHeight = window.innerHeight - clientY;

    if (calculatedHeight > 140 && calculatedHeight < window.innerHeight * 0.85) {
      setPanelHeight(calculatedHeight);
      setIsPanelCollapsed(false);
    }
  };

  const stopDrag = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", stopDrag);
  };

  const handleTabFABClick = (tab: "paint" | "lighting") => {
    setActiveTab(tab);
    setIsPanelCollapsed(false);
  };

  const triggerSaveModal = () => {
    setSaveName(designTitle);
    setSaveModalOpen(true);
  };

  const handleSaveWorkspace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!saveName.trim()) {
      showToast({ message: "Please enter a valid save name.", severity: "info" });
      return;
    }

    const activeToken = accessToken || localStorage.getItem("paintit_access_token");
    if (!activeToken) {
      showToast({ message: "Session expired. Please log in again.", severity: "error" });
      return;
    }

    setIsSaving(true);

    try {
      const saveBody = {
        id: urlDesignId,
        name: saveName.trim(),
        roomData: roomColors,
        room_data: roomColors,
        lightData: bulbs,
        light_data: bulbs,
        cameraData: cameraConfig,
        camera_data: cameraConfig,
        globalEnvironment: { isNightMode },
        global_environment: { isNightMode },
        masterDesignId: templateId,
        master_design_id: templateId,
        parent_template_id: templateId
      };

      const res = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(saveBody)
      });

      if (res.ok) {
        showToast({ message: "Design synced successfully!", severity: "success" });
        setDesignTitle(saveName.trim());
        setSaveModalOpen(false);
        router.push("/designs");
      } else {
        showToast({ message: "Error synchronizing configuration.", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Network connection failure.", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 z-50">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] tracking-widest text-neutral-500 uppercase font-black">Spawning Spatial Deck...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-950 flex flex-col overflow-hidden text-white font-sans">
      <header className="w-full bg-neutral-950/85 border-b border-neutral-900 px-4 py-3 flex items-center justify-between z-30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-wide text-white truncate max-w-37.5">
            {designTitle}
          </span>
          <span className="text-[10px] text-neutral-500 uppercase mt-0.5">
            Active: <span className="text-emerald-400 font-bold">{activeSurface.replace(/_/g, " ")}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/designs")}
            className="px-3 py-1.5 bg-neutral-900 text-[10px] font-black uppercase tracking-wider rounded-xl text-neutral-400 border border-neutral-850"
          >
            Exit
          </button>
          <button
            onClick={triggerSaveModal}
            className="hidden md:inline-block px-4 py-1.5 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg"
          >
            Save Layout ➔
          </button>
        </div>
      </header>

      <section className="flex-1 w-full h-full relative z-10">
        <Canvas camera={{ position: cameraConfig.position || [-2.73, 3.28, -2.51], fov: 65 }}>
          <WorkspaceCanvas
            modelUrl={modelUrl}
            roomColors={roomColors}
            activeSurface={activeSurface}
            onSurfaceSelect={setActiveSurface}
            bulbs={bulbs}
            cameraConfig={cameraConfig}
            roomTextures={{}}
            isNightMode={isNightMode}
          />
        </Canvas>
      </section>

      <div className="absolute right-4 bottom-75 z-20 flex flex-col gap-2">
        <button
          onClick={triggerSaveModal}
          className="w-12 h-12 rounded-full bg-emerald-500 border border-emerald-400 text-neutral-950 flex items-center justify-center shadow-2xl font-bold animate-bounce hover:scale-105 transition-transform"
          title="Save Layout Safely"
        >
          💾
        </button>
        <button
          onClick={() => handleTabFABClick("paint")}
          className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-2xl transition-all ${activeTab === "paint" && !isPanelCollapsed
            ? "bg-emerald-500 border-emerald-400 text-neutral-950"
            : "bg-neutral-900/90 border-neutral-800 text-white"
            }`}
          title="Paint Picker"
        >
          🎨
        </button>
        <button
          onClick={() => handleTabFABClick("lighting")}
          className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-2xl transition-all ${activeTab === "lighting" && !isPanelCollapsed
            ? "bg-emerald-500 border-emerald-400 text-neutral-950"
            : "bg-neutral-900/90 border-neutral-800 text-white"
            }`}
          title="Bulb Switches"
        >
          💡
        </button>
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className="w-10 h-10 rounded-full bg-neutral-950/90 border border-neutral-850 text-neutral-400 flex items-center justify-center shadow-2xl font-bold"
        >
          {isPanelCollapsed ? "▲" : "▼"}
        </button>
      </div>

      <div
        style={{ height: isPanelCollapsed ? 0 : `${panelHeight}px` }}
        className="absolute bottom-0 left-0 right-0 bg-neutral-950/95 border-t border-neutral-900 z-20 shadow-2xl overflow-hidden transition-all duration-300 ease-out flex flex-col backdrop-blur-lg"
      >
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="w-full h-5 flex items-center justify-center cursor-ns-resize hover:bg-neutral-900/50 shrink-0"
        >
          <div className="w-12 h-1 bg-neutral-800 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {activeTab === "paint" && (
            <PaintPicker
              activeSurface={activeSurface}
              roomColors={roomColors}
              setRoomColors={setRoomColors}
              customColors={customColors}
              setCustomColors={setCustomColors}
            />
          )}
          {activeTab === "lighting" && (
            <LightControls
              bulbs={bulbs}
              setBulbs={setBulbs}
              isNightMode={isNightMode}
              setIsNightMode={setIsNightMode}
            />
          )}
        </div>
      </div>

      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-100">Save Color Concept</h3>
              <p className="text-[11px] text-neutral-400">Specify the name you want to use to register this mockup in your 3D design portfolio.</p>
            </div>

            <form onSubmit={handleSaveWorkspace} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Amber Glow Hostel Layout"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-500 disabled:bg-emerald-800 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Confirm Save ➔"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 🚀 Export the page wrapped inside a dynamic suspense shell to bypass bailing static site checks during deployment
export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 z-50">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] tracking-widest text-neutral-500 uppercase font-black">
            Mounting Spatial Parameters...
          </span>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}