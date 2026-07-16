"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

// Modular Dashboard Components
import PaintPicker, { CustomColor } from "@/components/canvas/ClientPaintPicker";
import LightControls, { BulbState } from "@/components/canvas/LightControls";
import { DBRawLight } from "../../workspace/page";

interface SharedDataPayload {
  share_id: string;
  design_id?: string;
  design_name: string;
  room_data: Record<string, string>;
  parent_template_name: string;
  painter_id: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  experience_years: number;
  skills: string[];
  avatar_url: string | null;
  phone_number: string | null;
  model_url?: string | null;
  master_design_id?: string;
  lighting_settings?: DBRawLight[];
}

interface Painter3DConcept {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: Record<string, string>;
  created_at: string;
}

interface DBCameraConfig {
  position?: [number, number, number];
  target?: [number, number, number];
  floorLimitAngle?: number;
  ceilingLimitAngle?: number;
  maxZoomDistance?: number;
}

interface AuthUserPayload {
  id: string;
  email: string;
  full_name: string;
  role?: string;
}

const ClientPaintPicker = PaintPicker as React.ComponentType<
  React.ComponentProps<typeof PaintPicker> & { isReadOnly?: boolean }
>;

// 📦 DYNAMIC CLIENT INTERACTIVE CANVAS ENGINE
function ClientInteractiveCanvas({
  modelUrl,
  roomColors,
  onSurfaceSelect,
  bulbs,
  cameraConfig,
  isNightMode
}: {
  modelUrl: string;
  roomColors: Record<string, string>;
  onSurfaceSelect: (meshName: string) => void;
  bulbs: BulbState[];
  cameraConfig: DBCameraConfig;
  isNightMode: boolean;
}) {
  const { scene } = useGLTF(modelUrl);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (controlsRef.current && cameraConfig) {
      if (cameraConfig.target) controlsRef.current.target.set(...cameraConfig.target);
      if (cameraConfig.position) controlsRef.current.object.position.set(...cameraConfig.position);
      controlsRef.current.update();
    }
  }, [cameraConfig]);

  useEffect(() => {
    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (roomColors[node.name]) {
          node.material.color.set(roomColors[node.name]);
        }
        node.material.needsUpdate = true;
      }
    });
  }, [scene, roomColors]);

  return (
    <>
      <color attach="background" args={[isNightMode ? "#040406" : "#d1d5db"]} />

      <ambientLight intensity={isNightMode ? 0.02 : 0.4} color={isNightMode ? "#0a0f1d" : "#ffffff"} />
      {!isNightMode && <directionalLight position={[4, 8, 4]} intensity={0.6} color="#ffffff" castShadow />}

      {bulbs.map((bulb) => {
        const isLightOn = bulb.visible !== undefined ? bulb.visible : bulb.enabled;
        if (!isLightOn) return null;

        return (
          <group key={bulb.id} position={bulb.position}>
            <pointLight
              intensity={bulb.intensity}
              color={bulb.color}
              distance={bulb.distance || 15}
              decay={1.2}
              castShadow
            />
          </group>
        );
      })}

      <primitive
        object={scene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.object instanceof THREE.Mesh) {
            onSurfaceSelect(e.object.name || e.object.uuid);
          }
        }}
      />

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.1}
        maxDistance={1.8}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

export default function PublicProfileAndConceptPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const { showToast } = useAlert();

  const targetId = (params?.sharedId || params?.id) as string;

  // View UI Panels Configurations
  const [activeTab, setActiveTab] = useState<"paint" | "lighting">("paint");
  const [activeSurface, setActiveSurface] = useState<string>("wallFront");
  const [panelHeight, setPanelHeight] = useState<number>(280);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);
  const isDragging = useRef<boolean>(false);

  // Send Feedback Workflow Panel Matrix
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [clientMessage, setClientMessage] = useState<string>("");
  const [sendingFeedback, setSendingFeedback] = useState<boolean>(false);

  // Shared Core Matrices
  const [is3DConceptShare, setIs3DConceptShare] = useState<boolean>(false);
  const [sharedConcept, setSharedConcept] = useState<SharedDataPayload | null>(null);
  const [roomColors, setRoomColors] = useState<Record<string, string>>({});
  const [bulbs, setBulbs] = useState<BulbState[]>([]);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [cameraConfig, setCameraConfig] = useState<DBCameraConfig>({
    position: [-2.73, 3.28, -2.51],
    target: [-1.94, 2.7, 0.05]
  });

  const [profile, setProfile] = useState<SharedDataPayload | null>(null);
  const [concepts3D, setConcepts3D] = useState<Painter3DConcept[]>([]);
  const [customColors, setCustomColors] = useState<CustomColor[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  useEffect(() => {
    if (!targetId) return;

    const resolvePublicDataStream = async () => {
      setIsLoading(true);
      try {
        // 🎯 STEP 1: Attempt to resolve targetId as a public Share Link (UUID share_id)
        const conceptRes = await fetch(`${BACKEND_API_URL}/api/visualizations/share/${targetId}`);

        if (conceptRes.ok) {
          const conceptBody = await conceptRes.json();
          const conceptData = conceptBody.data as SharedDataPayload;
          setSharedConcept(conceptData);
          setRoomColors(conceptData.room_data || {});
          setIs3DConceptShare(true);

          // Dynamic lookup: fetch master catalog parameters
          const templateToFetch = conceptData.master_design_id || "tmpl_hostel_lux";
          const templateRes = await fetch(`${BACKEND_API_URL}/api/visualizations/catalog/${templateToFetch}`);

          if (templateRes.ok) {
            const templateData = await templateRes.json();

            if (templateData.lighting_settings) {
              setBulbs(
                templateData.lighting_settings.map((light: DBRawLight, index: number) => ({
                  ...light,
                  name: `Bulb #${index + 1}`,
                  enabled: light.visible !== undefined ? light.visible : true,
                  visible: light.visible !== undefined ? light.visible : true
                }))
              );
            }
            if (templateData.camera_settings) {
              setCameraConfig(templateData.camera_settings);
            }
          }
          setIsLoading(false);
          return;
        }

        // 🎯 STEP 2: If share link lookup failed, treat targetId as a Painter User ID (Public Contractor Profile view)
        const [profileRes, conceptsRes] = await Promise.all([
          fetch(`${BACKEND_API_URL}/api/profile/${targetId}`).catch(() => null),
          fetch(`${BACKEND_API_URL}/api/visualizations/painter/${targetId}`).catch(() => null)
        ]);

        if (profileRes && profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile || null);
        }
        if (conceptsRes && conceptsRes.ok) {
          const conceptsData = await conceptsRes.json();
          setConcepts3D(conceptsData.visualizations || []);
        }
      } catch (err) {
        console.error("Aggregation error on public stream:", err);
      } finally {
        setIsLoading(false);
      }
    };

    resolvePublicDataStream();
  }, [targetId, BACKEND_API_URL]);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (
          typeof window !== "undefined" &&
          "orientation" in screen &&
          "lock" in (screen.orientation as unknown as Record<string, unknown>)
        ) {
          await (screen.orientation as unknown as { lock: (orientation: string) => Promise<void> }).lock("landscape");
        }
      } catch (err) {
        console.log("Auto-landscape lock requires user interaction or isn't supported on this browser:", err);
      }
    };

    lockOrientation();

    return () => {
      try {
        if (
          typeof window !== "undefined" &&
          "orientation" in screen &&
          "unlock" in (screen.orientation as unknown as Record<string, unknown>)
        ) {
          (screen.orientation as unknown as { unlock: () => void }).unlock();
        }
      } catch (err) {
        console.log("Failed to unlock orientation:", err);
      }
    };
  }, []);

  const handleSaveToClientHub = async () => {
    if (!accessToken || !user) {
      showToast({ message: "Please create an account or log in to clone this design scheme.", severity: "error" });
      router.push("/login");
      return;
    }

    if ((user as { role?: string })?.role !== "client") {
      showToast({ message: "Only client accounts can import designs into their Design Hub.", severity: "error" });
      return;
    }

    if (!sharedConcept) return;

    setImporting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `${sharedConcept.design_name} (Remixed)`,
          roomData: roomColors,
          room_data: roomColors,
          light_data: bulbs,
          camera_data: cameraConfig,
          masterDesignId: sharedConcept.master_design_id || "tmpl_living_lux"
        })
      });

      if (response.ok) {
        showToast({ message: "Design cloned perfectly! Redirecting to your Hub layout...", severity: "success" });
        setTimeout(() => { router.push("/hub"); }, 1500);
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Could not import design asset parameters.", severity: "error" });
    } finally {
      setImporting(false);
    }
  };

  const handleSendFeedbackToPainter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMessage.trim()) return;

    setSendingFeedback(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/visualizations/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          shareId: targetId,
          roomData: roomColors,
          lightData: bulbs,
          message: clientMessage.trim(),
          clientName: user ? (user as AuthUserPayload).full_name : "Anonymous Client"
        })
      });

      if (response.ok) {
        showToast({ message: "🚀 Revisions and colors submitted straight to painter's panel!", severity: "success" });
        setFeedbackModalOpen(false);
        setClientMessage("");
      } else {
        showToast({ message: "Failed routing review log parameters.", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Network connection timeout.", severity: "error" });
    } finally {
      setSendingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">
          Compiling Studio Architecture...
        </span>
      </div>
    );
  }

  if (is3DConceptShare && sharedConcept) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col overflow-hidden select-none z-40 text-white font-sans">

        {/* Navigation HUD */}
        <div className="w-full bg-neutral-950 border-b border-neutral-900 px-4 py-3 z-20 flex items-center justify-between">
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-neutral-100">{sharedConcept.design_name}</h1>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
              Painter: <span className="text-emerald-400 font-bold">{sharedConcept.full_name}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="px-3.5 py-1.5 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg"
            >
              Send to Painter ✉️
            </button>
            <button
              onClick={handleSaveToClientHub}
              disabled={importing}
              className="px-3.5 py-1.5 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg"
            >
              {importing ? "Importing..." : "Save to Hub"}
            </button>
          </div>
        </div>

        {/* 3D Viewport View */}
        <div className="flex-1 w-full h-full relative z-10">
          <Canvas camera={{ position: cameraConfig.position || [-2.73, 3.28, -2.51], fov: 65 }}>
            <Suspense fallback={null}>
              <ClientInteractiveCanvas
                modelUrl={sharedConcept.model_url || "/models/selfcon.glb"}
                roomColors={roomColors}
                onSurfaceSelect={setActiveSurface}
                bulbs={bulbs}
                cameraConfig={cameraConfig}
                isNightMode={isNightMode}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Floating Controls */}
        <div className="absolute right-4 bottom-75 z-20 flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab("paint"); setIsPanelCollapsed(false); }}
            className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-2xl transition-all ${activeTab === "paint" && !isPanelCollapsed
              ? "bg-emerald-500 border-emerald-400 text-neutral-950"
              : "bg-neutral-900/90 border-neutral-800 text-white"
              }`}
          >
            🎨
          </button>
          <button
            onClick={() => { setActiveTab("lighting"); setIsPanelCollapsed(false); }}
            className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-2xl transition-all ${activeTab === "lighting" && !isPanelCollapsed
              ? "bg-emerald-500 border-emerald-400 text-neutral-950"
              : "bg-neutral-900/90 border-neutral-800 text-white"
              }`}
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

        {/* Resizable Bottom Sheet Panel */}
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
              <ClientPaintPicker
                activeSurface={activeSurface}
                roomColors={roomColors}
                setRoomColors={setRoomColors}
                customColors={customColors}
                setCustomColors={setCustomColors}
                isReadOnly={true}
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

        {/* ✉️ INTERACTIVE CLIENT REVIEW FEEDBACK MODAL */}
        {feedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-100">Submit Adjustments to Painter</h3>
                <p className="text-[11px] text-neutral-400">Your currently selected room configuration preset colors and bulb settings will be attached safely to this message log stream.</p>
              </div>

              <form onSubmit={handleSendFeedbackToPainter} className="space-y-4">
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. I swapped the front wall to Desert Sand and loved how it pops under day mode. Let's proceed with these changes!"
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all resize-none"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={sendingFeedback}
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingFeedback}
                    className="px-5 py-2.5 bg-cyan-600 disabled:bg-cyan-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2"
                  >
                    {sendingFeedback ? "Dispatching..." : "Send Message & Colors ➔"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const activeProfile = profile || sharedConcept;
  if (!activeProfile) {
    return (
      <div className="text-center py-24 border border-dashed border-neutral-900 rounded-3xl max-w-md mx-auto">
        <span className="text-xl">⚠️</span>
        <h3 className="text-xs font-black uppercase text-neutral-400 mt-2">Profile Absent</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 text-white pb-12">
      {/* IDENTITY PROFILE HERO HEADER */}
      <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-2xl text-emerald-400 relative">
            {activeProfile.avatar_url ? (
              <Image src={activeProfile.avatar_url} alt="" fill sizes="64px" unoptimized className="object-cover" />
            ) : (
              <span>{activeProfile.full_name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wide text-neutral-100">{activeProfile.full_name}</h1>
            <p className="text-xs text-neutral-500">📍 {activeProfile.location || "Location unconfigured"}</p>
          </div>
        </div>
      </div>

      {/* 3D CONCEPTS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 pl-1">Interactive 3D Concepts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {concepts3D.map((concept) => (
            <div
              key={concept.id}
              onClick={() => router.push(`/view/${concept.id}`)}
              className="group bg-neutral-950 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between cursor-pointer shadow-xl"
            >
              <h4 className="text-xs font-black uppercase text-neutral-200 truncate group-hover:text-emerald-400">{concept.name}</h4>
              <div className="mt-4 pt-3 border-t border-neutral-900/40 text-[9px] font-black text-neutral-500 group-hover:text-emerald-400 uppercase">
                Launch Visualizer &rarr;
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}