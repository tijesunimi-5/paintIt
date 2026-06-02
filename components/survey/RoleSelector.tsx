'use client';

import React from 'react';
import { UserRole } from '@/types/feedback';
import { motion } from 'framer-motion';

interface RoleSelectorProps {
  activeRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

interface RoleCard {
  value: UserRole;
  label: string;
  sub: string;
}

const roleOptions: RoleCard[] = [
  { value: 'painter', label: 'Professional Painter', sub: 'Contractors, commercial, and hostel finishes specialists.' },
  { value: 'designer', label: 'Interior Designer', sub: 'Spatial architects, decorators, and premium staging leads.' },
  { value: 'homeowner', label: 'Property / Homeowner', sub: 'Individuals looking to optimize personal living environments.' },
  { value: 'student_renter', label: 'Student / Lodge Renter', sub: 'Hostel occupants and short-term space customizers.' },
  { value: 'other', label: 'Other Specialist', sub: 'Realtors, developers, or curious spatial enthusiasts.' }
];

export default function RoleSelector({ activeRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      {roleOptions.map((role) => {
        const isSelected = activeRole === role.value;
        return (
          <motion.button
            key={role.value}
            type="button"
            onClick={() => onSelectRole(role.value)}
            whileTap={{ scale: 0.99 }}
            className={`w-full p-4 rounded-xl border text-left transition-all duration-300 focus:outline-none flex flex-col gap-1 ${isSelected
                ? 'bg-white border-white text-black shadow-xl shadow-white/5'
                : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/80'
              }`}
          >
            <span className="text-sm font-semibold tracking-tight">{role.label}</span>
            <span className={`text-xs font-light leading-relaxed ${isSelected ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {role.sub}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}