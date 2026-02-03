import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LevelProgress } from "@/components/ui/level-badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FlaskConical,
  ScanSearch,
  Layers,
  Puzzle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/dashboard", label: "Cockpit", icon: LayoutDashboard },
  { path: "/lab", label: "The Lab", icon: FlaskConical },
  { path: "/scanner", label: "Scanner", icon: ScanSearch, minLevel: 3 },
  { path: "/strategies", label: "Strategies", icon: Layers },
  { path: "/extension", label: "Extension", icon: Puzzle },
];

export function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-premium">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
              <span className="font-display font-bold text-primary-foreground text-sm">ST</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block">Skill Trader Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isLocked = item.minLevel && user && user.level < item.minLevel;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={isLocked ? "#" : item.path}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20" />
                  )}
                  <item.icon className={cn("h-4 w-4 relative z-10", isActive && "text-primary")} />
                  <span className="relative z-10">{item.label}</span>
                  {isLocked && (
                    <span className="relative z-10 text-2xs bg-muted/80 px-1.5 py-0.5 rounded font-mono">
                      L{item.minLevel}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - Level progress & user */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="glass px-3 py-2 flex items-center gap-3">
                <LevelProgress
                  currentLevel={user.level}
                  currentXP={user.xp}
                  xpToNextLevel={user.xpToNextLevel}
                  className="w-40"
                />
              </div>
            )}
            <div className="flex items-center gap-1">
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-muted/50 hover:text-loss">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            {user && (
              <div className="px-2 pb-4">
                <div className="glass p-3">
                  <LevelProgress
                    currentLevel={user.level}
                    currentXP={user.xp}
                    xpToNextLevel={user.xpToNextLevel}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              {navItems.map((item) => {
                const isLocked = item.minLevel && user && user.level < item.minLevel;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={isLocked ? "#" : item.path}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                      isLocked && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </div>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="text-2xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          L{item.minLevel}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </div>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border/50 mt-4 flex gap-2 px-2">
                <Link to="/settings" className="flex-1">
                  <Button variant="outline" className="w-full border-border/50" onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button variant="outline" onClick={logout} className="border-border/50 hover:bg-loss/10 hover:text-loss hover:border-loss/30">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
