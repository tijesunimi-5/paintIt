'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastConfig, ConfirmationConfig } from '@/types/index';

interface AlertContextProps {
  showToast: (config: ToastConfig) => void;
  showConfirmation: (config: ConfirmationConfig) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  // Toast State Layer
  const [toast, setToast] = useState<ToastConfig | null>(null);

  // Confirmation Modal State Layer
  const [confirm, setConfirm] = useState<ConfirmationConfig | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Expose Toast Trigger
  const showToast = useCallback(({ message, severity, duration = 4000 }: ToastConfig) => {
    setToast({ message, severity, duration });
  }, []);

  // Expose Confirmation Trigger
  const showConfirmation = useCallback((config: ConfirmationConfig) => {
    setConfirm(config);
    setIsConfirmOpen(true);
  }, []);

  const handleConfirmAction = () => {
    if (confirm) confirm.onConfirm();
    setIsConfirmOpen(false);
  };

  const handleCancelAction = () => {
    if (confirm?.onCancel) confirm.onCancel();
    setIsConfirmOpen(false);
  };

  // Helper styles mapping for toast severity signals
  const severityStyles = {
    success: 'border-emerald-500/20 bg-emerald-950/90 text-emerald-400',
    error: 'border-red-500/20 bg-red-950/90 text-red-400',
    info: 'border-neutral-800 bg-neutral-900/95 text-neutral-200'
  };

  return (
    <AlertContext.Provider value={{ showToast, showConfirmation }}>
      {children}

      {/* 1. FANCY POP-UP TOAST FROM BOTTOM */}
      <AnimatePresence onExitComplete={() => setToast(null)}>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onAnimationComplete={() => {
              setTimeout(() => setToast(null), toast.duration);
            }}
            className={`fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 p-4 border rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 ${severityStyles[toast.severity]}`}
          >
            {/* Visual Micro-Indicator Dot */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${toast.severity === 'success' ? 'bg-emerald-400 animate-pulse' :
                toast.severity === 'error' ? 'bg-red-400 animate-pulse' : 'bg-neutral-400'
              }`} />
            <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HIGH-ATTENTION CONFIRMATION MODAL OVERLAY */}
      <AnimatePresence>
        {isConfirmOpen && confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Blurred Backdrop Filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelAction}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-sm border border-neutral-800 bg-neutral-900 rounded-2xl p-6 shadow-2xl text-left overflow-hidden"
            >
              {/* Premium Top Line Accent */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-transparent to-transparent" />

              <h3 className="text-base font-bold text-neutral-100 tracking-tight">{confirm.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">{confirm.message}</p>

              {/* High Touch Ergonomics Action Controls Layout */}
              <div className="mt-6 flex flex-row items-center justify-end gap-3">
                <button
                  onClick={handleCancelAction}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 border border-neutral-800 bg-neutral-950/40 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  {confirm.cancelLabel || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-neutral-50 hover:bg-neutral-200 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  {confirm.confirmLabel || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within an AlertProvider configuration wrapper');
  return context;
}