'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Room from './Room';

interface SceneProps {
  activeSurface: string;
}

export default function Scene({ activeSurface }: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  // 1. INITIAL POSITION LOCK: Force the camera target on the very first render mount
  useEffect(() => {
    if (controlsRef.current) {
      // Points the camera slightly lower and pushed forward into the space
      controlsRef.current.target.set(0, 2.8, -1.0);
      controlsRef.current.update();
    }
  }, []);

  // 2. DYNAMIC AUTO-PANNING LERP LOOP
  useFrame(() => {
    if (!controlsRef.current) return;

    // Default room look-at coordinates match your preferred open visual perspective exactly
    let targetX = 0;
    let targetY = 2.8;
    let targetZ = -1.0;

    // Smoothly pan only if a specific wall has been actively selected
    if (activeSurface === 'wallLeft') {
      targetX = -1.8;
      targetY = 2.8;
      targetZ = 0;
    } else if (activeSurface === 'wallRight') {
      targetX = 1.8;
      targetY = 2.8;
      targetZ = 0;
    } else if (activeSurface === 'wallBack') {
      targetX = 0;
      targetY = 2.8;
      targetZ = -1.5;
    }

    // Smoothly glide to targets
    controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, 0.08);
    controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.08);
    controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, targetZ, 0.08);

    controlsRef.current.update();
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-10, 12, 6]} intensity={1.4} castShadow />
      <pointLight position={[4, 2, 4]} intensity={0.2} color="#FFFFFF" />

      <Room />

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}

        // Locked limits keep the view perfectly framed and under control
        minAzimuthAngle={-Math.PI / 8}
        maxAzimuthAngle={Math.PI / 8}
        minPolarAngle={Math.PI / 2.1}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}