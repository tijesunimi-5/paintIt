"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { PAINT_FINISH_PRESETS, PaintFinishId } from "@/config/paintFinishes";
import { generateWallNormalMap } from "@/utils/generateWallNormalMaps";

interface PaintableWallMaterialProps {
  colorHex: string;
  finishId: PaintFinishId;
}

export function PaintableWallMaterial({ colorHex, finishId }: PaintableWallMaterialProps) {
  // 1. Generate normal map texture once (cached in memory)
  const wallNormalMap = useMemo(() => generateWallNormalMap(512, 512), []);

  // 2. Resolve current finish material parameters
  const activePreset = PAINT_FINISH_PRESETS[finishId] || PAINT_FINISH_PRESETS.EMULSION;
  const { roughness, metalness, clearcoat, clearcoatRoughness, bumpScale, envMapIntensity } =
    activePreset.materialProps;

  return (
    <meshPhysicalMaterial
      color={colorHex}
      roughness={roughness}
      metalness={metalness}
      // Clearcoat simulates lacquer / shine layer on Satin & Gloss
      clearcoat={clearcoat || 0}
      clearcoatRoughness={clearcoatRoughness || 0.1}
      // Micro-bump map simulates wall plaster & paint roller orange-peel texture
      bumpMap={wallNormalMap}
      bumpScale={bumpScale}
      envMapIntensity={envMapIntensity}
      side={THREE.DoubleSide}
    />
  );
}