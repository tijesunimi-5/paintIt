import * as THREE from "three";

export type TextureCategory = "FLOOR" | "WARDROBE" | "DOOR";

export interface TexturePresetItem {
  id: string;
  name: string;
  category: TextureCategory;
  thumbnailColor: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  generateTexture: () => THREE.CanvasTexture;
}

/**
 * Procedural PBR Canvas Texture Generator for Floors & Furniture
 * Zero network latency, instant 60fps rendering, 100% offline reliability.
 */
export const TEXTURE_PRESETS: TexturePresetItem[] = [
  // 🪵 FLOOR TEXTURES
  {
    id: "original",
    name: "Blender Model Native",
    category: "FLOOR",
    thumbnailColor: "#7c5c43",
    roughness: 0.3,
    metalness: 0.05,
    generateTexture: () => new THREE.CanvasTexture(document.createElement("canvas")),
  },
  {
    id: "floor_walnut",
    name: "Walnut Wood Planks",
    category: "FLOOR",
    thumbnailColor: "#5c4033",
    roughness: 0.35,
    metalness: 0.05,
    generateTexture: () => createPlankTexture("#5c4033", "#3b281f", "HORIZONTAL"),
  },
  {
    id: "floor_herringbone",
    name: "Herringbone Parquet",
    category: "FLOOR",
    thumbnailColor: "#8b5a2b",
    roughness: 0.28,
    metalness: 0.05,
    generateTexture: () => createHerringboneTexture("#8b5a2b", "#5a3a1b"),
  },
  {
    id: "floor_oak",
    name: "Light Oak Wood",
    category: "FLOOR",
    thumbnailColor: "#c29b68",
    roughness: 0.4,
    metalness: 0.02,
    generateTexture: () => createPlankTexture("#c29b68", "#9a7545", "HORIZONTAL"),
  },
  {
    id: "floor_black_marble",
    name: "Black Marble Tiles",
    category: "FLOOR",
    thumbnailColor: "#1c1d21",
    roughness: 0.1,
    metalness: 0.15,
    clearcoat: 0.8,
    generateTexture: () => createMarbleTexture("#1a1a1e", "#e0e0e0", "#3a3a40"),
  },
  {
    id: "floor_white_marble",
    name: "White Carrara Marble",
    category: "FLOOR",
    thumbnailColor: "#e6e6e6",
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 0.9,
    generateTexture: () => createMarbleTexture("#f0f0f2", "#888890", "#c0c0c8"),
  },
  {
    id: "floor_concrete",
    name: "Polished Concrete",
    category: "FLOOR",
    thumbnailColor: "#7a7e85",
    roughness: 0.3,
    metalness: 0.1,
    generateTexture: () => createConcreteTexture("#7a7e85", "#5c6066"),
  },

  // 🗄️ WARDROBE & CABINET FINISHES
  {
    id: "wardrobe_matte_black",
    name: "Matte Slate Black",
    category: "WARDROBE",
    thumbnailColor: "#1a1a1c",
    roughness: 0.7,
    metalness: 0.1,
    generateTexture: () => createSolidGrainTexture("#1a1a1c", "#28282b"),
  },
  {
    id: "wardrobe_smoked_walnut",
    name: "Smoked Walnut",
    category: "WARDROBE",
    thumbnailColor: "#402e27",
    roughness: 0.45,
    metalness: 0.05,
    generateTexture: () => createPlankTexture("#402e27", "#271b17", "VERTICAL"),
  },
  {
    id: "wardrobe_white_lacquer",
    name: "Alpine White Lacquer",
    category: "WARDROBE",
    thumbnailColor: "#f4f4f6",
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.7,
    generateTexture: () => createSolidGrainTexture("#f4f4f6", "#e2e2e6"),
  },

  // 🚪 DOOR FINISHES
  {
    id: "door_natural_oak",
    name: "Natural Oak Door",
    category: "DOOR",
    thumbnailColor: "#b89058",
    roughness: 0.42,
    metalness: 0.02,
    generateTexture: () => createPlankTexture("#b89058", "#8e6b37", "VERTICAL"),
  },
  {
    id: "door_dark_walnut",
    name: "Dark Walnut Door",
    category: "DOOR",
    thumbnailColor: "#36241b",
    roughness: 0.38,
    metalness: 0.05,
    generateTexture: () => createPlankTexture("#36241b", "#21150f", "VERTICAL"),
  },
];

// Helper: Create Wooden Plank Texture
function createPlankTexture(baseHex: string, grainHex: string, dir: "HORIZONTAL" | "VERTICAL"): THREE.CanvasTexture {
  if (typeof window === "undefined") return new THREE.CanvasTexture(document.createElement("canvas"));

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Draw wood grain lines
  ctx.strokeStyle = grainHex;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.35;

  const numLines = 60;
  for (let i = 0; i < numLines; i++) {
    ctx.beginPath();
    if (dir === "HORIZONTAL") {
      const y = (i / numLines) * 512 + (Math.random() - 0.5) * 4;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + (Math.random() - 0.5) * 12, 340, y + (Math.random() - 0.5) * 12, 512, y);
    } else {
      const x = (i / numLines) * 512 + (Math.random() - 0.5) * 4;
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (Math.random() - 0.5) * 12, 170, x + (Math.random() - 0.5) * 12, 340, x, 512);
    }
    ctx.stroke();
  }

  // Draw plank seam dividers
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  if (dir === "HORIZONTAL") {
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Helper: Create Herringbone Parquet Texture
function createHerringboneTexture(baseHex: string, darkHex: string): THREE.CanvasTexture {
  if (typeof window === "undefined") return new THREE.CanvasTexture(document.createElement("canvas"));

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = darkHex;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;

  const size = 32;
  for (let x = -512; x < 1024; x += size * 2) {
    for (let y = -512; y < 1024; y += size * 2) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// Helper: Create Marble Texture
function createMarbleTexture(bgHex: string, veinHex: string, accentHex: string): THREE.CanvasTexture {
  if (typeof window === "undefined") return new THREE.CanvasTexture(document.createElement("canvas"));

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 512);

  // Draw organic marble veins
  ctx.strokeStyle = veinHex;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < 512) {
      x += (Math.random() - 0.5) * 40;
      y += Math.random() * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Draw tile grout grid
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i <= 512; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// Helper: Create Concrete Texture
function createConcreteTexture(baseHex: string, grainHex: string): THREE.CanvasTexture {
  if (typeof window === "undefined") return new THREE.CanvasTexture(document.createElement("canvas"));

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 25;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Helper: Create Solid Grain Texture
function createSolidGrainTexture(baseHex: string, grainHex: string): THREE.CanvasTexture {
  if (typeof window === "undefined") return new THREE.CanvasTexture(document.createElement("canvas"));

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = grainHex;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.25;

  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Procedural mesh category classifier to automatically identify surfaces in any GLTF model
 */
export function getMeshCategory(meshName: string): TextureCategory | "WALL" | "OTHER" {
  if (!meshName) return "OTHER";
  const name = meshName.toLowerCase();
  
  // Floor and ground classification
  if (name.includes("floor") || name.includes("ground") || meshName === "Cube.011") {
    return "FLOOR";
  }
  
  // Cabinetry, wardrobe, wood, cupboards
  if (
    name.includes("wardrobe") ||
    name.includes("cabinet") ||
    name.includes("cupboard") ||
    name.includes("closet") ||
    name.includes("wood") ||
    meshName === "Cube.008"
  ) {
    return "WARDROBE";
  }
  
  // Doors and trim
  if (name.includes("door") || name.includes("gate") || meshName === "Mesh.091") {
    return "DOOR";
  }
  
  // Walls and ceilings
  if (
    name.includes("wall") ||
    name.includes("ceiling") ||
    name.includes("roof") ||
    name.includes("toilet") ||
    ["left", "right", "back", "front"].includes(name)
  ) {
    return "WALL";
  }
  
  return "OTHER";
}

