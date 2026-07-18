// src/config/paints.ts

export interface RealPaint {
  id: string;
  brand?: "Dulux" | "Sherwin-Williams" | "Benjamin Moore" | "Caparol";
  name: string;
  code: string; // Hexadecimal color code
}

export const REAL_PAINTS_CATALOG: RealPaint[] = [
  {
    id: "p-dulux-01",
    brand: "Dulux",
    name: "Alabaster White",
    code: "#F2F1E9",
  },
  {
    id: "p-sw-02",
    brand: "Sherwin-Williams",
    name: "Desert Sand",
    code: "#C4B199",
  },
  {
    id: "p-bm-03",
    brand: "Benjamin Moore",
    name: "Soft Sage",
    code: "#9BA498",
  },
  { id: "p-dulux-04", brand: "Dulux", name: "Slate Grey", code: "#5C6B73" },
  {
    id: "p-sw-05",
    brand: "Sherwin-Williams",
    name: "Charcoal Black",
    code: "#37393D",
  },
  {
    id: "p-sw-06",
    brand: "Benjamin Moore",
    name: "Light Greige",
    code: "#DDD8D2",
  },
  {
    id: "p-sw-07",
    brand: "Benjamin Moore",
    name: "Deep Graphite",
    code: "#4A4F56",
  },
  {
    id: "p-sw-08",
    brand: "Benjamin Moore",
    name: "Satin Black",
    code: "#1C1C1C",
  },
  {
    id: "p-sw-09",
    brand: "Benjamin Moore",
    name: "Crisp White",
    code: "#FFFFFF",
  },
  {
    id: "p-sw-06",
    brand: "Benjamin Moore",
    name: "Sand Beige",
    code: "#D2B995",
  },
  {
    id: "p-sw-06",
    brand: "Benjamin Moore",
    name: "Walnut Brown",
    code: "#593C2A",
  },
];

// // Helper helper function to find metadata by hex color code
// export function findPaintMetadata(
//   hexCode: string,
//   customDecks: RealPaint[] = [],
// ): { name: string; brand: string } {
//   const normalizedHex = hexCode.toUpperCase().trim();

//   // Search custom painter decks first, then fallback to global commercial decks
//   const matchedPaint =
//     customDecks.find((p) => p.code.toUpperCase() === normalizedHex) ||
//     REAL_PAINTS_CATALOG.find((p) => p.code.toUpperCase() === normalizedHex);

//   return matchedPaint
//     ? { name: matchedPaint.name, brand: matchedPaint.brand }
//     : { name: "Custom Color Mix", brand: "Painter Palette" };
// }
