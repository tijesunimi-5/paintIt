'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF, OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BulbState } from '@/components/canvas/LightControls';
import { DBCameraConfig } from '@/app/(public)/workspace/page';
import { generateWallNormalMap } from '@/utils/generateWallNormalMaps';
import { TEXTURE_PRESETS, TextureCategory, getMeshCategory } from '@/utils/generateFloorTextures';

interface CanvasProps {
  modelUrl: string;
  roomColors: Record<string, string>;
  activeSurface: string;
  onSurfaceSelect: (meshName: string) => void;
  bulbs: BulbState[];
  cameraConfig: DBCameraConfig;
  roomTextures?: Record<string, string>;
  activeTextures?: Record<string, string>;
  materialSwaps?: Record<string, string>;
  onModelLoaded?: (meshes: string[], materials: string[]) => void;
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
  roomTextures,
  activeTextures,
  materialSwaps,
  onModelLoaded,
  isNightMode = false
}: CanvasProps) {
  const { scene, materials } = useGLTF(modelUrl) as unknown as GLTFResult;
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

  // Extract all meshes and materials to notify parent component
  useEffect(() => {
    if (scene && materials && onModelLoaded) {
      const materialNames = Object.keys(materials);
      const meshNames: string[] = [];
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          meshNames.push(node.name);
        }
      });
      console.log(`📦 [Workspace Canvas] Model Loaded: ${meshNames.length} meshes, ${materialNames.length} materials detected.`);
      onModelLoaded(meshNames, materialNames);
    }
  }, [scene, materials, onModelLoaded]);

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

  // ⚡ OPTIMIZED MESH TRAVERSAL: Update materials for walls, textures, & material swaps dynamically
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        const meshName = node.name;
        if (!node.visible) return; // Skip hidden duplicate exterior walls

        node.receiveShadow = true;
        node.castShadow = true;

        const targetKey = WALL_MAPPING[meshName] || meshName;
        const category = getMeshCategory(meshName);
        
        // 1. Resolve dynamic texture mapping (custom mesh ID specific or category fallback)
        const activeTextureId = activeTextures?.[meshName] || activeTextures?.[category];
        
        // 2. Resolve material swap mapping
        const swapMaterialName = materialSwaps?.[meshName];

        if (activeTextureId && activeTextureId !== "original") {
          const preset = TEXTURE_PRESETS.find((p) => p.id === activeTextureId);
          if (preset) {
            const mat = new THREE.MeshStandardMaterial({
              map: preset.generateTexture(),
              roughness: preset.roughness,
              metalness: preset.metalness,
              side: THREE.DoubleSide,
            });
            if (preset.clearcoat) (mat as unknown as { clearcoat: number }).clearcoat = preset.clearcoat;
            node.material = mat;
            node.material.needsUpdate = true;
          }
        } else if (swapMaterialName && materials[swapMaterialName]) {
          // Dynamic native material swapping
          node.material = materials[swapMaterialName].clone();
          node.material.side = THREE.DoubleSide;
          node.material.needsUpdate = true;
        } else {
          // Check paint color for walls or custom painted objects
          const activeColor = roomColors[meshName] || roomColors[targetKey];
          const isWallSurface = category === 'WALL';

          if (activeColor && node.material instanceof THREE.MeshStandardMaterial) {
            node.material = node.material.clone();
            node.material.side = THREE.DoubleSide;
            node.material.color.set(activeColor);

            if (isWallSurface || meshName.startsWith('wall')) {
              node.material.bumpMap = wallNormalMap;
              node.material.bumpScale = 0.015;
              node.material.roughness = 0.85;

              node.material.polygonOffset = true;
              node.material.polygonOffsetFactor = -1;
              node.material.polygonOffsetUnits = -1;
            }
            node.material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, roomColors, wallNormalMap, activeTextures, materialSwaps, materials]);

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