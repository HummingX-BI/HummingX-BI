import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ProgressRing({
  progress = 0,
  size = 180,
  strokeWidth = 10,
  children,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress)) / 100;

  return (
    <div
      className={`px-progress-ring-container ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
        />
        {/* Indicator */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--px-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: shouldReduceMotion
              ? circumference * (1 - clampedProgress)
              : circumference * (1 - clampedProgress)
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
        />
      </svg>
      {/* Centered content */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
}
