"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SpeedGaugeProps {
  value: number;
  max?: number;
  label: string;
  unit: string;
  color?: "cyan" | "blue" | "green";
  isTesting?: boolean;
}

export function SpeedGauge({ 
  value, 
  max = 1000, 
  label, 
  unit, 
  color = "cyan",
  isTesting = false
}: SpeedGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const radius = 120;
  const circumference = 2 * Math.random() * Math.PI * radius; // Dummy, we use specific SVG math below
  const strokeDasharray = `${2 * Math.PI * radius}`;
  const percentage = (displayValue / max) * 100;
  // Map percentage (0-100) to a semi-circle angle offset
  const strokeDashoffset = ((100 - (percentage * 0.75)) / 100) * (2 * Math.PI * radius);

  const colors = {
    cyan: "text-neon-cyan stroke-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]",
    blue: "text-neon-blue stroke-neon-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]",
    green: "text-green-400 stroke-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-64 h-64">
        {/* Background Track */}
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="16"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={2 * Math.PI * radius * 0.25} // 75% of circle
            strokeLinecap="round"
          />
          {/* Active Progress */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="16"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: 2 * Math.PI * radius }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={colors[color]}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-8">
          <motion.div 
            className="text-5xl font-black text-white tracking-tighter"
            animate={{ scale: isTesting ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTesting ? Infinity : 0, duration: 0.5 }}
          >
            {Math.round(displayValue)}
          </motion.div>
          <div className="text-gray-400 text-sm font-medium uppercase tracking-widest">{unit}</div>
        </div>
      </div>
      
      <div className="mt-[-2rem] text-xl font-bold text-gray-300">{label}</div>
    </div>
  );
}
