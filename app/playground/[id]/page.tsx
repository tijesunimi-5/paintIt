'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { useControls, Leva } from 'leva';
import {
  StudioBlenderModelMesh,
  CameraStudioController,
  PlaygroundLighting,
  AdminTransformGizmo,
  PlaygroundLightsEngine
} from '@/components/canvas/playground-core';
import { FloatingAdminPanel } from '@/components/canvas/Admin-panel';
import { DynamicLightInstance } from '@/types/index';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { PaintFinishId } from '@/config/paintFinishes';

type WorkspaceLightInstance = DynamicLightInstance & { visible?: boolean };

type MasterTemplateCatalogItem = {
  id: string;
  title?: string;
  plan_type?: string;
  model_url?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DedicatedPlayground() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const dynamicId = routeParams.id as string;

  const [activeSurface, setActiveSurface] = useState<string>('wallFront');
  const [activeFinish, setActiveFinish] = useState<PaintFinishId>('EMULSION');
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [gizmoMode, setGizmoMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [cleanViewActive, setCleanViewActive] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(0.55);

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [sceneLights, setSceneLights] = useState<WorkspaceLightInstance[]>([]);
  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    floor: '#f2f0ea', ceiling: '#ffffff', wallFront: '#F2EFE9', wallBack: '#F2EFE9', wallLeft: '#9BA498', wallRight: '#C4B199', toilet: '#ffffff'
  });

  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [isLandscapeOverride, setIsLandscapeOverride] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  const [designId, setDesignId] = useState<string>(dynamicId);
  const [designTitle, setDesignTitle] = useState<string>('Loading Workspace Model...');
  const [templateId, setTemplateId] = useState<string>(dynamicId);
  const [modelUrl, setModelUrl] = useState<string>('/models/selfcon.glb');
  const [isPremiumTemplate, setIsPremiumTemplate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);

  const { showToast } = useAlert();
  const { accessToken } = useAuth();

  const [cameraConfig, setCameraConfig] = useControls('Camera Limits', () => ({
    maxZoomDistance: { value: 0.55, min: 0.1, max: 15.0, step: 0.05, label: 'Max Out Zoom' },
    ceilingLimitAngle: { value: 0.0, min: 0.0, max: 3.14, step: 0.05, label: 'Ceiling Stop' },
    floorLimitAngle: { value: 1.85, min: 0.0, max: 3.14, step: 0.05, label: 'Floor Stop' },
  }));

  const globalEnvironment = useControls('Global Scene', {
    isNightMode: { value: false, label: '🌙 Night Mode' },
  });

  const handleToggleLock = () => {
    const nextLockState = !isLocked;
    setIsLocked(nextLockState);
    localStorage.setItem('paintit_config_locked', JSON.stringify(nextLockState));
  };

  // 📦 LOCAL AUTO-SAVE SYNCHRONIZER
  // Triggers automatically on any light modification layer to shield against unexpected coordinate resets
  useEffect(() => {
    if (!hasHydrated || !dynamicId || sceneLights.length === 0) return;
    localStorage.setItem(`paintit_lights_${dynamicId}`, JSON.stringify(sceneLights));
  }, [sceneLights, dynamicId, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !dynamicId) return;
    localStorage.setItem(`paintit_colors_${dynamicId}`, JSON.stringify(roomColors));
  }, [roomColors, dynamicId, hasHydrated]);

  // Initial environment setup hydration pipeline
  useEffect(() => {
    if (typeof window === 'undefined' || !dynamicId) return;

    const savedColors = localStorage.getItem(`paintit_colors_${dynamicId}`);
    const savedLights = localStorage.getItem(`paintit_lights_${dynamicId}`);

    const hydrateStudioEnvironment = async () => {
      setDesignId(dynamicId);
      try {
        const res = await fetch(`${API_BASE_URL}/api/visualizations/catalog/${dynamicId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.title) setDesignTitle(data.title);

            // Prioritize local storage recovery layers to protect your session edits over remote assets
            if (savedColors) {
              setRoomColors(JSON.parse(savedColors));
            } else if (data.default_room_data) {
              setRoomColors(data.default_room_data);
            }

            if (savedLights) {
              setSceneLights(JSON.parse(savedLights));
            } else if (data.lighting_settings) {
              const sanitizedLights = data.lighting_settings.map((light: WorkspaceLightInstance) => ({
                ...light,
                visible: light.visible !== false
              }));
              setSceneLights(sanitizedLights);
            }

            if (data.camera_settings) {
              setCameraConfig({
                maxZoomDistance: data.camera_settings.maxZoomDistance ?? 0.55,
                ceilingLimitAngle: data.camera_settings.ceilingLimitAngle ?? 0.0,
                floorLimitAngle: data.camera_settings.floorLimitAngle ?? 1.85,
              });

              setTimeout(() => {
                if (controlsRef.current && data.camera_settings.position) {
                  controlsRef.current.object.position.fromArray(data.camera_settings.position);
                  if (data.camera_settings.target) {
                    controlsRef.current.target.fromArray(data.camera_settings.target);
                  }
                  controlsRef.current.update();
                }
              }, 120);
            }
          }
        }
      } catch (err) {
        console.warn("⚠️ Fallback to localized browser cache layers:", err);
        if (savedColors) setRoomColors(JSON.parse(savedColors));
        if (savedLights) setSceneLights(JSON.parse(savedLights));
      } finally {
        setHasHydrated(true);
      }
    };

    hydrateStudioEnvironment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicId]);

  useEffect(() => {
    let isMounted = true;
    const urlDesignId = searchParams?.get("id") || null;
    const urlTemplateId = searchParams?.get("template") || "tmpl_living_lux";

    const syncStudioContext = async () => {
      try {
        let activeRoomColors = { ...roomColors };
        let resolvedTemplateId = urlTemplateId;
        let dbDesignTitle = "";

        // 1. If we are editing an already saved visualization ID:
        if (urlDesignId) {
          if (isMounted) setActiveDesignId(urlDesignId);

          const res = await fetch(`${API_BASE_URL}/api/visualizations/${urlDesignId}`, {
            method: "GET",
            headers: accessToken ? { "Authorization": `Bearer ${accessToken}` } : undefined
          });

          if (res.ok) {
            const data = await res.json();

            // Log this so you can inspect your backend table structure in the browser console!
            console.log("📥 Loaded Mockup Data:", data);

            if (data.visualization) {
              dbDesignTitle = data.visualization.name;
              if (data.visualization.room_data) {
                activeRoomColors = data.visualization.room_data;
              }

              // 🔍 Multi-case fallback checks to match any database schema variation
              resolvedTemplateId =
                data.visualization.masterDesignId ||
                data.visualization.master_design_id ||
                data.visualization.parent_template_id ||
                urlTemplateId;
            }
          }
        }

        // 2. Resolve the visual catalog for Model URLs and Premium check attributes:
        const catalogRes = await fetch(`${API_BASE_URL}/api/visualizations/catalog`);
        let activeTitle = dbDesignTitle || "Custom Studio Layout";
        let premiumFlag = false;

        // Default fallback model path
        let activeModelPath = "/models/selfcon.glb";

        if (catalogRes.ok) {
          const catData = await catalogRes.json();
          const activeTemplate = (catData.catalog || []).find(
            (item: MasterTemplateCatalogItem) => item.id === resolvedTemplateId
          );
          if (activeTemplate) {
            if (!dbDesignTitle) activeTitle = activeTemplate.title;
            premiumFlag = activeTemplate.plan_type !== "FREE";
            if (activeTemplate.model_url && activeTemplate.model_url.trim() !== "") {
              activeModelPath = activeTemplate.model_url;
            }
          }
        }

        if (isMounted) {
          setTemplateId(resolvedTemplateId);
          setDesignTitle(activeTitle);
          setIsPremiumTemplate(premiumFlag);
          setRoomColors(activeRoomColors);
          setModelUrl(activeModelPath);
        }
      } catch (err) {
        console.error("Failed loading configuration stream:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    syncStudioContext();
    return () => { isMounted = false; };
  }, [searchParams, accessToken]);

  const handleSaveToDatabase = async () => {
    if (!controlsRef.current) return;

    const currentCameraPosition = controlsRef.current.object.position.toArray();
    const currentCameraTarget = controlsRef.current.target.toArray();
    const token = accessToken || localStorage.getItem('paintit_access_token') || '';

    if (!token) {
      showToast({ message: '⚠️ Session Expired: Please re-authenticate your profile.', severity: 'error' });
      return;
    }

    const schemaPayload = {
      id: designId,
      title: designTitle,
      model_url: "/models/selfcon.glb",
      camera_settings: {
        position: currentCameraPosition,
        target: currentCameraTarget,
        maxZoomDistance: cameraConfig.maxZoomDistance,
        ceilingLimitAngle: cameraConfig.ceilingLimitAngle,
        floorLimitAngle: cameraConfig.floorLimitAngle
      },
      lighting_settings: sceneLights,
      default_room_data: roomColors,
      global_environment: globalEnvironment
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/visualizations/catalog/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: JSON.stringify(schemaPayload)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        showToast({ message: `🚀 "${designTitle}" configuration layout successfully synchronized!`, severity: 'success' });
      } else {
        showToast({ message: `❌ Sync Rejected: ${responseData.error || 'The server rejected this record.'}`, severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: '💾 Connection Error: Verify backend hosting pipeline clusters.', severity: 'error' });
    }
  };

  const handleManualPan = (direction: 'up' | 'down' | 'left' | 'right', step = 0.25) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const target = controls.target;
    const cam = controls.object;

    if (direction === 'up') { target.y += step; cam.position.y += step; }
    else if (direction === 'down') { target.y -= step; cam.position.y -= step; }
    else if (direction === 'left') { target.x -= step; cam.position.x -= step; }
    else if (direction === 'right') { target.x += step; cam.position.x += step; }
    controls.update();
  };

  const handleManualZoomChange = (zoomValue: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    setCurrentZoom(zoomValue);
    controls.maxDistance = zoomValue * 5;
    controls.minDistance = zoomValue;
    controls.update();
  };

  const addNewLight = (type: 'point' | 'spot') => {
    if (isLocked) return;
    const newLight: WorkspaceLightInstance = {
      id: `light_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: [0.0, 1.5, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.0, 1.0, 1.0],
      intensity: 3.0,
      color: '#ffffff',
      distance: 15,
      visible: true
    };

    // De-select current element to enforce clean layout memory before appending
    setSelectedLightId(null);
    setSceneLights((prev) => [
      ...prev.map(l => ({
        ...l,
        position: [...l.position] as [number, number, number],
        rotation: [...l.rotation] as [number, number, number],
        scale: [...l.scale] as [number, number, number]
      })),
      newLight
    ]);
    setTimeout(() => setSelectedLightId(newLight.id), 50);
  };

  const toggleLightVisibility = (id: string) => {
    setSceneLights((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: l.visible === false ? true : false } : l))
    );
  };

  const activeLightData = sceneLights.find((l) => l.id === selectedLightId);

  const updateActiveLightTransform = (property: 'position' | 'rotation' | 'scale', value: [number, number, number]) => {
    if (!selectedLightId || isLocked) return;
    setSceneLights((prev) =>
      prev.map((l) => (l.id === selectedLightId ? { ...l, [property]: [...value] as [number, number, number] } : l))
    );
  };

  const updateActiveLightScalar = (property: 'intensity' | 'distance', value: number) => {
    if (!selectedLightId || isLocked) return;
    setSceneLights((prev) => prev.map((l) => (l.id === selectedLightId ? { ...l, [property]: value } : l)));
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 w-screen h-screen overflow-hidden select-none z-50 font-sans">
      <button
        onClick={() => window.location.href = '/playground'}
        className="pointer-events-auto absolute top-3 left-4 z-50 bg-neutral-900/90 border border-neutral-800 p-2.5 px-3.5 rounded-xl text-[11px] font-black text-neutral-400 hover:text-white uppercase tracking-wider backdrop-blur-md shadow-xl"
      >
        📁 Back to Catalog
      </button>

      {!cleanViewActive && (
        <div className="pointer-events-auto absolute top-3 left-36 right-4 z-50 max-w-xl mx-auto bg-neutral-900/90 border border-neutral-800 backdrop-blur-md p-1.5 rounded-xl flex items-center justify-between gap-3 shadow-xl">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all shrink-0 ${isAdmin ? 'bg-amber-500 text-neutral-950 border-amber-400' : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'}`}
          >
            {isAdmin ? '🛠️ Edit' : '👁️ Preview'}
          </button>

          {isAdmin ? (
            <input
              type="text"
              value={designTitle}
              onChange={(e) => setDesignTitle(e.target.value)}
              className="bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] font-bold tracking-wide w-full max-w-45 focus:outline-hidden focus:border-cyan-500"
              placeholder="Design Title..."
            />
          ) : (
            <span className="text-[11px] font-black text-neutral-200 tracking-wide truncate max-w-45">{designTitle}</span>
          )}

          <button
            onClick={() => setIsLandscapeOverride(!isLandscapeOverride)}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all shrink-0 ${isLandscapeOverride ? 'bg-cyan-500 text-neutral-950 border-cyan-400' : 'bg-neutral-950 text-cyan-400 border-neutral-800'}`}
          >
            {isLandscapeOverride ? '🎥 Landscape' : '📱 Portrait'}
          </button>
        </div>
      )}

      {!cleanViewActive && sceneLights.length > 0 && (
        <div className="absolute bottom-6 left-6 z-50 bg-neutral-900/95 border border-neutral-800 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-xs pointer-events-auto">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-2">
            💡 User Bulb Switches:
          </span>
          <div className="flex flex-wrap gap-2">
            {sceneLights.map((light, index) => (
              <button
                key={light.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLightVisibility(light.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide border transition-all flex items-center gap-1.5 ${light.visible !== false
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : 'bg-neutral-950 text-neutral-600 border-neutral-800/80 line-through'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${light.visible !== false ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-700'}`} />
                Bulb #{index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`absolute top-18 right-4 z-50 transition-all ${cleanViewActive || isLocked || !hasHydrated || !isAdmin ? 'hidden' : 'block'}`}>
        <Leva
          oneLineLabels
          fill={false}
          theme={{
            sizes: { controlWidth: '100px', rootWidth: '280px' },
            fontSizes: { root: '11px' }
          }}
        />
      </div>

      <div className="absolute inset-0 w-full h-full z-10 bg-neutral-900">
        <Canvas shadows camera={{ position: [0, 1.4, 2.2], fov: isLandscapeOverride ? 45 : 55 }}>
          <PlaygroundLighting isNight={globalEnvironment.isNightMode} showHelpers={!cleanViewActive && !isLocked && isAdmin} />

          <Suspense fallback={null}>
            <StudioBlenderModelMesh
              modelUrl={modelUrl}
              surfaceStates={roomColors}
              activeFinish={activeFinish}
              onTargetSelect={(meshName: string) => {
                if (!cleanViewActive && isAdmin) setActiveSurface(meshName);
              }}
            />
          </Suspense>

          <PlaygroundLightsEngine lights={sceneLights.filter((l) => l.visible !== false)} />

          {activeLightData && activeLightData.visible !== false && !cleanViewActive && !isLocked && isAdmin && (
            <AdminTransformGizmo activeLight={activeLightData} mode={gizmoMode} onTransformUpdate={updateActiveLightTransform} />
          )}

          <CameraStudioController
            controlsRef={controlsRef}
            isOrbitDisabled={false}
            maxZoom={cameraConfig.maxZoomDistance}
            minPolar={isAdmin ? cameraConfig.ceilingLimitAngle : 0}
            maxPolar={isAdmin ? cameraConfig.floorLimitAngle : Math.PI / 2}
            isLocked={!isAdmin || isLocked}
          />
        </Canvas>
      </div>

      <div className="absolute top-0 left-0 right-0 h-5 z-50 pointer-events-none bg-linear-to-b from-neutral-950/40 to-transparent" style={{ touchAction: 'auto' }} />

      {hasHydrated && isAdmin && (
        <FloatingAdminPanel
          activeSurface={activeSurface}
          sceneLights={sceneLights}
          selectedLightId={selectedLightId}
          gizmoMode={gizmoMode}
          currentZoomValue={currentZoom}
          onCameraZoomChange={handleManualZoomChange}
          onCameraPan={handleManualPan}
          onGizmoModeChange={setGizmoMode}
          currentColor={roomColors[activeSurface]}
          onColorChange={(color: string) => setRoomColors((prev) => ({ ...prev, [activeSurface]: color }))}
          currentFinish={activeFinish}
          onFinishChange={setActiveFinish}
          onAddLight={addNewLight}
          onSelectLight={(id) => {
            // 🔒 FIX: Temporarily intercept panel events to block async trace collisions
            if (id === selectedLightId) return;
            setSelectedLightId(id);
          }}
          onDeleteLight={(id) => {
            setSceneLights((prev) => prev.filter((l) => l.id !== id));
            setSelectedLightId(null);
          }}
          onScalarUpdate={updateActiveLightScalar}
          onVectorUpdate={(property: 'position' | 'rotation' | 'scale', axisIndex: number, value: number) => {
            if (!selectedLightId || isLocked) return;
            setSceneLights((prev) => prev.map((l) => {
              if (l.id === selectedLightId) {
                const updatedVector = [...l[property]] as [number, number, number];
                updatedVector[axisIndex] = parseFloat(value.toFixed(2));
                return { ...l, [property]: updatedVector };
              }
              return l;
            }));
          }}
          isLocked={isLocked}
          onToggleLock={handleToggleLock}
          onSaveToDatabase={handleSaveToDatabase}
          cleanViewActive={cleanViewActive}
          onToggleCleanView={() => {
            const nextMode = !cleanViewActive;
            setCleanViewActive(nextMode);
            if (nextMode) setSelectedLightId(null);
          }}
          isLandscapeLayout={isLandscapeOverride}
        />
      )}
    </div>
  );
}