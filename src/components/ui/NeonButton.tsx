"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface NeonButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "cyan" | "blue" | "ghost";
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "cyan", size = "md", children, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-bold overflow-hidden rounded-md transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";
    
    const variants = {
      cyan: "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan/20 focus:ring-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.8)]",
      blue: "bg-neon-blue/10 text-neon-blue border border-neon-blue hover:bg-neon-blue/20 focus:ring-neon-blue shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)]",
      ghost: "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {variant !== "ghost" && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
        )}
      </motion.button>
    );
  }
);
NeonButton.displayName = "NeonButton";
