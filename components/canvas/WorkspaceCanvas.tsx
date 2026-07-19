'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF, OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BulbState } from '@/components/canvas/LightControls';
import { DBCameraConfig } from '@/app/(public)/workspace/page';
import { generateWallNormalMap } from '@/utils/generateWallNormalMaps';

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

const WALL_MAPPING: Record<string, string> = {
  left: 'wallLeft',
  right: 'wallRight',
  back: 'wallBack',
  front: 'wallFront',
  roof: 'ceiling'
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
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const hasInnerWalls = !!clone.getObjectByName('wallLeft');
    if (hasInnerWalls) {
      console.log("🛠️ [Workspace Canvas] Preparing scene: interior walls detected. Hiding structural exterior walls.");
      clone.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (WALL_MAPPING[node.name]) {
            node.visible = false;
            console.log(`🚫 [Workspace Canvas] Hid duplicate exterior wall: ${node.name}`);
          }
        }
      });
    }
    return clone;
  }, [scene]);
  const wallNormalMap = useMemo(() => generateWallNormalMap(512, 512), []);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const initialCamSet = useRef<boolean>(false);

  // Memoize active bulb filtering to prevent unnecessary array recreations per frame
  const activeBulbs = useMemo(() => {
    return bulbs.filter((b) => (b.visible !== undefined ? b.visible : b.enabled));
  }, [bulbs]);

  // Set initial camera positions once on load
  useEffect(() => {
    if (controlsRef.current && cameraConfig && !initialCamSet.current) {
      if (cameraConfig.target) {
        controlsRef.current.target.set(...cameraConfig.target);
      }
      if (cameraConfig.position) {
        controlsRef.current.object.position.set(...cameraConfig.position);
      }
      controlsRef.current.update();
      initialCamSet.current = true;
    }
  }, [cameraConfig]);

  // 2. DYNAMIC AUTO-PANNING CAMERA TARGET GLIDING LERP LOOP
  useFrame(() => {
    if (!controlsRef.current) return;

    let targetX = cameraConfig.target ? cameraConfig.target[0] : -1.94;
    const targetY = cameraConfig.target ? cameraConfig.target[1] : 2.7;
    let targetZ = cameraConfig.target ? cameraConfig.target[2] : 0.05;

    // Smoothly pan camera viewpoint focus target based on active surface selection
    if (activeSurface === 'wallLeft') {
      targetX = -2.5;
    } else if (activeSurface === 'wallRight') {
      targetX = -0.5;
    } else if (activeSurface === 'wallBack' || activeSurface === 'wallFront') {
      targetZ = -1.0;
    }

    controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, 0.08);
    controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.08);
    controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, targetZ, 0.08);

    controlsRef.current.update();
  });

  // ⚡ OPTIMIZED MESH TRAVERSAL: Update color values directly without recreating materials
  useEffect(() => {
    if (!clonedScene) return;

    console.log("🎨 [Workspace Canvas] Traversing Scene. roomColors:", roomColors);

    clonedScene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        const meshName = node.name;
        if (!node.visible) return; // Skip hidden duplicate exterior walls

        if (node.material instanceof THREE.MeshStandardMaterial) {
          const targetKey = WALL_MAPPING[meshName] || meshName;

          // Shadow mapping depth setups
          node.receiveShadow = true;
          node.castShadow = true;

          if (roomColors[targetKey]) {
            console.log(`🖌️ [Workspace Canvas] Painting ${meshName} (${targetKey}) -> ${roomColors[targetKey]}`);
            // Clone shared materials to prevent cross-surface color bleeding
            node.material = node.material.clone();
            node.material.side = THREE.DoubleSide; // Support flipped normals
            // Color.set() updates RGB in-place
            node.material.color.set(roomColors[targetKey]);

            // Apply plaster bumps to walls to simulate paint roller orange-peel texture
            if (targetKey.startsWith('wall')) {
              node.material.bumpMap = wallNormalMap;
              node.material.bumpScale = 0.015;
              node.material.roughness = 0.85; // Matte finish scatter

              // Enable polygon offset to prevent overlapping mesh z-fighting
              node.material.polygonOffset = true;
              node.material.polygonOffsetFactor = -1;
              node.material.polygonOffsetUnits = -1;
            }
            node.material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, roomColors, wallNormalMap]);

  return (
    <>
      <color attach="background" args={[isNightMode ? "#040406" : "#0c0c0e"]} />

      {/* Optimized Ambient Environment */}
      <ambientLight
        intensity={isNightMode ? 0.05 : 0.55}
        color={isNightMode ? "#0c1220" : "#ffffff"}
      />

      {/* Key Directional Sunlight with optimized shadow map size */}
      {!isNightMode && (
        <directionalLight
          position={[4, 8, 4]}
          intensity={0.85}
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
        object={clonedScene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.object instanceof THREE.Mesh) {
            const rawName = e.object.name || e.object.uuid;
            const targetName = WALL_MAPPING[rawName] || rawName;
            console.log("🎯 [Workspace Canvas] Clicked Mesh:", rawName, "-> mapped to:", targetName);
            onSurfaceSelect(targetName);
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