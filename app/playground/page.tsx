'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
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

interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

// 🔑 CORE BACKEND GATEWAY ROUTER (Point to your active Express Port configuration)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DedicatedPlayground() {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const [activeSurface, setActiveSurface] = useState<string>('wallFront');
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [gizmoMode, setGizmoMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [cleanViewActive, setCleanViewActive] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(0.55);

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [sceneLights, setSceneLights] = useState<DynamicLightInstance[]>([]);
  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    floor: '#f2f0ea', ceiling: '#ffffff', wallFront: '#F2EFE9', wallBack: '#F2EFE9', wallLeft: '#9BA498', wallRight: '#C4B199', toilet: '#ffffff'
  });

  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [isLandscapeOverride, setIsLandscapeOverride] = useState<boolean>(false);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPWA, setIsPWA] = useState<boolean>(false);

  const [designId, setDesignId] = useState<string>('b873e348-73da-4a57-b062-1b1511116c4c');
  const [designTitle, setDesignTitle] = useState<string>('Luxury Minimalist Living Room');

  const { showToast } = useAlert(); // 💡 Initialize your premium alert context[cite: 5]
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as SafariNavigator).standalone === true;

    const params = new URLSearchParams(window.location.search);
    const adminCheck = params.get('edit') === 'true';
    const dynamicIdParam = params.get('id') || 'tmpl_hostel_lux';

    const savedColors = localStorage.getItem('paintit_room_colors');
    const savedLights = localStorage.getItem('paintit_scene_lights');

    const hydrateStudioEnvironment = async () => {
      setIsPWA(isStandalone);
      setIsAdmin(adminCheck);
      setDesignId(dynamicIdParam);

      try {
        // ✅ CONNECTED TO NODE/EXPRESS CORE INSTANCE:
        const res = await fetch(`${API_BASE_URL}/api/visualizations/catalog/${dynamicIdParam}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.title) setDesignTitle(data.title);
            if (data.default_room_data) setRoomColors(data.default_room_data);
            if (data.lighting_settings) setSceneLights(data.lighting_settings);
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
        console.warn("⚠️ Server endpoint unmapped, rendering locally:", err);
        if (savedColors) setRoomColors(JSON.parse(savedColors));
        if (savedLights) setSceneLights(JSON.parse(savedLights));
      } finally {
        setHasHydrated(true);
      }
    };

    hydrateStudioEnvironment();
  }, [setCameraConfig]);

  const handleSaveToDatabase = async () => {
    if (!controlsRef.current) return;

    const currentCameraPosition = controlsRef.current.object.position.toArray();
    const currentCameraTarget = controlsRef.current.target.toArray();

    // 🔑 1. DIRECTLY INTERCEPT ACCESSTOKEN FROM AUTHCONTEXT TYPES
    // Uses your exact context variable name, falling back safely to your specific storage keys[cite: 6]
    const token = accessToken
      || localStorage.getItem('paintit_access_token')
      || localStorage.getItem('accessToken')
      || localStorage.getItem('token')
      || '';

    if (!token) {
      showToast({
        message: '⚠️ Session Expired or Token Missing: Please open your primary login page, re-authenticate your profile, and try again.',
        severity: 'error',
        duration: 5000
      });
      return;
    }

    const schemaPayload = {
      id: designId,
      title: designTitle,
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

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { error: responseText };
      }

      if (response.ok && (responseData.success || !responseData.error)) {
        showToast({
          message: `🚀 "${designTitle}" configurations synchronized successfully to your database row records!`,
          severity: 'success'
        });
      } else {
        showToast({
          message: `❌ Sync Rejected (${response.status}): ${responseData.error || 'The security engine dropped this transaction.'}`,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        message: '💾 Connection Error: Backend server appears offline. Check terminal console output tabs.',
        severity: 'error'
      });
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
    const newLight: DynamicLightInstance = {
      id: `light_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: [0.0, 1.5, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.0, 1.0, 1.0],
      intensity: 3.0,
      color: '#ffffff',
      distance: 15,
    };
    setSceneLights((prev) => [...prev, newLight]);
    setSelectedLightId(newLight.id);
  };

  const activeLightData = sceneLights.find((l) => l.id === selectedLightId);

  const updateActiveLightTransform = (property: 'position' | 'rotation' | 'scale', value: [number, number, number]) => {
    if (!selectedLightId || isLocked) return;
    setSceneLights((prev) => prev.map((l) => (l.id === selectedLightId ? { ...l, [property]: [...value] } : l)));
  };

  const updateActiveLightScalar = (property: 'intensity' | 'distance', value: number) => {
    if (!selectedLightId || isLocked) return;
    setSceneLights((prev) => prev.map((l) => (l.id === selectedLightId ? { ...l, [property]: value } : l)));
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 w-screen h-screen overflow-hidden select-none z-50 font-sans">

      {/* 🏠 PWA INTERFACE ESCAPE ROUTE */}
      {isPWA && (
        <button
          onClick={() => window.location.href = '/'}
          className="pointer-events-auto absolute top-3 left-4 z-50 bg-neutral-900/90 border border-neutral-800 p-2.5 px-3.5 rounded-xl text-[11px] font-black text-neutral-400 hover:text-white uppercase tracking-wider backdrop-blur-md shadow-xl"
        >
          🏠 Studio Home
        </button>
      )}

      {/* 🎥 UTILITIES OVERLAY LAYER */}
      {!cleanViewActive && (
        <div className={`pointer-events-auto absolute top-3 left-4 right-4 z-50 max-w-xl mx-auto bg-neutral-900/90 border border-neutral-800 backdrop-blur-md p-1.5 rounded-xl flex items-center justify-between gap-3 shadow-xl ${isPWA ? 'translate-x-12' : ''}`}>

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
              className="bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] font-bold tracking-wide w-full max-w-[180px] focus:outline-hidden focus:border-cyan-500"
              placeholder="Design Title..."
            />
          ) : (
            <span className="text-[11px] font-black text-neutral-200 tracking-wide truncate max-w-[180px]">{designTitle}</span>
          )}

          <button
            onClick={() => setIsLandscapeOverride(!isLandscapeOverride)}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all shrink-0 ${isLandscapeOverride ? 'bg-cyan-500 text-neutral-950 border-cyan-400' : 'bg-neutral-950 text-cyan-400 border-neutral-800'}`}
          >
            {isLandscapeOverride ? '🎥 Landscape' : '📱 Portrait'}
          </button>
        </div>
      )}

      {/* LEVA FOLDERS CONTAINER */}
      <div
        className={`absolute top-18 right-4 z-50 transition-all ${cleanViewActive || isLocked || !hasHydrated || !isAdmin ? 'hidden' : 'block'
          }`}
      >
        <Leva
          oneLineLabels
          fill={false} // 🎨 Stops Leva from aggressively stretching or breaking out of bounds
          theme={{
            sizes: {
              controlWidth: '100px',
              rootWidth: '280px' // 🎯 Forces a clean, standard width dimension so everything fits comfortably
            },
            fontSizes: { root: '11px' }
          }}
        />
      </div>

      {/* THREE.JS CANVAS CONTAINER ENGINE */}
      <div className="absolute inset-0 w-full h-full z-10 bg-neutral-900">
        <Canvas shadows camera={{ position: [0, 1.4, 2.2], fov: isLandscapeOverride ? 45 : 55 }}>
          <PlaygroundLighting isNight={globalEnvironment.isNightMode} showHelpers={!cleanViewActive && !isLocked && isAdmin} />

          <Suspense fallback={null}>
            <StudioBlenderModelMesh
              modelUrl="/models/selfcon.glb"
              surfaceStates={roomColors}
              onTargetSelect={(meshName: string) => {
                if (!cleanViewActive && isAdmin) setActiveSurface(meshName);
              }}
            />
          </Suspense>

          <PlaygroundLightsEngine lights={sceneLights} />

          {activeLightData && !cleanViewActive && !isLocked && isAdmin && (
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

      <div
        className="absolute top-0 left-0 right-0 h-5 z-50 pointer-events-none bg-linear-to-b from-neutral-950/40 to-transparent"
        style={{ touchAction: 'auto' }}
      />

      {/* HUD PANEL LAYER DOCK */}
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
          onAddLight={addNewLight}
          onSelectLight={setSelectedLightId}
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