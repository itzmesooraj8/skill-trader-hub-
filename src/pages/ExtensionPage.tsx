import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  Chrome,
  Key,
  Copy,
  RefreshCw,
  Bell,
  Zap,
  Check,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

export default function ExtensionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [apiKey] = useState("sx_demo_xxxx_xxxx_xxxx_xxxx");
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 py-8">
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
              <Chrome className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Browser Extension</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Connect the Stratix browser extension to receive real-time alerts,
              auto-execute strategies, and sync your trades across platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Install & Status */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <GlassCardHeader>
                  <GlassCardTitle>Installation</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                    <Chrome className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Stratix for Chrome</p>
                      <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                    </div>
                    <Button onClick={handleInstallClick}>
                      Install
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Also available for Firefox, Edge, and Brave
                  </p>
                </GlassCardContent>
              </GlassCard>

              <GlassCard className="p-6">
                <GlassCardHeader>
                  <GlassCardTitle>Connection Status</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-loss/10 border border-loss/20">
                    <div className="h-3 w-3 rounded-full bg-loss animate-pulse" />
                    <div className="flex-1">
                      <p className="font-medium text-loss">Not Connected</p>
                      <p className="text-sm text-muted-foreground">
                        Install the extension and enter your API key to connect
                      </p>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* What it looks like when connected (preview) */}
              <GlassCard className="p-6 opacity-60">
                <GlassCardHeader>
                  <GlassCardTitle>When Connected</GlassCardTitle>
                  <Badge variant="secondary">Preview</Badge>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-profit/10 border border-profit/20">
                    <div className="h-3 w-3 rounded-full bg-profit" />
                    <div className="flex-1">
                      <p className="font-medium text-profit">Connected</p>
                      <p className="text-sm text-muted-foreground">
                        Real-time sync active • Last ping 2s ago
                      </p>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Right - API Key & Settings */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use this key to authenticate the extension with your Stratix account.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={apiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyKey}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Key
                  </Button>
                </GlassCardContent>
              </GlassCard>

              <GlassCard className="p-6">
                <GlassCardHeader>
                  <GlassCardTitle>Sync Settings</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Get alerts for signals</p>
                      </div>
                    </div>
                    <Switch disabled />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Auto-Execute</p>
                        <p className="text-sm text-muted-foreground">Auto place trades</p>
                      </div>
                    </div>
                    <Switch disabled />
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Connect extension to enable these features
                  </p>
                </GlassCardContent>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <div className="space-y-4">
                  <h3 className="font-semibold">Extension Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2 justify-center">
                      <Check className="h-4 w-4 text-profit" />
                      Real-time chart pattern detection
                    </li>
                    <li className="flex items-center gap-2 justify-center">
                      <Check className="h-4 w-4 text-profit" />
                      Auto-sync trades to journal
                    </li>
                    <li className="flex items-center gap-2 justify-center">
                      <Check className="h-4 w-4 text-profit" />
                      One-click strategy deployment
                    </li>
                    <li className="flex items-center gap-2 justify-center">
                      <Check className="h-4 w-4 text-profit" />
                      Works with TradingView & more
                    </li>
                  </ul>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coming Soon!</DialogTitle>
            <DialogDescription>
              The Stratix browser extension is currently in development.
              We're building something amazing!
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Chrome className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Join our waitlist to be notified when the extension launches.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowComingSoon(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
