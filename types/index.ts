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

export type UserRole = 'PAINTER' | 'DESIGNER' | 'CONSUMER' | 'ARCHITECT' | 'ADMIN';

export interface UserSessionData {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  is_verified?: boolean;
  created_at?: string;
  _id?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  full_name?: string;
}

export interface UserProfileMetadata {
  bio: string | null;
  phoneNumber: string | null;
  location: string;
  experienceYears: number;
  skills: string[];
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string;
  images: string[];
  colors_used: string[];
  created_at: string;
}

// ✅ EXPLICIT TYPE FOR STEPONBOARDING
export interface OnboardingStep {
  id: number;
  label: string;
  description: string;
}

export interface ToastConfig {
  message: string;
  severity: 'success' | 'error' | 'info';
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