"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

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
  max = 100, 
  label, 
  unit, 
  color = "cyan",
  isTesting = false
}: SpeedGaugeProps) {
  // Dynamically scale max if value exceeds it (e.g., jump to 200, 500, 1000)
  const currentMax = Math.max(max, Math.ceil(value / 50) * 50);

  // Framer Motion values for buttery smooth 60fps animations
  const rawValue = useMotionValue(0);
  const smoothValue = useSpring(rawValue, {
    damping: 30,
    stiffness: 150,
    mass: 0.8
  });

  useEffect(() => {
    // Whenever the React state updates, feed it into the motion value
    rawValue.set(value);
  }, [value, rawValue]);

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  // We want the gauge to span 270 degrees (75% of the circle)
  const arcLength = circumference * 0.75;
  
  // Map smoothValue (0 -> currentMax) to strokeDashoffset (circumference -> circumference - arcLength)
  const strokeDashoffset = useTransform(
    smoothValue, 
    [0, currentMax], 
    [circumference, circumference - arcLength],
    { clamp: true }
  );

  // Map smoothValue to Needle Rotation (-135deg to +135deg)
  const needleRotation = useTransform(
    smoothValue, 
    [0, currentMax], 
    [-135, 135],
    { clamp: true }
  );

  const numRef = useRef<HTMLDivElement>(null);

  // Directly mutate the DOM node for the number counter (bypasses React render cycle for performance)
  useEffect(() => {
    const unsubscribe = smoothValue.on("change", (latest) => {
      if (numRef.current) {
        numRef.current.textContent = latest.toFixed(1);
      }
    });
    return () => unsubscribe();
  }, [smoothValue]);

  const colors = {
    cyan: {
        stroke: "stroke-cyan-400 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]",
        needle: "fill-cyan-400"
    },
    blue: {
        stroke: "stroke-blue-500 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]",
        needle: "fill-blue-500"
    },
    green: {
        stroke: "stroke-green-400 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]",
        needle: "fill-green-400"
    }
  };

  const theme = colors[color];

  return (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-out ${isTesting ? "opacity-100 scale-105" : "opacity-75 scale-100 grayscale-[20%]"}`}>
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* Glow behind the gauge when active */}
        {isTesting && (
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${theme.stroke.split(' ')[0].replace('stroke', 'bg')}`}></div>
        )}

        {/* SVG Container */}
        <svg className="absolute w-full h-full transform -rotate-135" viewBox="0 0 260 260">
          {/* Background Track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25} // Hides 25% to make a 270deg arc
            strokeLinecap="round"
          />
          {/* Active Animated Progress Ring */}
          <motion.circle
            cx="130"
            cy="130"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="16"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className={theme.stroke}
          />
        </svg>

        {/* Needle */}
        <motion.div 
            className="absolute w-full h-full pointer-events-none origin-center z-10"
            style={{ rotate: needleRotation }}
        >
            <svg viewBox="0 0 260 260" className="w-full h-full">
                <polygon points="126,130 134,130 130,30" className={theme.needle} />
                <circle cx="130" cy="130" r="8" className={theme.needle} />
            </svg>
        </motion.div>

        {/* Center Text Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pb-4">
          <div className={`text-5xl font-black tracking-tighter ${theme.stroke.split(' ')[1]}`} ref={numRef}>
            0.0
          </div>
          <div className="text-gray-400 text-sm font-medium uppercase tracking-widest mt-1">{unit}</div>
        </div>
      </div>
      
      <div className="mt-[-1rem] text-xl font-bold text-gray-200 uppercase tracking-widest">{label}</div>
    </div>
  );
}
