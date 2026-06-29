// app/(painter)/workspace/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { useGLTF } from "@react-three/drei";

interface RoomProps {
  roomColors: Record<string, string>;
  onSurfaceClick: (surfaceKey: string) => void;
}

function LiveRoomPlanes({ roomColors, onSurfaceClick }: RoomProps) {
  const width = 14;
  const height = 8;
  const depth = 14;

  return (
    <group>
      {/* 1. FLOOR */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSurfaceClick("floor"); }}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={roomColors.floor || "#161618"}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* 2. CEILING */}
      <mesh
        position={[0, height, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSurfaceClick("ceiling"); }}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={roomColors.ceiling || "#1a1a1c"} roughness={0.9} />
      </mesh>

      {/* 3. BACK WALL */}
      <mesh
        position={[0, height / 2, -depth / 2]}
        rotation={[0, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSurfaceClick("wallBack"); }}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={roomColors.wallBack || "#F2EFE9"}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* 4. LEFT WALL */}
      <group position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSurfaceClick("wallLeft"); }}>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial
            color={roomColors.wallLeft || "#9BA498"}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, -0.5, 0.02]}>
          <boxGeometry args={[4, 4, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 5. RIGHT WALL */}
      <group position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSurfaceClick("wallRight"); }}>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial
            color={roomColors.wallRight || "#C4B199"}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[2, -1.2, 0.02]}>
          <boxGeometry args={[2.5, 5.6, 0.05]} />
          <meshStandardMaterial color="#222222" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// Separate component to handle future GLTF Custom Models cleanly without explicit any tags
interface BlenderMeshProps {
  modelUrl: string;
  surfaceStates: Record<string, string>;
  onTargetSelect: (meshName: string) => void;
}

function CustomBlenderModelMesh({ modelUrl, surfaceStates, onTargetSelect }: BlenderMeshProps) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // const { useGLTF } = require("@react-three/drei");
  const { scene } = useGLTF(modelUrl);

  useEffect(() => {
    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        const meshName = node.name || node.uuid;
        if (surfaceStates[meshName]) {
          node.material.color.set(surfaceStates[meshName]);
        }
      }
    });
  }, [scene, surfaceStates]);

  return (
    <primitive
      object={scene}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (e.object instanceof THREE.Mesh) {
          onTargetSelect(e.object.name || e.object.uuid);
        }
      }}
    />
  );
}

export default function WorkspacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const templateId = searchParams?.get("template") || "tmpl_living_lux";
  const existingId = searchParams?.get("id") || null;

  const [designTitle, setDesignTitle] = useState<string>("My New Custom Room");
  const [activeSurface, setActiveSurface] = useState<string>("wallBack");
  const [activeColor, setActiveColor] = useState<string>("#047857");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPremiumTemplate, setIsPremiumTemplate] = useState<boolean>(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    floor: "#161618",
    ceiling: "#1a1a1c",
    wallBack: "#F2EFE9",
    wallLeft: "#9BA498",
    wallRight: "#C4B199",
  });

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [successState, setSuccessState] = useState<boolean>(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const standardSwatches = useMemo(() => [
    { name: "Satin Off White", hex: "#f5f5f4" },
    { name: "Screeded Charcoal", hex: "#1c1917" },
    { name: "Emerald Accent", hex: "#047857" },
    { name: "Velvet Mustard", hex: "#b45309" },
    { name: "Stucco Royal Blue", hex: "#1d4ed8" },
    { name: "Soft Silk Cream", hex: "#fef3c7" }
  ], []);

  useEffect(() => {
    let isMounted = true;

    const syncStudioContext = async () => {
      try {
        const catalogRes = await fetch(`${BACKEND_API_URL}/api/visualizations/catalog`);
        let activeTitle = "Custom Room Layout";
        let premiumFlag = false;
        let activeModelPath = null;

        if (catalogRes.ok) {
          const catData = await catalogRes.json();
          const activeTemplate = (catData.catalog || []).find((item: { id: string; title?: string; plan_type?: string; model_url?: string }) => item.id === templateId);
          if (activeTemplate) {
            activeTitle = activeTemplate.title;
            premiumFlag = activeTemplate.plan_type !== "FREE";
            if (activeTemplate.model_url && activeTemplate.model_url.endsWith(".glb")) {
              activeModelPath = activeTemplate.model_url;
            }
          }
        }

        if (isMounted) {
          setDesignTitle(activeTitle);
          setIsPremiumTemplate(premiumFlag);
          setModelUrl(activeModelPath);
        }

        if (existingId && accessToken) {
          const res = await fetch(`${BACKEND_API_URL}/api/visualizations/${existingId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${accessToken}` }
          });
          if (res.ok && isMounted) {
            const data = await res.json();
            if (data.visualization) {
              setDesignTitle(data.visualization.name);
              if (data.visualization.room_data) {
                setRoomColors(data.visualization.room_data);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed loading configuration stream:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    syncStudioContext();
    return () => { isMounted = false; };
  }, [templateId, existingId, accessToken, BACKEND_API_URL]);

  const handleSurfaceSelection = (surfaceKey: string) => {
    setActiveSurface(surfaceKey);
    setRoomColors((prev) => ({
      ...prev,
      [surfaceKey]: activeColor
    }));
  };

  const executeSavePipeline = async () => {
    if (isPremiumTemplate) {
      showToast({ message: "Trial versions cannot be saved.", severity: "error" });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: designTitle,
          roomData: roomColors,
          masterDesignId: templateId
        })
      });

      if (response.ok) {
        setSuccessState(true);
        setTimeout(() => {
          setConfirmOpen(false);
          router.push("/designs");
        }, 1500);
      } else {
        const errData = await response.json();
        showToast({ message: errData.message || "Failed to save configuration details.", severity: "error" });
      }
    } catch (err) {
      console.error("Submission pipeline error:", err);
      showToast({ message: "Network connection failure.", severity: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-2 z-50">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Loading Studio Canvas...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-950 flex flex-col overflow-hidden select-none z-40">

      {/* HEADER CONTROLS SECTION */}
      <div className="w-full bg-neutral-950 border-b border-neutral-900 px-4 py-3 z-20 flex items-center justify-between">
        <div>
          <input
            type="text"
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            className="bg-transparent text-sm font-black text-neutral-100 uppercase tracking-wide border-b border-transparent focus:border-emerald-500/30 focus:outline-none max-w-40 truncate"
          />
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
            Active: <span className="text-emerald-400 font-bold">{activeSurface}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/designs")}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-[10px] font-black uppercase tracking-wider rounded-xl text-neutral-400"
          >
            Exit
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${isPremiumTemplate ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500 text-black font-black"
              }`}
          >
            {isPremiumTemplate ? "Trial Mode Only" : "Save Scheme ➔"}
          </button>
        </div>
      </div>

      {/* THREEJS VIEWPORT CANVAS */}
      <div className="flex-1 w-full h-full relative z-10">
        <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
          <color attach="background" args={["#0a0a0a"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 15, 5]} intensity={0.8} />

          <Suspense fallback={null}>
            {modelUrl ? (
              <CustomBlenderModelMesh
                modelUrl={modelUrl}
                surfaceStates={roomColors}
                onTargetSelect={handleSurfaceSelection}
              />
            ) : (
              <LiveRoomPlanes
                roomColors={roomColors}
                onSurfaceClick={handleSurfaceSelection}
              />
            )}
          </Suspense>

          <OrbitControls maxDistance={25} minDistance={3} enablePan={false} />
        </Canvas>
      </div>

      {/* SWATCH SELECTION DRAWER */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black via-neutral-950/90 to-transparent pt-8 pb-6 px-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-sm bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl shadow-2xl space-y-3 pointer-events-auto backdrop-blur-md">
          <span className="text-[9px] uppercase font-black text-neutral-500 block tracking-wider">Select Finishing Tint</span>
          <div className="grid grid-cols-6 gap-2">
            {standardSwatches.map((colorItem) => {
              const isSelected = activeColor === colorItem.hex;
              return (
                <button
                  key={colorItem.hex}
                  type="button"
                  onClick={() => {
                    setActiveColor(colorItem.hex);
                    if (activeSurface) {
                      // ✅ FIXED: Replaced compile error parameter reference to use state handler array
                      setRoomColors((prev) => ({ ...prev, [activeSurface]: colorItem.hex }));
                    }
                  }}
                  className={`aspect-square rounded-xl border relative flex items-center justify-center transition-all ${isSelected ? "border-white scale-105" : "border-neutral-800"
                    }`}
                  style={{ backgroundColor: colorItem.hex }}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950 invert" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SYSTEM CONFIRMATION MODALS PORTAL */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeSavePipeline}
        title={successState ? "Concept Saved Successfully" : "Lock Color Setup"}
        message={
          isPremiumTemplate
            ? "This room layout belongs to a paid subscription tier. You can play with layout color values but saving requires a portfolio plan update."
            : successState
              ? `Your custom scheme for "${designTitle}" was cleanly registered to your personal portfolio workspace.`
              : `Are you sure you want to write this variant mapping into your active dashboard designs list?`
        }
        confirmText="Confirm Save"
        cancelText="Keep Editing"
        isSuccessState={successState}
      />

    </div>
  );
}