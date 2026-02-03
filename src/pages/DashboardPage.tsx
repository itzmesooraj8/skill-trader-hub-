import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { LevelBadge, LockedFeature } from "@/components/ui/level-badge";
import {
  generateEquityCurve,
  generateTradeHistory,
  generateBehavioralAnalytics,
} from "@/lib/mock-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  FlaskConical,
  ScanSearch,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Layers,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Premium stat card component
function StatCard({
  label,
  value,
  suffix = "",
  prefix = "",
  trend,
  variant = "default",
  icon: Icon
}: {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
  trend?: { value: number; label: string };
  variant?: "default" | "profit" | "loss" | "neutral";
  icon?: React.ElementType;
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "profit": return "text-profit glow-text-profit";
      case "loss": return "text-loss glow-text-loss";
      default: return "text-foreground";
    }
  };

  return (
    <div className="glass p-5 group hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-3xl font-bold tracking-tighter ${getVariantStyles()}`}>
          {prefix}{value}{suffix}
        </span>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend.value >= 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-profit" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-loss" />
          )}
          <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-profit' : 'text-loss'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// Dashboard card wrapper
function DashboardCard({
  title,
  subtitle,
  children,
  className = "",
  action,
  headerContent
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  headerContent?: React.ReactNode;
}) {
  return (
    <div className={`glass p-6 ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-display font-semibold text-base">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerContent}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [equityData, setEquityData] = useState<ReturnType<typeof generateEquityCurve>>([]);
  const [trades, setTrades] = useState<ReturnType<typeof generateTradeHistory>>([]);
  const [behavioralData, setBehavioralData] = useState<ReturnType<typeof generateBehavioralAnalytics>>([]);
  const [timeframe, setTimeframe] = useState<"1M" | "3M" | "6M" | "1Y">("3M");

  useEffect(() => {
    const days = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365 }[timeframe];
    setEquityData(generateEquityCurve(days, user?.capital || 10000));
    const tradeHistory = generateTradeHistory(50);
    setTrades(tradeHistory);
    setBehavioralData(generateBehavioralAnalytics(tradeHistory));
  }, [timeframe, user?.capital]);

  // Calculate stats from data
  const currentEquity = equityData[equityData.length - 1]?.equity || user?.capital || 10000;
  const startEquity = equityData[0]?.equity || user?.capital || 10000;
  const totalReturn = ((currentEquity - startEquity) / startEquity) * 100;
  const maxDrawdown = Math.max(...equityData.map(d => d.drawdown));
  const winningTrades = trades.filter(t => t.isProfit).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  // Mock activity feed
  const activityFeed = [
    { type: "alert", message: "RSI Overbought detected on TSLA", time: "2m ago", icon: AlertTriangle, severity: "warning" },
    { type: "trade", message: "EMA Crossover signal on AAPL", time: "15m ago", icon: TrendingUp, severity: "success" },
    { type: "alert", message: "NVDA approaching resistance", time: "1h ago", icon: Bell, severity: "info" },
    { type: "trade", message: "Stop loss triggered on GOOGL", time: "3h ago", icon: TrendingDown, severity: "error" },
  ];

  const timeframeOptions = ["1M", "3M", "6M", "1Y"] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="grid-overlay opacity-20" />
      </div>

      <AppNavbar />

      <main className="relative container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary md:hidden"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        {/* Welcome header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold">Welcome back, {user?.name || "Trader"}</h1>
              <LevelBadge level={user?.level || 3} size="lg" />
            </div>
            <p className="text-muted-foreground">
              Your trading cockpit • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Account Value</span>
              <span className="font-mono text-lg font-bold text-foreground">${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`text-xs font-medium ${totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Win Rate"
            value={winRate.toFixed(1)}
            suffix="%"
            variant={winRate >= 50 ? "profit" : "loss"}
            icon={Target}
            trend={{ value: 2.3, label: "vs last month" }}
          />
          <StatCard
            label="Total Return"
            value={totalReturn.toFixed(2)}
            suffix="%"
            prefix={totalReturn >= 0 ? "+" : ""}
            variant={totalReturn >= 0 ? "profit" : "loss"}
            icon={TrendingUp}
          />
          <StatCard
            label="Max Drawdown"
            value={maxDrawdown.toFixed(2)}
            suffix="%"
            prefix="-"
            variant="loss"
            icon={Activity}
          />
          <StatCard
            label="Active Strategies"
            value="3"
            variant="neutral"
            icon={Layers}
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Equity Curve - Takes 8 columns */}
          <DashboardCard
            title="Performance"
            subtitle="Equity curve with drawdown visualization"
            className="lg:col-span-8"
            headerContent={
              <div className="flex gap-1">
                {timeframeOptions.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${timeframe === tf
                      ? "bg-primary text-primary-foreground shadow-glow-sm"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    interval="preserveStartEnd"
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 8px 24px hsl(0 0% 0% / 0.4)",
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
                  />
                  <ReferenceLine
                    y={startEquity * 0.9}
                    stroke="hsl(var(--loss))"
                    strokeDasharray="5 5"
                    label={{ value: "10% DD Limit", fill: "hsl(var(--loss))", fontSize: 10, position: "right" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          {/* Activity Feed - Takes 4 columns */}
          <DashboardCard
            title="Live Feed"
            subtitle="Extension alerts & signals"
            className="lg:col-span-4"
            action={
              <span className="px-2 py-1 rounded-md bg-muted/50 text-2xs text-muted-foreground">Mock Data</span>
            }
          >
            <div className="space-y-3">
              {activityFeed.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card-elevated/50 hover:bg-card-hover transition-colors cursor-pointer group"
                >
                  <div className={`p-2 rounded-lg ${item.severity === "warning" ? "bg-warning/10 text-warning" :
                    item.severity === "success" ? "bg-profit/10 text-profit" :
                      item.severity === "error" ? "bg-loss/10 text-loss" :
                        "bg-primary/10 text-primary"
                    }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug group-hover:text-foreground transition-colors">{item.message}</p>
                    <p className="text-2xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Connect browser extension for live alerts</p>
            </div>
          </DashboardCard>

          {/* Behavioral Analytics */}
          <DashboardCard
            title="Behavioral Analytics"
            subtitle="Trading pattern insights"
            className="lg:col-span-4"
          >
            {behavioralData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={behavioralData.filter(d => d.tag)}
                        dataKey="count"
                        nameKey="tag"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        label={false}
                      >
                        {behavioralData.filter(d => d.tag).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isDestructive ? "hsl(var(--loss))" : "hsl(var(--profit))"}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {behavioralData
                    .filter(d => d.tag)
                    .slice(0, 4)
                    .map((item) => (
                      <div key={item.tag} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-card-hover transition-colors">
                        <span className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.isDestructive ? "bg-loss" : "bg-profit"}`} />
                          <span className="text-muted-foreground">{item.tag}</span>
                        </span>
                        <span className={`font-mono font-medium ${item.isDestructive ? "text-loss" : "text-profit"}`}>
                          ${item.totalPnl.toFixed(0)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Tag your trades to see insights</p>
                </div>
              </div>
            )}
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard
            title="Quick Actions"
            subtitle="Jump to key features"
            className="lg:col-span-8"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/lab">
                <div className="group p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <FlaskConical className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">Run New Backtest</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Test strategies in The Lab before risking capital
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Open Lab</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>

              <div className="relative">
                <Link to={user && user.level >= 3 ? "/scanner" : "#"}>
                  <div className={`group p-6 rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 ${user && user.level >= 3 ? "hover:border-accent/40 hover:shadow-glow-sm cursor-pointer" : "opacity-75"
                    } transition-all`}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                        <ScanSearch className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg group-hover:text-accent transition-colors">Scan Markets</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Find opportunities with advanced filters
                        </p>
                      </div>
                    </div>
                    {user && user.level >= 3 && (
                      <div className="flex items-center gap-1 mt-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">Open Scanner</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </Link>
                {user && user.level < 3 && (
                  <LockedFeature
                    requiredLevel={3}
                    currentLevel={user.level}
                    featureName="Market Scanner"
                  />
                )}
              </div>
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}
