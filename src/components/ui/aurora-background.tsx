import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  sentiment?: "bullish" | "bearish" | "neutral";
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
}

export function AuroraBackground({
  children,
  className,
  sentiment = "bullish",
  intensity = "medium",
  animated = true,
}: AuroraBackgroundProps) {
  const [currentSentiment, setCurrentSentiment] = useState(sentiment);

  // Simulate market sentiment changes for demo
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      // Random sentiment shift for visual effect
      const random = Math.random();
      if (random > 0.7) {
        setCurrentSentiment(random > 0.85 ? "bearish" : "bullish");
      }
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [animated]);

  // Override with prop changes
  useEffect(() => {
    setCurrentSentiment(sentiment);
  }, [sentiment]);

  const getOpacity = () => {
    switch (intensity) {
      case "low": return "opacity-30";
      case "medium": return "opacity-50";
      case "high": return "opacity-70";
    }
  };

  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Base dark background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Aurora mesh gradient layer */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-[3000ms]",
          currentSentiment === "bullish" && "mesh-gradient",
          currentSentiment === "bearish" && "mesh-gradient-bearish",
          currentSentiment === "neutral" && "opacity-20 mesh-gradient",
          getOpacity()
        )}
      />

      {/* Noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface AuroraOrbProps {
  className?: string;
  color?: "green" | "teal" | "cyan" | "red" | "orange";
  size?: "sm" | "md" | "lg" | "xl";
  blur?: "sm" | "md" | "lg";
}

export function AuroraOrb({
  className,
  color = "teal",
  size = "md",
  blur = "md",
}: AuroraOrbProps) {
  const getColorClass = () => {
    switch (color) {
      case "green": return "bg-aurora-green";
      case "teal": return "bg-aurora-teal";
      case "cyan": return "bg-aurora-cyan";
      case "red": return "bg-aurora-red";
      case "orange": return "bg-aurora-orange";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm": return "w-32 h-32";
      case "md": return "w-64 h-64";
      case "lg": return "w-96 h-96";
      case "xl": return "w-[500px] h-[500px]";
    }
  };

  const getBlurClass = () => {
    switch (blur) {
      case "sm": return "blur-2xl";
      case "md": return "blur-3xl";
      case "lg": return "blur-[100px]";
    }
  };

  return (
    <div
      className={cn(
        "absolute rounded-full opacity-30 animate-float",
        getColorClass(),
        getSizeClass(),
        getBlurClass(),
        className
      )}
    />
  );
}
