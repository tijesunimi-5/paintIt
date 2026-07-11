'use client';
import { Environment } from '@react-three/drei';

export default function SceneLighting() {
  return (
    <>
      {/* Explicitly point to your local public folder asset */}
      {/* Force it to use the standard unpkg repository directly if the default basement studio CDN is down */}
      <Environment
        preset="apartment"
        path="https://unpkg.com/@react-three/drei@latest/assets/hdri/"
      />
      <ambientLight intensity={0.6} />

      <directionalLight
        castShadow
        position={[5, 6, 4]}
        intensity={2.0}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
    </>
  );
}