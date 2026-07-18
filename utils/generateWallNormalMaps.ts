import * as THREE from "three";

export function generateWallNormalMap(
  width = 512,
  height = 512,
): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.CanvasTexture(document.createElement("canvas"));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 35;
    data[i] = Math.min(255, Math.max(0, 128 + grain));
    data[i + 1] = Math.min(255, Math.max(0, 128 + grain));
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(128, 128); // 🎯 Increased repeat for realistic micro-fine paint stipple and to resolve corner stretching

  return texture;
}
