'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF, OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BulbState } from '@/components/canvas/LightControls';
import { DBCameraConfig } from '@/app/(public)/workspace/page';

interface CanvasProps {
  modelUrl: string;
  roomColors: Record<string, string>;
  activeSurface: string;
  onSurfaceSelect: (meshName: string) => void;
  bulbs: BulbState[];
  cameraConfig: DBCameraConfig;
  roomTextures?: Record<string, string>;
  isNightMode?: boolean;
}

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

export default function WorkspaceCanvas({
  modelUrl,
  roomColors,
  activeSurface,
  onSurfaceSelect,
  bulbs,
  cameraConfig,
  isNightMode = false
}: CanvasProps) {
  const { scene } = useGLTF(modelUrl) as unknown as GLTFResult;
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const initialCamSet = useRef<boolean>(false);

  // Memoize active bulb filtering to prevent unnecessary array recreations per frame
  const activeBulbs = useMemo(() => {
    return bulbs.filter((b) => (b.visible !== undefined ? b.visible : b.enabled));
  }, [bulbs]);

  // Set initial camera positions once on load
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls && !initialCamSet.current && cameraConfig) {
      if (cameraConfig.target) {
        controls.target.set(...cameraConfig.target);
      } else {
        controls.target.set(-1.94, 2.7, 0.05);
      }
      if (cameraConfig.position) {
        controls.object.position.set(...cameraConfig.position);
      }
      controls.update();
      initialCamSet.current = true;
    }
  }, [cameraConfig]);

  // Smooth camera glide
  useFrame(() => {
    if (!controlsRef.current) return;

    let targetX = cameraConfig.target ? cameraConfig.target[0] : -1.94;
    const targetY = cameraConfig.target ? cameraConfig.target[1] : 2.7;
    let targetZ = cameraConfig.target ? cameraConfig.target[2] : 0.05;

    if (activeSurface === "wallLeft") { targetX = -2.5; }
    else if (activeSurface === "wallRight") { targetX = 0.5; }
    else if (activeSurface === "wallBack" || activeSurface === "wallFront") { targetZ = -1.0; }

    controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, 0.08);
    controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.08);
    controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, targetZ, 0.08);

    if (controlsRef.current.object.position.y < 0.2) {
      controlsRef.current.object.position.y = 0.2;
    }

    controlsRef.current.update();
  });

  // ⚡ OPTIMIZED MESH TRAVERSAL: Update color values directly without recreating materials
  useEffect(() => {
    if (!scene) return;

    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        const meshName = node.name;

        // Lightweight shadow setup (avoids VRAM thrashing)
        node.receiveShadow = true;

        if (roomColors[meshName]) {
          // Color.set() updates RGB in-place without garbage-collecting materials
          node.material.color.set(roomColors[meshName]);
        }
      }
    });
  }, [scene, roomColors]);

  return (
    <>
      <color attach="background" args={[isNightMode ? "#040406" : "#0c0c0e"]} />

      {/* Optimized Ambient Environment */}
      <ambientLight
        intensity={isNightMode ? 0.05 : 0.45}
        color={isNightMode ? "#0c1220" : "#ffffff"}
      />

      {/* Key Directional Sunlight with optimized shadow map size */}
      {!isNightMode && (
        <directionalLight
          position={[4, 8, 4]}
          intensity={0.5}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-bias={-0.0005}
        />
      )}

      {/* Dynamic Light Fixtures (Shadows turned off on point lights to save GPU VRAM) */}
      {activeBulbs.map((bulb) => (
        <group key={bulb.id} position={bulb.position}>
          <pointLight
            intensity={bulb.intensity}
            color={bulb.color}
            distance={bulb.distance || 15}
            decay={1.2}
            castShadow={false} // Prevents multi-light shadow depth map memory overflow
          />
        </group>
      ))}

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