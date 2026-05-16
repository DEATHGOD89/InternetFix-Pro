import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      success: "bg-green-500/10 text-green-400 border border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      danger: "bg-red-500/10 text-red-400 border border-red-500/20",
      info: "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20",
      default: "bg-white/5 text-gray-300 border border-white/10",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";
