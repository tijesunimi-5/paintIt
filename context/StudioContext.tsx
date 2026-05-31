'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RoomColors, SelectedSurface } from '../types/index';

interface StudioContextProps {
  roomColors: RoomColors;
  setSurfaceColor: (surface: SelectedSurface, color: string) => void;
  activeSurface: SelectedSurface;
  setActiveSurface: (surface: SelectedSurface) => void;
  isDemoActive: boolean;
  setIsDemoActive: (active: boolean) => void;
}

// Inside src/context/StudioContext.tsx
const defaultColors: RoomColors = {
  wallBack: '#F2EFE9',  // Alabaster White (Clean & Bright)
  wallLeft: '#9BA498',  // Eucalyptus Sage Green (The gorgeous accent corner wall!)
  wallRight: '#F2EFE9', // Alabaster White
  wallFront: '#F2EFE9',
  floor: '#1C1A17',     // Dark Smoked Wood Floor
  ceiling: '#F9F9FB',   // Premium Ceiling Finish
};

const StudioContext = createContext<StudioContextProps | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [roomColors, setRoomColors] = useState<RoomColors>(defaultColors);
  const [activeSurface, setActiveSurface] = useState<SelectedSurface>('wallBack');
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  const setSurfaceColor = (surface: SelectedSurface, color: string) => {
    setRoomColors((prev) => ({ ...prev, [surface]: color }));
  };

  return (
    <StudioContext.Provider value={{ roomColors, setSurfaceColor, activeSurface, setActiveSurface, isDemoActive, setIsDemoActive }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error('useStudio must be used within StudioProvider');
  return context;
}