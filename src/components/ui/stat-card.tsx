import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  variant?: "default" | "profit" | "loss" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  prefix = "",
  suffix = "",
  variant = "default",
  size = "md",
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getVariantColor = () => {
    if (variant === "profit") return "text-profit";
    if (variant === "loss") return "text-loss";
    if (variant === "neutral") return "text-muted-foreground";
    if (change !== undefined) {
      if (change > 0) return "text-profit";
      if (change < 0) return "text-loss";
    }
    return "text-foreground";
  };

  const getChangeColor = () => {
    if (change === undefined) return "";
    if (change > 0) return "text-profit";
    if (change < 0) return "text-loss";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("glass p-4 rounded-xl", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span
          className={cn(
            "font-mono font-bold tracking-tight",
            size === "sm" && "text-xl",
            size === "md" && "text-2xl",
            size === "lg" && "text-4xl",
            getVariantColor()
          )}
        >
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </span>
      </div>
      {(change !== undefined || changeLabel) && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs", getChangeColor())}>
          {getTrendIcon()}
          <span>
            {change !== undefined && `${change > 0 ? "+" : ""}${change}%`}
            {changeLabel && ` ${changeLabel}`}
          </span>
        </div>
      )}
    </div>
  );
}

interface StatRowProps {
  stats: StatCardProps[];
  className?: string;
}

export function StatRow({ stats, className }: StatRowProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
