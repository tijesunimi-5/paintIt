export interface RoomColors {
  wallBack: string;
  wallLeft: string;
  wallRight: string;
  wallFront: string;
  floor: string;
  ceiling: string;
}

export type SelectedSurface =
  | "wallBack"
  | "wallLeft"
  | "wallRight"
  | "wallFront"
  | "floor"
  | "ceiling";

export type PaintValue = string | { top: string; bottom: string };

export interface PaintPreset {
  id: string;
  name: string;
  type: "flat" | "split";
  hex?: string; // Optional for flat styles
  colors?: { top: string; bottom: string }; // Optional for double split styles
  collection: string;
  description: string;
}

export type AlertSeverity = "success" | "error" | "info";

export interface ToastConfig {
  message: string;
  severity: AlertSeverity;
  duration?: number;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}