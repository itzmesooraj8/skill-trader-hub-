import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LevelBadge({ 
  level, 
  showLabel = true, 
  size = "md",
  className 
}: LevelBadgeProps) {
  const getTier = (level: number) => {
    if (level <= 2) return { name: "Bronze", class: "level-bronze" };
    if (level <= 4) return { name: "Silver", class: "level-silver" };
    if (level <= 6) return { name: "Gold", class: "level-gold" };
    if (level <= 8) return { name: "Platinum", class: "level-platinum" };
    return { name: "Diamond", class: "level-diamond" };
  };

  const tier = getTier(level);

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-5 px-2 text-xs";
      case "md": return "h-6 px-3 text-sm";
      case "lg": return "h-8 px-4 text-base";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium text-white",
        tier.class,
        getSizeClasses(),
        className
      )}
    >
      <span className="font-mono font-bold">L{level}</span>
      {showLabel && <span className="opacity-90">{tier.name}</span>}
    </div>
  );
}

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  className?: string;
}

export function LevelProgress({
  currentLevel,
  currentXP,
  xpToNextLevel,
  className,
}: LevelProgressProps) {
  const progress = (currentXP / xpToNextLevel) * 100;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LevelBadge level={currentLevel} showLabel={false} size="sm" />
      <div className="flex-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Level {currentLevel}</span>
          <span>{currentXP}/{xpToNextLevel} XP</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground">→ L{currentLevel + 1}</span>
    </div>
  );
}

interface LockedFeatureProps {
  requiredLevel: number;
  currentLevel: number;
  featureName: string;
  className?: string;
}

export function LockedFeature({
  requiredLevel,
  currentLevel,
  featureName,
  className,
}: LockedFeatureProps) {
  const isLocked = currentLevel < requiredLevel;

  if (!isLocked) return null;

  return (
    <div className={cn("locked-overlay", className)}>
      <div className="text-center p-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{featureName}</p>
        <p className="text-xs text-muted-foreground">
          Reach Level {requiredLevel} to unlock
        </p>
        <LevelBadge level={requiredLevel} size="sm" className="mt-2" />
      </div>
    </div>
  );
}
