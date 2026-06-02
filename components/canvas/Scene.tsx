'use client';

import React, { useRef } from 'react';
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

  useFrame(() => {
    if (!controlsRef.current) return;

    // Default look-at targets
    let targetX = 0;
    let targetY = 3.5;
    let targetZ = 0;

    // Automated camera tracking updates based on active UI surface selection
    if (activeSurface === 'wallLeft') {
      targetX = -1.8; // Smoothly shifts focus to frame the left wall edge
      targetY = 3.5;
    } else if (activeSurface === 'wallRight') {
      targetX = 1.8;  // Smoothly shifts focus to frame the right wall edge
      targetY = 3.5;
    } else if (activeSurface === 'wallBack') {
      targetX = 0;
      targetY = 3.5;
      targetZ = -0.5;
    }

    // Seamlessly lerp the controls target vector so the transition is fluid
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

        // 1. LOCK THE HORIZONTAL SWIPE (Azimuth Boundary limits)
        // This stops them from spinning 360°. They can only swipe a tiny bit left and right.
        minAzimuthAngle={-Math.PI / 8} // Approx -22.5 degrees maximum left swipe
        maxAzimuthAngle={Math.PI / 8}  // Approx 22.5 degrees maximum right swipe

        // 2. LOCK THE VERTICAL SWIPE (Polar Boundary limits)
        // Stops them from looking at the raw floor or direct ceiling grids
        minPolarAngle={Math.PI / 2.1}  // Almost perfectly level horizontally
        maxPolarAngle={Math.PI / 1.8}  // Minimal down tilt allowance
      />
    </>
  );
}