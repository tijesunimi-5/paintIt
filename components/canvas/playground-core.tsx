'use client';

import React, { useEffect, useMemo, useRef } from 'react';
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
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={activeLight.color || '#06b6d4'} wireframe />
      </mesh>
    </TransformControls>
  );
}

interface BaseLightingProps { isNight: boolean; showHelpers: boolean; }
export function PlaygroundLighting({ isNight, showHelpers }: BaseLightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  useHelper((showHelpers && sunRef ? sunRef : false) as React.RefObject<THREE.Object3D> | false, THREE.DirectionalLightHelper, 1, 'coral');

  return (
    <>
      <Sky distance={450000} sunPosition={isNight ? [0, -10, -10] : [8, 6, 5]} mieCoefficient={0.005} mieDirectionalG={0.07} rayleigh={isNight ? 0.3 : 1.8} turbidity={isNight ? 20 : 8} />
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

interface BlenderMeshProps { modelUrl: string; surfaceStates: Record<string, string>; onTargetSelect: (meshName: string) => void; }
interface GLTFResult extends GLTF { nodes: Record<string, THREE.Object3D>; materials: Record<string, THREE.Material>; }

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

interface LightRendererProps { lights: DynamicLightInstance[]; }
export function PlaygroundLightsEngine({ lights }: LightRendererProps) {
  return (
    <>
      {lights.map((light) => {
        if (light.type === 'point') {
          return (
            <mesh key={light.id} position={light.position}>
              <pointLight intensity={light.intensity} color={light.color} distance={light.distance} decay={1.0} castShadow shadow-bias={-0.0005} />
              <sphereGeometry args={[0.04 * light.scale[0], 16, 16]} />
              <meshBasicMaterial color={light.color} wireframe opacity={0.25} transparent />
            </mesh>
          );
        }
        return <SpotLightInstance key={light.id} light={light} />;
      })}
    </>
  );
}

function SpotLightInstance({ light }: { light: DynamicLightInstance }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  const targetPosition = useMemo(() => {
    const dir = new THREE.Vector3(0, -1, 0);
    const euler = new THREE.Euler(light.rotation[0], light.rotation[1], light.rotation[2], 'XYZ');
    dir.applyEuler(euler);
    dir.multiplyScalar(5);
    return [light.position[0] + dir.x, light.position[1] + dir.y, light.position[2] + dir.z] as [number, number, number];
  }, [light.position, light.rotation]);

  const dynamicConeAngle = useMemo(() => {
    return Math.min((Math.PI / 6) * light.scale[0], Math.PI / 2.1);
  }, [light.scale]);

  return (
    <group>
      <spotLight ref={lightRef} position={light.position} intensity={light.intensity} color={light.color} distance={light.distance} decay={1.0} angle={dynamicConeAngle} penumbra={0.4} castShadow shadow-bias={-0.0005} />
      <group ref={targetRef} position={targetPosition} />
    </group>
  );
}

interface CameraControllerProps {
  isOrbitDisabled: boolean;
  minPolar: number;
  maxPolar: number;
  maxZoom: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isLocked: boolean;
}

export function CameraStudioController({ isOrbitDisabled, minPolar, maxPolar, maxZoom, controlsRef, isLocked }: CameraControllerProps) {
  // 🎯 Ref flags initial placement check so panels toggles won't fire resets
  const hasInitialized = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Run positioning configuration ONLY once during mounting or user mode shifts
    if (!hasInitialized.current) {
      if (isLocked) {
        controls.target.set(-0.5, 1.85, 0);
        controls.object.position.set(0.4, 1.85, 2.0);
      } else {
        controls.target.set(0, 1.5, 0);
        controls.object.position.set(0, 1.4, 2.2);
      }
      controls.update();
      hasInitialized.current = true;
    }
  }, [controlsRef, isLocked]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleCameraChange = () => {
      const target = controls.target;
      const maxPanX = 3.5;
      const minPanY = 0.2;
      const maxPanY = 5.5;
      const maxPanZ = 3.5;

      let needsUpdate = false;
      if (target.x < -maxPanX) { target.x = -maxPanX; needsUpdate = true; }
      if (target.x > maxPanX) { target.x = maxPanX; needsUpdate = true; }
      if (target.y < minPanY) { target.y = minPanY; needsUpdate = true; }
      if (target.y > maxPanY) { target.y = maxPanY; needsUpdate = true; }
      if (target.z < -maxPanZ) { target.z = -maxPanZ; needsUpdate = true; }
      if (target.z > maxPanZ) { target.z = maxPanZ; needsUpdate = true; }

      if (needsUpdate) controls.update();
    };

    controls.addEventListener('change', handleCameraChange);
    return () => controls.removeEventListener('change', handleCameraChange);
  }, [controlsRef]);

  return (
    <OrbitControls
      ref={controlsRef as React.RefObject<OrbitControlsImpl>}
      enabled={!isOrbitDisabled}
      enablePan={!isLocked}
      enableZoom={true}
      enableDamping
      dampingFactor={0.04}
      minDistance={0.1}
      maxDistance={maxZoom * 5}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      minPolarAngle={minPolar}
      maxPolarAngle={maxPolar}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.PAN }}
    />
  );
}