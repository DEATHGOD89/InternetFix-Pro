"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  hoverEffect?: boolean;
  children?: ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverEffect = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-panel rounded-xl overflow-hidden relative group",
          hoverEffect && "hover:border-white/20 transition-colors duration-300",
          className
        )}
        {...props}
      >
        {hoverEffect && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
