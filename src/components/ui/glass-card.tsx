import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "solid";
  glow?: "none" | "primary" | "profit" | "loss";
  hover?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ 
  children, 
  className, 
  variant = "default",
  glow = "none",
  hover = false,
  style 
}: GlassCardProps) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 transition-all duration-300",
        variant === "default" && "glass",
        variant === "subtle" && "glass-subtle",
        variant === "solid" && "bg-card border border-border",
        glow === "primary" && "glow-primary",
        glow === "profit" && "glow-profit",
        glow === "loss" && "glow-loss",
        hover && "hover:border-primary/30 hover:bg-card/80 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface GlassCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

interface GlassCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardTitle({ children, className }: GlassCardTitleProps) {
  return (
    <h3 className={cn("text-sm font-medium text-muted-foreground uppercase tracking-wider", className)}>
      {children}
    </h3>
  );
}

interface GlassCardContentProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardContent({ children, className }: GlassCardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
