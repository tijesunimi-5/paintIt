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
    id: "p-sw-10",
    brand: "Benjamin Moore",
    name: "Sand Beige",
    code: "#D2B995",
  },
  {
    id: "p-sw-11",
    brand: "Benjamin Moore",
    name: "Walnut Brown",
    code: "#593C2A",
  },
  {
    id: "p-sw-12",
    brand: "Benjamin Moore",
    name: "Light Ash Grey",
    code: "#D9DCDA",
  },
  {
    id: "p-sw-13",
    brand: "Benjamin Moore",
    name: "Midnight Blue",
    code: "#253447",
  },
  {
    id: "p-sw-14",
    brand: "Benjamin Moore",
    name: "Pearl White",
    code: "#F3F1E9",
  },
  {
    id: "p-sw-15",
    brand: "Benjamin Moore",
    name: "Deep Olive Green",
    code: "#3F4A38",
  },
  {
    id: "p-sw-16",
    brand: "Benjamin Moore",
    name: "Soft Greige",
    code: "#D8D0C4",
  },
  {
    id: "p-sw-17",
    brand: "Benjamin Moore",
    name: "Espresso Brown",
    code: "#4A3028",
  },
  {
    id: "p-sw-18",
    brand: "Benjamin Moore",
    name: "Warm Ivory",
    code: "#F5F0E8",
  },
  {
    id: "p-sw-06",
    brand: "Benjamin Moore",
    name: "Deep Charcoal Grey",
    code: "#3483C",
  },
];

