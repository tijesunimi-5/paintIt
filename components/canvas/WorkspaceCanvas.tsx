'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF, OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BulbState } from './LightControls';
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

  // Set initial camera positions once from database settings on load
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

  // Smooth camera target glide loop when specific walls are focused
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

    // Safety Fallback: Stop camera height from dropping through the physical floor
    if (controlsRef.current.object.position.y < 0.2) {
      controlsRef.current.object.position.y = 0.2;
    }

    controlsRef.current.update();
  });

  // Mesh paint colors traverser
  useEffect(() => {
    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        const meshName = node.name;
        node.castShadow = true;
        node.receiveShadow = true;

        if (roomColors[meshName]) {
          node.material.color.set(roomColors[meshName]);
        }
        node.material.needsUpdate = true;
      }
    });
  }, [scene, roomColors]);

  return (
    <>
      {/* 🌌 Background adapts directly to global scene profiles */}
      <color attach="background" args={[isNightMode ? "#060608" : "#d1d5db"]} />

      {/* ☀️/🌙 MATCHED PLAYGROUND LIGHTING ENGINES */}
      {/* Ambient environment setup mirroring PlaygroundLighting defaults */}
      <ambientLight
        intensity={isNightMode ? 0.02 : 0.4}
        color={isNightMode ? "#0a0f1d" : "#ffffff"}
      />

      {/* Standard Directional Sunlight key matched to admin shadows */}
      {!isNightMode && (
        <directionalLight
          position={[4, 8, 4]}
          intensity={0.6}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
        />
      )}

      {/* 💡 Dynamic DB-driven light fixtures (No helper meshes rendering!) */}
      {bulbs.map((bulb) => {
        const isLightOn = bulb.visible !== undefined ? bulb.visible : bulb.enabled;
        if (!isLightOn) return null;

        // Keep position coordinates true to database configurations
        const adjustedPosition: [number, number, number] = [
          bulb.position[0],
          bulb.position[1],
          bulb.position[2]
        ];

        return (
          <group key={bulb.id} position={adjustedPosition}>
            {/* Pure Light Component is cast without rendering the visual white sphere helper mesh */}
            <pointLight
              intensity={bulb.intensity}
              color={bulb.color}
              distance={bulb.distance || 15}
              decay={1.2}
              castShadow
              shadow-bias={-0.0005}
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