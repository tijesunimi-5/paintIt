// components/modals/ConfirmModal.tsx
"use client";

import React, { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isSuccessState?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isSuccessState = false,
}: ConfirmModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
      {/* Dark Mask Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        onClick={isSuccessState ? undefined : onClose}
      />

      {/* Sheet Frame Layer Container */}
      <div className={`relative w-full max-w-sm bg-neutral-950 border border-neutral-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-4 z-10 transform transition-transform duration-200 ease-out ${isOpen ? "translate-y-0 scale-100" : "translate-y-8 sm:translate-y-0 sm:scale-95"
        }`}>

        {/* Header Block / State Indicators */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold select-none ${isSuccessState ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
            }`}>
            {isSuccessState ? "✓" : "❓"}
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">
              {title}
            </h3>
            <p className="text-[11px] text-neutral-500 font-bold">Studio Engine</p>
          </div>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed font-medium pt-1">
          {message}
        </p>

        {/* Action Button Handles Group */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          {!isSuccessState && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-neutral-400"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            disabled={isSuccessState}
            onClick={onConfirm}
            className={`w-full sm:flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-black ${isSuccessState
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-400"
              }`}
          >
            {isSuccessState ? "Success" : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}