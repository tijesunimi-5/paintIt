export type PaintFinishId = "EMULSION" | "SATIN" | "GLOSS";

export interface MaterialProperties {
  roughness: number; // Micro-surface smoothness (0 = glass, 1 = chalk)
  metalness: number; // Always near 0 for organic wall paint
  clearcoat?: number; // Secondary reflective lacquer layer (for Gloss)
  clearcoatRoughness?: number; // Sharpness of the top reflection
  bumpScale: number; // Intensity of wall texture/imperfections
  envMapIntensity: number; // Reaction to surrounding room HDRI/light probes
}

export interface PaintFinishPreset {
  id: PaintFinishId;
  label: string;
  subtitle: string;
  badge: string;
  materialProps: MaterialProperties;
}

export const PAINT_FINISH_PRESETS: Record<PaintFinishId, PaintFinishPreset> = {
  EMULSION: {
    id: "EMULSION",
    label: "Emulsion",
    subtitle: "Matte finish • Hides flaws • Soft light scattering",
    badge: "Default",
    materialProps: {
      roughness: 0.95,
      metalness: 0.0,
      clearcoat: 0.0,
      bumpScale: 0.015, // Subtle roller texture visible only under direct light
      envMapIntensity: 0.2, // Very low environmental reflections
    },
  },
  SATIN: {
    id: "SATIN",
    label: "Satin",
    subtitle: "Silky sheen • Durable • Gentle corner highlights",
    badge: "Popular",
    materialProps: {
      roughness: 0.45,
      metalness: 0.01,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      bumpScale: 0.025, // Medium sheen starts to highlight plaster bumps
      envMapIntensity: 0.6, // Soft window and light reflection
    },
  },
  GLOSS: {
    id: "GLOSS",
    label: "Gloss",
    subtitle: "High shine • Reflective • Reveals surface texture",
    badge: "Accent",
    materialProps: {
      roughness: 0.12,
      metalness: 0.02,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
      bumpScale: 0.045, // Highlights EVERY bump & roller dent under grazing angles
      envMapIntensity: 1.2, // Strong mirror-like room reflections
    },
  },
};
