'use client';

import React from 'react';
import { OrbitControls } from '@react-three/drei';
import Room from './Room';

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[-12, 10, 4]}
        intensity={1.5}
        castShadow
      />
      <pointLight position={[3, 2, 3]} intensity={0.3} color="#FFFFFF" />

      <Room />

      <OrbitControls
        // Shifted focus point to X = -1.5 to frame the left-to-back corner perfectly
        target={[-1.5, 3.5, 0]}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minAzimuthAngle={-Math.PI / 2.5}
        maxAzimuthAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}