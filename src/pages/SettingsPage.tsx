import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LevelBadge, LevelProgress } from "@/components/ui/level-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Check,
  Crown,
  Sparkles,
  Settings2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

// Settings panel component
function SettingsPanel({
  title,
  icon: Icon,
  children,
  danger = false
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`glass ${danger ? 'border-loss/20' : ''}`}>
      <div className={`flex items-center gap-2 px-6 py-4 border-b ${danger ? 'border-loss/20' : 'border-border/50'}`}>
        <Icon className={`h-4 w-4 ${danger ? 'text-loss' : 'text-muted-foreground'}`} />
        <span className={`font-display font-medium ${danger ? 'text-loss' : ''}`}>{title}</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const [capital, setCapital] = useState(user?.capital?.toString() || "10000");

  const handleCapitalUpdate = () => {
    updateUser({ capital: parseFloat(capital) || 10000 });
  };

  const tiers = [
    {
      name: "Free",
      subtitle: "Student",
      price: "$0",
      period: "/forever",
      features: [
        "10 daily scans",
        "3 saved strategies",
        "Basic backtesting",
        "Trade journal",
      ],
      current: user?.tier === "free",
    },
    {
      name: "Pro",
      subtitle: "Trader",
      price: "$29",
      period: "/month",
      features: [
        "Unlimited scans",
        "Unlimited strategies",
        "Advanced filters",
        "Real-time alerts",
        "Priority support",
      ],
      current: user?.tier === "pro",
      recommended: true,
    },
    {
      name: "Elite",
      subtitle: "Invite Only",
      price: "Apply",
      period: "",
      features: [
        "Everything in Pro",
        "Funded Trader Challenge",
        "1-on-1 mentorship",
        "Private Discord",
        "Early feature access",
      ],
      current: user?.tier === "elite",
      locked: (user?.level || 1) < 9,
      requiredLevel: 9,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
        <div className="grid-overlay opacity-15" />
      </div>

      <AppNavbar />

      <main className="relative container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Section */}
            <SettingsPanel title="Profile" icon={User}>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-glow-sm">
                  <span className="text-3xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "D"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold">{user?.name || "Demo Trader"}</h3>
                  <p className="text-muted-foreground">{user?.email || "demo@stratix.io"}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <LevelBadge level={user?.level || 3} />
                    <Badge variant="secondary" className="capitalize">{user?.tier || "free"} Plan</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <LevelProgress
                  currentLevel={user?.level || 3}
                  currentXP={user?.xp || 450}
                  xpToNextLevel={user?.xpToNextLevel || 1000}
                />
              </div>
            </SettingsPanel>

            {/* Trading Settings */}
            <SettingsPanel title="Trading Settings" icon={Settings2}>
              <div>
                <label className="text-sm font-medium mb-3 block">Trading Capital</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={capital}
                      onChange={(e) => setCapital(e.target.value)}
                      className="pl-8 font-mono bg-card-elevated border-border/50"
                    />
                  </div>
                  <Button onClick={handleCapitalUpdate}>Update</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Used for position sizing calculations and dashboard stats
                </p>
              </div>
            </SettingsPanel>

            {/* Notifications */}
            <SettingsPanel title="Notifications" icon={Bell}>
              <div className="space-y-1">
                {[
                  { title: "Email Notifications", desc: "Weekly performance reports", defaultChecked: true },
                  { title: "Strategy Alerts", desc: "Get notified when signals trigger", defaultChecked: false },
                  { title: "New Features", desc: "Updates and new feature announcements", defaultChecked: true },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between py-4 border-b border-border/30 last:border-0">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </div>
            </SettingsPanel>

            {/* Subscription */}
            <SettingsPanel title="Subscription" icon={CreditCard}>
              <div className="flex items-center justify-between p-5 rounded-xl bg-card-elevated border border-border/30">
                <div>
                  <p className="font-display font-semibold capitalize">{user?.tier || "free"} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.tier === "free" ? "Upgrade to unlock all features" : "Active subscription"}
                  </p>
                </div>
                <Button onClick={() => setShowPricing(true)}>
                  {user?.tier === "free" ? "Upgrade" : "Manage"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </SettingsPanel>

            {/* Danger Zone */}
            <SettingsPanel title="Danger Zone" icon={Shield} danger>
              <Button
                variant="outline"
                className="text-loss border-loss/30 hover:bg-loss/10 hover:border-loss/50"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </SettingsPanel>
          </div>
        </div>
      </main>

      {/* Pricing Dialog */}
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-4xl glass-elevated border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Choose Your Plan</DialogTitle>
            <DialogDescription>
              Unlock your full trading potential
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6 py-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-6 rounded-xl border transition-all ${tier.recommended
                  ? "border-primary/50 bg-primary/5 shadow-glow-sm"
                  : tier.locked
                    ? "border-border/50 opacity-60"
                    : "border-border/50 bg-card-elevated"
                  }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary shadow-glow-sm">Recommended</Badge>
                  </div>
                )}
                {tier.locked && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary">Level {tier.requiredLevel}+ Required</Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-muted/50 mb-4">
                    {tier.name === "Elite" ? (
                      <Crown className="h-7 w-7 text-level-gold" />
                    ) : tier.name === "Pro" ? (
                      <Sparkles className="h-7 w-7 text-primary" />
                    ) : (
                      <User className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.subtitle}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold font-mono">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="p-0.5 rounded-full bg-profit/20">
                        <Check className="h-3 w-3 text-profit" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${tier.recommended ? 'btn-glow' : ''}`}
                  variant={tier.current ? "secondary" : tier.recommended ? "default" : "outline"}
                  disabled={tier.current || tier.locked}
                >
                  {tier.current ? "Current Plan" : tier.locked ? "Locked" : "Select"}
                </Button>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> Stratix is an educational platform for skill development.
              The "Funded Trader Challenge" is a simulation that may lead to funding consideration.
              This is not an employment offer or investment opportunity.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPricing(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
