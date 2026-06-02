'use client';

import React, { useMemo } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '@/context/StudioContext';
import { SelectedSurface } from '@/types/index';

export default function Room() {
  const { roomColors, setActiveSurface, activeSurface } = useStudio();

  // Clean room dimensions matrix
  const width = 14;
  const height = 8;
  const depth = 14;

  // React Spring physics configuration for luxurious architectural transitions
  const sprWallBack = useSpring({ color: roomColors.wallBack, config: { tension: 140, friction: 26 } });
  const sprWallLeft = useSpring({ color: roomColors.wallLeft, config: { tension: 140, friction: 26 } });
  const sprWallRight = useSpring({ color: roomColors.wallRight, config: { tension: 140, friction: 26 } });
  const sprCeiling = useSpring({ color: roomColors.ceiling, config: { tension: 100, friction: 25 } });

  const handleMeshClick = (surface: SelectedSurface, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveSurface(surface);
  };

  // Compile the high-performance procedural grid-line tile system
  const floorPatternMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(roomColors.floor || '#161618') },
        lineColor: { value: new THREE.Color('#242427') },
        scale: { value: 10.0 } // Dictates the sizing scale of the floor patterns
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 baseColor;
        uniform vec3 lineColor;
        uniform float scale;
        void main() {
          // Creates clean grid lines using screen-space derivatives to completely eliminate mobile aliasing
          vec2 grid = abs(fract(vUv * scale - 0.5) - 0.5) / fwidth(vUv * scale);
          float line = min(grid.x, grid.y);
          float c = 1.0 - min(line, 1.0);
          
          vec3 finalColor = mix(baseColor, lineColor, c);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
  }, [roomColors.floor]);

  // Synchronize dynamic color changes smoothly with our custom shader layer
  React.useEffect(() => {
    if (floorPatternMaterial.uniforms.baseColor) {
      floorPatternMaterial.uniforms.baseColor.value.set(roomColors.floor);
    }
  }, [roomColors.floor, floorPatternMaterial]);

  return (
    <group>
      {/* 1. PROCEDURAL PATTERN FLOOR */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={(e) => handleMeshClick('floor', e)}>
        <planeGeometry args={[width, depth]} />
        <primitive object={floorPatternMaterial} attach="material" />
      </mesh>

      {/* 2. CEILING */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} onClick={(e) => handleMeshClick('ceiling', e)}>
        <planeGeometry args={[width, depth]} />
        <animated.meshStandardMaterial color={sprCeiling.color} roughness={0.9} />
      </mesh>

      {/* 3. BACK WALL */}
      <mesh position={[0, height / 2, -depth / 2]} rotation={[0, 0, 0]} onClick={(e) => handleMeshClick('wallBack', e)}>
        <planeGeometry args={[width, height]} />
        <animated.meshStandardMaterial
          color={sprWallBack.color}
          roughness={0.85}
          metalness={0.05}
          emissive={activeSurface === 'wallBack' ? '#141414' : '#000000'}
        />
      </mesh>

      {/* 4. LEFT WALL WITH WINDOW VIEWPORT */}
      <group position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} onClick={(e) => handleMeshClick('wallLeft', e)}>
          <planeGeometry args={[depth, height]} />
          <animated.meshStandardMaterial
            color={sprWallLeft.color}
            roughness={0.85}
            metalness={0.05}
            side={THREE.DoubleSide}
            emissive={activeSurface === 'wallLeft' ? '#141414' : '#000000'}
          />
        </mesh>

        {/* Architectural Window Border Overlay */}
        <mesh position={[0, -0.5, 0.02]}>
          <boxGeometry args={[4, 4, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 5. RIGHT WALL WITH MINIMAL DOOR WAY */}
      <group position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} onClick={(e) => handleMeshClick('wallRight', e)}>
          <planeGeometry args={[depth, height]} />
          <animated.meshStandardMaterial
            color={sprWallRight.color}
            roughness={0.85}
            metalness={0.05}
            side={THREE.DoubleSide}
            emissive={activeSurface === 'wallRight' ? '#141414' : '#000000'}
          />
        </mesh>

        {/* Recessed Door frame */}
        <mesh position={[2, -1.2, 0.02]}>
          <boxGeometry args={[2.5, 5.6, 0.05]} />
          <meshStandardMaterial color="#222222" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}