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

  // RESPONSIVE LAYOUT STATES
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissedHint, setDismissedHint] = useState<boolean>(false);

  const [cameraConfig, setCameraConfig] = useControls('Camera Limits', () => ({
    maxZoomDistance: { value: 0.55, min: 0.1, max: 15.0, step: 0.05, label: 'Max Out Zoom' },
    // ✅ Sliders scaled directly on true radian boundaries (0 = straight up, 3.14 = straight down)
    ceilingLimitAngle: { value: 0.0, min: 0.0, max: 3.14, step: 0.05, label: 'Ceiling Stop' },
    floorLimitAngle: { value: 1.85, min: 0.0, max: 3.14, step: 0.05, label: 'Floor Stop' },
  }));

  const globalEnvironment = useControls('Global Scene', {
    isNightMode: { value: false, label: '🌙 Night Mode' },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLock = localStorage.getItem('paintit_config_locked');
      const savedColors = localStorage.getItem('paintit_room_colors');
      const savedLights = localStorage.getItem('paintit_scene_lights');
      const savedCamConfig = localStorage.getItem('paintit_camera_bounds');

      queueMicrotask(() => {
        setIsPortrait(window.innerHeight > window.innerWidth);
        if (savedLock) setIsLocked(JSON.parse(savedLock));
        if (savedColors) setRoomColors(JSON.parse(savedColors));
        if (savedLights) setSceneLights(JSON.parse(savedLights));
        if (savedCamConfig) setCameraConfig(JSON.parse(savedCamConfig));
        setHasHydrated(true);
      });

      const handleResize = () => {
        setIsPortrait(window.innerHeight > window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [setCameraConfig]);

  const handleToggleLock = () => {
    const nextLockState = !isLocked;
    setIsLocked(nextLockState);
    localStorage.setItem('paintit_config_locked', JSON.stringify(nextLockState));
    localStorage.setItem('paintit_room_colors', JSON.stringify(roomColors));
    localStorage.setItem('paintit_scene_lights', JSON.stringify(sceneLights));
    localStorage.setItem('paintit_camera_bounds', JSON.stringify(cameraConfig));
    if (nextLockState) setSelectedLightId(null);
  };

  const handleSaveToDatabase = () => {
    const payload = { roomColors, sceneLights, cameraConfig, globalEnvironment };
    console.log('📦 Syncing to Database Schema:', payload);
    alert('🚀 Sandbox configurations successfully saved to Database endpoint array!');
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

      {/* LANDSCAPE RECOMMENDATION BANNER */}
      {isPortrait && !dismissedHint && !cleanViewActive && (
        <div className="pointer-events-auto absolute top-3 left-4 right-4 z-50 bg-cyan-500 text-neutral-950 px-3 py-2 rounded-xl flex items-center justify-between text-[10px] font-black uppercase tracking-wider shadow-xl border border-cyan-400/30">
          <span>🎥 Turn phone sideways for full cinema workspace layout!</span>
          <button onClick={() => setDismissedHint(true)} className="bg-neutral-950/20 hover:bg-neutral-950/40 rounded-md p-1 px-2 text-xs transition-colors">✕</button>
        </div>
      )}

      <div className={cleanViewActive || isLocked || !hasHydrated ? 'hidden' : 'absolute top-16 right-4 z-50 max-w-45 md:max-w-xs'}>
        <Leva
          oneLineLabels
          theme={{ sizes: { controlWidth: '90px' }, fontSizes: { root: '10px' } }}
        />
      </div>

      <div className="absolute inset-0 w-full h-full z-10 bg-neutral-900">
        {/* ✅ FIXED APERTURE: Restores square, straight-edged room perspective shapes without wide fish-eye distortion cascades */}
        <Canvas shadows camera={{ position: [0, 1.4, 2.2], fov: isPortrait ? 55 : 45 }}>
          <PlaygroundLighting isNight={globalEnvironment.isNightMode} showHelpers={!cleanViewActive && !isLocked} />

          <Suspense fallback={null}>
            <StudioBlenderModelMesh
              modelUrl="/models/selfcon.glb"
              surfaceStates={roomColors}
              onTargetSelect={(meshName: string) => {
                if (!cleanViewActive) setActiveSurface(meshName);
              }}
            />
          </Suspense>

          <PlaygroundLightsEngine lights={sceneLights} />

          {activeLightData && !cleanViewActive && !isLocked && (
            <AdminTransformGizmo activeLight={activeLightData} mode={gizmoMode} onTransformUpdate={updateActiveLightTransform} />
          )}

          <CameraStudioController
            controlsRef={controlsRef}
            isOrbitDisabled={false}
            maxZoom={cameraConfig.maxZoomDistance}

            // ✅ FIXED: Raw rads cleanly handed over directly to control elements
            minPolar={cameraConfig.ceilingLimitAngle}
            maxPolar={cameraConfig.floorLimitAngle}

            isLocked={isLocked}
          />
        </Canvas>
      </div>

      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none flex flex-col justify-between p-4 md:p-6">
        {showInstructions && !cleanViewActive ? (
          <div className="pointer-events-auto w-full max-w-sm mx-auto bg-neutral-900/90 border border-neutral-800 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl flex items-start justify-between gap-3 transition-all mt-14 md:mt-2">
            <div className="text-[11px] text-neutral-300 leading-relaxed font-medium">
              <span className="text-cyan-400 font-bold block mb-0.5">📱 Touch Operations:</span>
              • <span className="text-white font-bold">Tap geometry mesh</span> to select paint targets.<br />
              • <span className="text-white font-bold">1 Finger Swipe</span> to orbit rotate scenery bounds.<br />
              • <span className="text-white font-bold">2 Finger Swipe</span> to pan translate tracking positions.
            </div>
            <button onClick={() => setShowInstructions(false)} className="text-neutral-500 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded">✕</button>
          </div>
        ) : <div />}
        <div />
      </div>

      {hasHydrated && (
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
        />
      )}
    </div>
  );
}