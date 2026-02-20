import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { LevelBadge, LockedFeature } from "@/components/ui/level-badge";
import { Badge } from "@/components/ui/badge";

import { tradingAPI } from "@/lib/api/trading";
import { marketAPI } from "@/lib/api/market";
import { useQuery } from "@tanstack/react-query";
import {
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
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Layers,
  ChevronRight,
  ArrowLeft,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

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

import { PageLayout } from "@/components/layout/PageLayout";

// ... existing StatCard and DashboardCard components ...

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // ... hooks ...
  const [timeframe, setTimeframe] = useState("1M"); // Default to 1 month
  const timeframeOptions = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

  // Fetch real data
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => tradingAPI.getAnalytics(),
    staleTime: 1000 * 60, // 1 minute
  });

  const { data: equityData = [] } = useQuery({
    queryKey: ['equity-curve', timeframe],
    queryFn: () => tradingAPI.getEquityCurve(undefined, undefined), // Timeframe filtering handles by backend logic in real app
    staleTime: 1000 * 60 * 5,
  });

  const { data: behavioralData = [] } = useQuery({
    queryKey: ['behavioral-analytics'],
    queryFn: () => tradingAPI.getBehavioralAnalytics(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: trades = [] } = useQuery({
    queryKey: ['recent-trades'],
    queryFn: () => tradingAPI.getTrades({ limit: 5 }),
    staleTime: 1000 * 30,
  });

  // Calculate derived metrics
  const currentEquity = equityData.length > 0 ? equityData[equityData.length - 1].equity : (user?.capital || 10000);
  const startEquity = equityData.length > 0 ? equityData[0].equity : (user?.capital || 10000);
  // Total return based on fetched data or fallback
  const totalReturn = analytics?.totalPnlPercent || 0;
  const winRate = analytics?.winRate || 0;
  const maxDrawdown = 0; // Backend analytics update pending for global maxDD, using safe default

  // Map trades to activity feed
  const activityFeed = trades.slice(0, 4).map(trade => ({
    icon: trade.pnl > 0 ? TrendingUp : TrendingDown,
    message: `${trade.side === 'buy' ? 'Bought' : 'Sold'} ${trade.symbol} ${trade.pnl > 0 ? 'for profit' : 'at loss'}`,
    time: new Date(trade.exitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity: trade.pnl > 0 ? "success" : "warning", // simple mapping
  }));

  return (
    <PageLayout showBackButton={false}>
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
          {/* Account Value moved to Header for quick glance, but main details in Portfolio Section */}
          <div className="glass px-4 py-2 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Account Value</span>
            <span className="font-mono text-lg font-bold text-foreground">${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`text-xs font-medium ${totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* PORTFOLIO SECTION */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold">Portfolio Overview</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Win Rate"
            value={winRate.toFixed(1)}
            suffix="%"
            variant={winRate >= 50 ? "profit" : "loss"}
            icon={Target}
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
            value="0"
            variant="neutral"
            icon={Layers}
          />
        </div>

        {/* Equity Curve */}
        <div className="grid lg:grid-cols-12 gap-6">
          <DashboardCard
            title="Performance"
            subtitle="Equity curve with drawdown visualization"
            className="lg:col-span-12"
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
        </div>
      </section>

      {/* STRATEGY SECTION */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <Layers className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-display text-xl font-bold">Active Strategies</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Active Strategies */}


          <div
            className="glass flex flex-col items-center justify-center text-center p-6 border-dashed border-2 border-border/50 hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => navigate('/lab')}
          >
            <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-3">
              <FlaskConical className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="font-medium mb-1 group-hover:text-primary transition-colors">Deploy New Strategy</p>
            <p className="text-xs text-muted-foreground">Launch from The Lab</p>
          </div>
        </div>
      </section>

      {/* ANALYTICS & FEED */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Behavioral Analytics */}
        <DashboardCard
          title="Behavioral Analytics"
          subtitle="Trading pattern insights"
          className="lg:col-span-6"
        >
          {Array.isArray(behavioralData) && behavioralData.length > 0 ? (
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

        {/* Live Feed */}
        <DashboardCard
          title="Live Feed"
          subtitle="Extension alerts & signals"
          className="lg:col-span-6"
        >
          <div className="space-y-3">
            {activityFeed.length > 0 ? (
              activityFeed.map((item, i) => (
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
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Trades will appear here</p>
              </div>

            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <Link to="/history">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
                View Full History <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </DashboardCard>
      </div >
    </PageLayout >
  );
}
