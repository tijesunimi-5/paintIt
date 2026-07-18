"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { PAINT_FINISH_PRESETS, PaintFinishId } from "@/config/paintFinishes";
import { generateWallNormalMap } from "@/utils/generateWallNormalMaps";

interface WallSurfaceProps {
  geometry: THREE.BufferGeometry;
  colorHex: string;
  finishId: PaintFinishId;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function WallSurface({
  geometry,
  colorHex,
  finishId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: WallSurfaceProps) {
  // Generate wall roller stipple normal map once
  const wallNormalTexture = useMemo(() => generateWallNormalMap(512, 512), []);

  // Retrieve material settings for current finish
  const activePreset = PAINT_FINISH_PRESETS[finishId] || PAINT_FINISH_PRESETS.EMULSION;
  const { roughness, metalness, clearcoat, clearcoatRoughness, bumpScale, envMapIntensity } =
    activePreset.materialProps;

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={colorHex}
        roughness={roughness}
        metalness={metalness}
        // Surface imperfections & stipple bump
        bumpMap={wallNormalTexture}
        bumpScale={bumpScale}
        // Secondary reflection layer for Gloss / Satin
        clearcoat={clearcoat ?? 0}
        clearcoatRoughness={clearcoatRoughness ?? 0.1}
        envMapIntensity={envMapIntensity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}