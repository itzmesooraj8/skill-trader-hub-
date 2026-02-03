import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CURATED_STRATEGIES } from "@/lib/mock-data";
import {
  TrendingUp,
  Copy,
  Eye,
  BadgeCheck,
  Sparkles,
  ArrowUpRight,
  Zap,
  Shield,
  Target,
  ArrowLeft,
} from "lucide-react";

// Strategy card component
function StrategyCard({
  strategy,
  isCloned,
  onClone,
  onViewDetails
}: {
  strategy: typeof CURATED_STRATEGIES[0];
  isCloned: boolean;
  onClone: () => void;
  onViewDetails: () => void;
}) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-profit bg-profit/10 border-profit/20";
      case "Medium": return "text-warning bg-warning/10 border-warning/20";
      case "High": return "text-loss bg-loss/10 border-loss/20";
      default: return "text-muted-foreground";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "Low": return Shield;
      case "Medium": return Zap;
      case "High": return Target;
      default: return Shield;
    }
  };

  const RiskIcon = getRiskIcon(strategy.risk);

  return (
    <div className="glass-interactive p-6 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {strategy.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-2xs">
              {strategy.assetClass}
            </Badge>
            <div className={`flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md border ${getRiskColor(strategy.risk)}`}>
              <RiskIcon className="h-3 w-3" />
              {strategy.risk}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-2xs text-primary">
          <BadgeCheck className="h-4 w-4" />
          Verified
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{strategy.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="text-center p-3 rounded-lg bg-card-elevated border border-border/30">
          <p className="text-xl font-bold font-mono text-profit glow-text-profit">{strategy.winRate}%</p>
          <p className="text-2xs text-muted-foreground mt-0.5">Win Rate</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-card-elevated border border-border/30">
          <p className="text-xl font-bold font-mono text-profit">+{strategy.returnRate}%</p>
          <p className="text-2xs text-muted-foreground mt-0.5">Return</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-card-elevated border border-border/30">
          <p className="text-xl font-bold font-mono text-loss">-{strategy.maxDrawdown}%</p>
          <p className="text-2xs text-muted-foreground mt-0.5">Drawdown</p>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-card-elevated/50 border border-border/30">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">ST</span>
        </div>
        <div>
          <p className="text-sm font-medium">Skill Trader Hub Team</p>
          <p className="text-2xs text-muted-foreground">Official Strategy</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-border/50 hover:border-primary/30"
          onClick={onViewDetails}
        >
          <Eye className="mr-2 h-4 w-4" />
          Details
        </Button>
        <Button
          className="flex-1"
          onClick={onClone}
          disabled={isCloned}
        >
          {isCloned ? (
            <>
              <BadgeCheck className="mr-2 h-4 w-4" />
              Cloned
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Clone
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function StrategiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStrategy, setSelectedStrategy] = useState<typeof CURATED_STRATEGIES[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [clonedStrategies, setClonedStrategies] = useState<string[]>([]);

  const handleClone = (strategyId: string) => {
    setClonedStrategies((prev) => [...prev, strategyId]);
  };

  const handleViewDetails = (strategy: typeof CURATED_STRATEGIES[0]) => {
    setSelectedStrategy(strategy);
    setShowDetails(true);
  };

  const handleUseInLab = (strategy: typeof CURATED_STRATEGIES[0]) => {
    const params = new URLSearchParams({
      fastEMA: strategy.params.fastEMA.toString(),
      slowEMA: strategy.params.slowEMA.toString(),
      stopLoss: strategy.params.stopLoss.toString(),
      takeProfit: strategy.params.takeProfit.toString(),
    });
    navigate(`/lab?${params.toString()}`);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-profit";
      case "Medium": return "text-warning";
      case "High": return "text-loss";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
        <div className="grid-overlay opacity-15" />
      </div>

      <AppNavbar />

      <main className="relative container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Skill Trader Hub Strategies</h1>
            <p className="text-muted-foreground">
              Battle-tested strategies built by our team. Clone and customize in The Lab.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">User submissions coming in v2.0</span>
          </div>
        </div>

        {/* Strategy Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURATED_STRATEGIES.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isCloned={clonedStrategies.includes(strategy.id)}
              onClone={() => handleClone(strategy.id)}
              onViewDetails={() => handleViewDetails(strategy)}
            />
          ))}
        </div>

        {/* Submit Strategy Coming Soon */}
        <div className="mt-12 glass-elevated p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Submit Your Strategy</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Reach Level 9 to submit your own strategies for community review.
            Top strategies get featured and you earn rewards.
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-1">Coming in v2.0</Badge>
        </div>
      </main>

      {/* Strategy Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl glass-elevated border-border/50">
          {selectedStrategy && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selectedStrategy.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{selectedStrategy.assetClass}</Badge>
                  <span className={`font-medium ${getRiskColor(selectedStrategy.risk)}`}>
                    {selectedStrategy.risk} Risk
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <p className="text-muted-foreground">{selectedStrategy.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Win Rate", value: `${selectedStrategy.winRate}%`, color: "text-profit" },
                    { label: "Return", value: `+${selectedStrategy.returnRate}%`, color: "text-profit" },
                    { label: "Drawdown", value: `-${selectedStrategy.maxDrawdown}%`, color: "text-loss" },
                    { label: "Return/DD", value: (selectedStrategy.returnRate / selectedStrategy.maxDrawdown).toFixed(1), color: "" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-card-elevated border border-border/30">
                      <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Parameters */}
                <div>
                  <h4 className="font-display font-semibold mb-3">Parameters</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Fast EMA", value: selectedStrategy.params.fastEMA },
                      { label: "Slow EMA", value: selectedStrategy.params.slowEMA },
                      { label: "Stop Loss", value: `${selectedStrategy.params.stopLoss}%` },
                      { label: "Take Profit", value: `${selectedStrategy.params.takeProfit}%` },
                    ].map((param) => (
                      <div key={param.label} className="flex justify-between p-3 rounded-lg bg-card-elevated border border-border/30">
                        <span className="text-muted-foreground">{param.label}</span>
                        <span className="font-mono text-primary">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why It Works */}
                <div>
                  <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Why This Works
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedStrategy.whyItWorks}</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetails(false)} className="border-border/50">
                  Close
                </Button>
                <Button onClick={() => {
                  handleUseInLab(selectedStrategy);
                  setShowDetails(false);
                }} className="btn-glow">
                  Open in Lab
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
