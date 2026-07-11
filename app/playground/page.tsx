'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useControls, Leva } from 'leva';
import {
  StudioBlenderModelMesh,
  CameraStudioController,
  PlaygroundLighting,
  AdminTransformGizmo
} from '@/components/canvas/playground-core';
import { FloatingAdminPanel } from '@/components/canvas/Admin-panel';
import { DynamicLightInstance } from '@/types/index';

export default function DedicatedPlayground() {
  const [activeSurface, setActiveSurface] = useState<string>('wallFront');
  const [sceneLights, setSceneLights] = useState<DynamicLightInstance[]>([]);
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [gizmoMode, setGizmoMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [cleanViewActive, setCleanViewActive] = useState<boolean>(false);

  const cameraConfig = useControls('Camera Limits', {
    maxZoomDistance: { value: 0.55, min: 0.1, max: 2.5, step: 0.05, label: 'Max Out Zoom' },
    ceilingLimitAngle: { value: 2.3, min: 1.0, max: 3.14, step: 0.05, label: 'Ceiling Stop' },
    floorLimitAngle: { value: 1.65, min: 1.0, max: 3.14, step: 0.05, label: 'Floor Stop' },
  });

  const globalEnvironment = useControls('Global Scene', {
    isNightMode: { value: false, label: '🌙 Night Mode' },
  });

  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    floor: '#f2f0ea', ceiling: '#ffffff', wallFront: '#F2EFE9', wallBack: '#F2EFE9', wallLeft: '#9BA498', wallRight: '#C4B199', toilet: '#ffffff'
  });

  const addNewLight = (type: 'point' | 'spot') => {
    const newLight: DynamicLightInstance = {
      id: `light_${Date.now()}`,
      type,
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      intensity: 3.0,
      color: '#fff',//ffcd73
      distance: 15,
    };
    setSceneLights((prev) => [...prev, newLight]);
    setSelectedLightId(newLight.id);
  };

  const activeLightData = sceneLights.find((l) => l.id === selectedLightId);

  const updateActiveLightTransform = (property: 'position' | 'rotation' | 'scale', value: [number, number, number]) => {
    if (!selectedLightId) return;
    setSceneLights((prev) => prev.map((l) => (l.id === selectedLightId ? { ...l, [property]: value } : l)));
  };

  const updateActiveLightScalar = (property: 'intensity' | 'distance', value: number) => {
    if (!selectedLightId) return;
    setSceneLights((prev) => prev.map((l) => (l.id === selectedLightId ? { ...l, [property]: value } : l)));
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 w-screen h-screen overflow-hidden select-none z-50 font-sans">

      <div className={cleanViewActive ? 'hidden' : 'block absolute top-4 right-4 z-50'}>
        <Leva theme={{ sizes: { controlWidth: '130px' } }} />
      </div>

      <div className="absolute inset-0 w-full h-full z-10 bg-neutral-900">
        <Canvas shadows camera={{ position: [0, 1.4, 0.4], fov: 68 }}>
          <PlaygroundLighting isNight={globalEnvironment.isNightMode} showHelpers={!cleanViewActive} />

          <Suspense fallback={null}>
            <StudioBlenderModelMesh
              modelUrl="/models/selfcon.glb"
              surfaceStates={roomColors}
              onTargetSelect={(meshName: string) => {
                if (!cleanViewActive && !selectedLightId) {
                  setActiveSurface(meshName);
                }
              }}
            />
          </Suspense>

          {sceneLights.map((light) => (
            <group key={light.id}>
              {light.type === 'point' ? (
                <pointLight position={light.position} rotation={light.rotation} scale={light.scale} intensity={light.intensity} color={light.color} distance={light.distance} castShadow shadow-bias={-0.0005} />
              ) : (
                <spotLight position={light.position} rotation={light.rotation} scale={light.scale} intensity={light.intensity} color={light.color} distance={light.distance} castShadow angle={Math.PI / 4} shadow-bias={-0.0005} />
              )}
            </group>
          ))}

          {activeLightData && !cleanViewActive && (
            <AdminTransformGizmo activeLight={activeLightData} mode={gizmoMode} onTransformUpdate={updateActiveLightTransform} />
          )}

          <CameraStudioController
            isOrbitDisabled={!!selectedLightId && !cleanViewActive}
            maxZoom={cameraConfig.maxZoomDistance}
            minPolar={Math.PI / cameraConfig.ceilingLimitAngle}
            maxPolar={Math.PI / cameraConfig.floorLimitAngle}
          />
        </Canvas>
      </div>

      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none flex flex-col justify-between p-6">
        <div />
        <div className="flex justify-between items-end w-full">
          <button
            type="button"
            onClick={() => {
              setCleanViewActive(!cleanViewActive);
              if (!cleanViewActive) setSelectedLightId(null);
            }}
            className="pointer-events-auto w-12 h-12 bg-neutral-900 border border-neutral-800 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all text-xl"
          >
            {cleanViewActive ? '👁️' : '🕶️'}
          </button>
        </div>
      </div>

      {!cleanViewActive && (
        <FloatingAdminPanel
          activeSurface={activeSurface}
          sceneLights={sceneLights}
          selectedLightId={selectedLightId}
          gizmoMode={gizmoMode}
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
          // FIXED TYPES: Fully signatures provided to prevent implicit any and index errors
          onVectorUpdate={(property: 'position' | 'rotation' | 'scale', axisIndex: number, value: number) => {
            if (!selectedLightId) return;
            setSceneLights((prev) => prev.map((l) => {
              if (l.id === selectedLightId) {
                const updatedVector = [...l[property]] as [number, number, number];
                updatedVector[axisIndex] = parseFloat(value.toFixed(2));
                return { ...l, [property]: updatedVector };
              }
              return l;
            }));
          }}
        />
      )}
    </div>
  );
}