// components/ui/StepOnboarding.tsx
"use client";

import React from 'react';
import { OnboardingStep } from '@/types/index';

interface StepOnboardingProps {
  title: string;
  subtitle: string;
  steps: OnboardingStep[];
  ctaText: string;
  onCtaClick: () => void;
  estimatedMinutes?: number;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({
  title,
  subtitle,
  steps,
  ctaText,
  onCtaClick,
  estimatedMinutes = 3,
}) => {
  return (
    <div className="w-full max-w-sm mx-auto p-5 bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-xl text-white text-left relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-transparent to-transparent" />

      <div className="text-center mb-5">
        <h3 className="text-base font-black tracking-tight text-emerald-400">{title}</h3>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed px-1">{subtitle}</p>
      </div>

      {/* Simplified, Clean Milestone Layout */}
      <div className="space-y-2.5 mb-5">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-3 p-3 bg-neutral-950 border border-neutral-800/30 rounded-xl"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold shrink-0">
              {step.id}
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-200 tracking-wide">{step.label}</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onCtaClick}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.99] shadow-md shadow-emerald-500/5"
      >
        {ctaText}
      </button>

      <div className="text-center mt-3">
        <span className="text-[9px] text-neutral-600 font-bold tracking-widest uppercase">
          Setup time: ~{estimatedMinutes} mins
        </span>
      </div>
    </div>
  );
};