'use client';

import React, { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useStudio } from '@/context/StudioContext';
import { SelectedSurface } from '@/types/index';

export default function Room() {
  const { roomColors, setActiveSurface, activeSurface } = useStudio();
  
  const width = 14;
  const height = 8;
  const depth = 14;

  const handleMeshClick = (surface: SelectedSurface, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveSurface(surface);
  };

  return (
    <group>
      {/* 1. FLOOR */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={(e) => handleMeshClick('floor', e)}>
        <planeGeometry args={[width, depth]} />
        
        <meshStandardMaterial 
          color={(roomColors.floor as string) || '#161618'} 
          roughness={0.7} 
          metalness={0.1} 
        />
      </mesh>

      {/* 2. CEILING */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} onClick={(e) => handleMeshClick('ceiling', e)}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={(roomColors.ceiling as string) || '#1a1a1c'} roughness={0.9} />
      </mesh>

      {/* 3. BACK WALL */}
      <mesh position={[0, height / 2, -depth / 2]} rotation={[0, 0, 0]} onClick={(e) => handleMeshClick('wallBack', e)}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={(roomColors.wallBack as string) || '#F2EFE9'}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* 4. LEFT WALL WITH WINDOW VIEWPORT */}
      <group position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} onClick={(e) => handleMeshClick('wallLeft', e)}>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial
            color={(roomColors.wallLeft as string) || '#9BA498'}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>

        {/* Architectural Window Border Overlay */}
        <mesh position={[0, -0.5, 0.02]}>
          <boxGeometry args={[4, 4, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 5. RIGHT WALL WITH MINIMAL DOORWAY */}
      <group position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} onClick={(e) => handleMeshClick('wallRight', e)}>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial
            color={(roomColors.wallRight as string) || '#C4B199'}
            roughness={0.85}
            metalness={0.05}
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