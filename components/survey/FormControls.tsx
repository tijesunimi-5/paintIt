'use client';

import React from 'react';

interface FormControlsProps {
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  currentStep: number;
  totalSteps: number;
  isNextDisabled: boolean;
  isSubmitting: boolean;
}

export default function FormControls({
  onBack,
  onNext,
  onSubmit,
  currentStep,
  totalSteps,
  isNextDisabled,
  isSubmitting
}: FormControlsProps) {
  const isFinalStep = currentStep === totalSteps - 1;

  if (currentStep === -1) return null; // Protect container success views

  return (
    <div className="flex justify-between items-center pt-8 mt-6 border-t border-neutral-900/80">
      {/* Back Directional Pivot */}
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 0}
        className="text-xs font-mono text-neutral-500 hover:text-white disabled:opacity-0 transition-opacity focus:outline-none"
      >
        ← BACK
      </button>

      {/* Execution Progression Action Gate */}
      {isFinalStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-white text-black font-mono text-xs font-semibold px-6 py-3 rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-50 focus:outline-none shadow-lg shadow-white/5"
        >
          {isSubmitting ? 'TRANSMITTING...' : 'SUBMIT REVIEWS ✓'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="bg-neutral-900 text-white border border-neutral-800 font-mono text-xs px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-0 focus:outline-none"
        >
          NEXT STEP →
        </button>
      )}
    </div>
  );
}