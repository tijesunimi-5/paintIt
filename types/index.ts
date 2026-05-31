export interface RoomColors {
  wallBack: string;
  wallLeft: string;
  wallRight: string;
  wallFront: string;
  floor: string;
  ceiling: string;
}

export interface PaintPreset {
  id: string;
  name: string;
  hex: string;
  collection: string;
  description: string;
}

export type SelectedSurface =
  | "wallBack"
  | "wallLeft"
  | "wallRight"
  | "wallFront"
  | "floor"
  | "ceiling";
