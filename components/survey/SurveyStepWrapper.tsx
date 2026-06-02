'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SurveyStepWrapperProps {
  children: React.ReactNode;
  stepKey: string | number;
}

export default function SurveyStepWrapper({ children, stepKey }: SurveyStepWrapperProps) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.2 }}
      className="w-full space-y-6"
    >
      {children}
    </motion.div>
  );
}