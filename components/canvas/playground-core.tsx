'use client';

import React, { useEffect, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, Sky, TransformControls, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF, OrbitControls as OrbitControlsImpl, TransformControls as TransformControlsImpl } from 'three-stdlib';
import { DynamicLightInstance } from '@/types/index';

interface GizmoProps {
  activeLight: DynamicLightInstance;
  mode: 'translate' | 'rotate' | 'scale';
  onTransformUpdate: (property: 'position' | 'rotation' | 'scale', value: [number, number, number]) => void;
}

// ==========================================================
// 🕹️ MASTER 3D TRANSFORM GIZMO (POSITION, ROTATION, SCALE)
// ==========================================================
export function AdminTransformGizmo({ activeLight, mode, onTransformUpdate }: GizmoProps) {
  const transformRef = useRef<TransformControlsImpl>(null);

  const handleObjectChange = (e: THREE.Event | undefined) => {
    if (!e || !e.target) return;

    const targetControls = e.target as { object?: THREE.Object3D };
    const obj = targetControls.object;
    if (!obj) return;

    if (mode === 'translate') {
      onTransformUpdate('position', [
        parseFloat(obj.position.x.toFixed(2)),
        parseFloat(obj.position.y.toFixed(2)),
        parseFloat(obj.position.z.toFixed(2))
      ]);
    } else if (mode === 'rotate') {
      onTransformUpdate('rotation', [
        parseFloat(obj.rotation.x.toFixed(2)),
        parseFloat(obj.rotation.y.toFixed(2)),
        parseFloat(obj.rotation.z.toFixed(2))
      ]);
    } else if (mode === 'scale') {
      onTransformUpdate('scale', [
        parseFloat(obj.scale.x.toFixed(2)),
        parseFloat(obj.scale.y.toFixed(2)),
        parseFloat(obj.scale.z.toFixed(2))
      ]);
    }
  };

  return (
    <TransformControls
      ref={transformRef}
      mode={mode}
      size={0.75}
      position={activeLight.position}
      rotation={activeLight.rotation}
      scale={activeLight.scale}
      onChange={handleObjectChange}
    >
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={activeLight.color || (activeLight.type === 'point' ? '#06b6d4' : '#d946ef')} wireframe />
      </mesh>
    </TransformControls>
  );
}

// ==========================================================
// 💡 BASE ARCHITECTURAL STAGE ENVIRONMENT LIGHTING RIG
// ==========================================================
interface BaseLightingProps {
  isNight: boolean;
  showHelpers: boolean;
}

export function PlaygroundLighting({ isNight, showHelpers }: BaseLightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  useHelper(
    (showHelpers && sunRef ? sunRef : false) as React.RefObject<THREE.Object3D> | false,
    THREE.DirectionalLightHelper,
    1,
    'coral'
  );

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={isNight ? [0, -10, -10] : [8, 6, 5]}
        mieCoefficient={0.005}
        mieDirectionalG={0.07}
        rayleigh={isNight ? 0.3 : 1.8}
        turbidity={isNight ? 20 : 8}
      />
      {isNight ? (
        <>
          <ambientLight intensity={0.02} color="#0b0f19" />
          <hemisphereLight args={['#141a29', '#05050a', 0.1]} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.35} color="#ffffff" />
          <hemisphereLight args={['#ffffff', '#444444', 0.25]} />
        </>
      )}
    </>
  );
}

// ==========================================================
// 🏗️ UNIVERSAL INTERACTIVE MODEL SURFACE TARGETER
// ==========================================================
interface BlenderMeshProps {
  modelUrl: string;
  surfaceStates: Record<string, string>;
  onTargetSelect: (meshName: string) => void;
}
interface GLTFResult extends GLTF {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
}

export function StudioBlenderModelMesh({ modelUrl, surfaceStates, onTargetSelect }: BlenderMeshProps) {
  const { scene } = useGLTF(modelUrl) as unknown as GLTFResult;

  useEffect(() => {
    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material instanceof THREE.MeshStandardMaterial) {
          const meshName = node.name;
          if (surfaceStates[meshName]) node.material.color.set(surfaceStates[meshName]);
          if (meshName === 'floor') {
            if (!surfaceStates[meshName]) node.material.color.set('#f2f0ea');
            node.material.roughness = 0.12;
          } else if (meshName === 'ceiling') {
            if (!surfaceStates[meshName]) node.material.color.set('#ffffff');
            node.material.roughness = 0.95;
          } else if (meshName.startsWith('wall') || meshName === 'toilet') {
            node.material.roughness = 0.88;
          } else if (node.name.toLowerCase().includes('wardrobe')) {
            node.material.roughness = 0.55;
          } else if (node.name.toLowerCase().includes('frame') || node.name.toLowerCase().includes('door')) {
            node.material.roughness = 0.45;
          } else if (meshName === 'roof') {
            node.material.color.set('#3a3a3a');
            node.material.roughness = 0.75;
          }
          node.material.needsUpdate = true;
        }
      }
    });
  }, [scene, surfaceStates]);

  return (
    <primitive
      object={scene}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (e.object instanceof THREE.Mesh) {
          const targetName = e.object.name || e.object.parent?.name;
          if (targetName) onTargetSelect(targetName);
        }
      }}
    />
  );
}

// ==========================================================
// 🎥 CAMERA CONTROLLER (STRICT BOUNDS & MOBILE-TOUCH OPTIMIZED)
// ==========================================================
interface CameraControllerProps {
  isOrbitDisabled: boolean;
  minPolar: number;
  maxPolar: number;
  maxZoom: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraStudioController({ isOrbitDisabled, minPolar, maxPolar, maxZoom, controlsRef }: CameraControllerProps) {
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      // 1. FIXED STARTING POSITION: Places the camera lens high up in the middle space of the house
      controls.object.position.set(0, 1.7, 1.5);

      // 2. FIXED TARGET FOXY POINT: Forces rotation to anchor in the center air space, keeping the floor out of clipping bounds
      controls.target.set(0, 1.5, 0);
      controls.update();
    }
  }, [controlsRef]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleCameraChange = () => {
      const target = controls.target;

      // Panning envelope boundaries to lock camera within the house walls
      const maxPanX = 2.2;
      const minPanY = 0.8;  // Raised minimum height constraint so panning can't drag down beneath foundations
      const maxPanY = 2.4;
      const maxPanZ = 2.2;

      let needsUpdate = false;

      if (target.x < -maxPanX) { target.x = -maxPanX; needsUpdate = true; }
      if (target.x > maxPanX) { target.x = maxPanX; needsUpdate = true; }

      if (target.y < minPanY) { target.y = minPanY; needsUpdate = true; }
      if (target.y > maxPanY) { target.y = maxPanY; needsUpdate = true; }

      if (target.z < -maxPanZ) { target.z = -maxPanZ; needsUpdate = true; }
      if (target.z > maxPanZ) { target.z = maxPanZ; needsUpdate = true; }

      if (needsUpdate) {
        controls.update();
      }
    };

    controls.addEventListener('change', handleCameraChange);
    return () => controls.removeEventListener('change', handleCameraChange);
  }, [controlsRef]);

  return (
    <OrbitControls
      ref={controlsRef as React.RefObject<OrbitControlsImpl>}
      enabled={!isOrbitDisabled}
      enablePan={true}
      enableZoom={true}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.1}
      maxDistance={maxZoom * 5}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      minPolarAngle={0.2}
      // 3. MAX POLAR CLAMP: Strictly stops the camera from swinging too low, completely blocking views beneath the floor!
      maxPolarAngle={Math.PI / 2.1}
      // 4. FIXED TOUCH CONTROL PROFILE: Swiping with 2 fingers now slides the camera itself horizontally (X) and vertically (Y)
      touches={{
        ONE: THREE.TOUCH.ROTATE, // 1 finger = Orbit 360 view / up-down tilt lookaround
        TWO: THREE.TOUCH.PAN     // 2 fingers = Pure screen horizontal and vertical translation (X and Y Panning)
      }}
    />
  );
}

useGLTF.preload('/models/model1.glb');