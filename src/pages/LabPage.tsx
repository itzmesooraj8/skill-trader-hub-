import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SAMPLE_TICKERS,
  generateMockNews,
  runMockBacktest,
} from "@/lib/mock-data";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Save,
  Share2,
  ChevronDown,
  ChevronUp,
  Newspaper,
  ArrowUp,
  ArrowDown,
  Clock,
  Settings2,
  BarChart3,
  Zap,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

// Custom Candlestick shape for Recharts
const CandlestickShape = (props: {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: {
    open: number;
    close: number;
    high: number;
    low: number;
  };
}) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const isBullish = payload.close > payload.open;
  const color = isBullish ? "hsl(152, 75%, 50%)" : "hsl(0, 85%, 55%)";

  const candleWidth = Math.max(width * 0.6, 4);
  const wickWidth = 1;

  const openY = y + height * (1 - (payload.open - payload.low) / (payload.high - payload.low));
  const closeY = y + height * (1 - (payload.close - payload.low) / (payload.high - payload.low));
  const highY = y;
  const lowY = y + height;

  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.abs(closeY - openY) || 1;

  return (
    <g>
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
      <rect
        x={x + (width - candleWidth) / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

// Panel component
function Panel({
  title,
  icon: Icon,
  children,
  className = "",
  headerAction
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) {
  return (
    <div className={`glass ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {headerAction}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Stat pill component
function StatPill({ label, value, variant = "default" }: {
  label: string;
  value: string | number;
  variant?: "default" | "profit" | "loss"
}) {
  const variantStyles = {
    default: "text-foreground",
    profit: "text-profit glow-text-profit",
    loss: "text-loss glow-text-loss"
  };

  return (
    <div className="glass p-4 text-center">
      <p className="text-2xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${variantStyles[variant]}`}>{value}</p>
    </div>
  );
}

export default function LabPage() {
  const { user } = useAuth();
  const [selectedStrategy, setSelectedStrategy] = useState("ema-crossover");
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [params, setParams] = useState({
    fastEMA: 20,
    slowEMA: 50,
    stopLoss: 2,
    takeProfit: 4,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof runMockBacktest> | null>(null);
  const [newsOpen, setNewsOpen] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1D" | "1W" | "1M" | "1Y" | "5Y">("1Y");

  const news = generateMockNews(selectedTicker);
  const journalTags = ["FOMO", "Revenge Trade", "Fat Finger", "Followed Plan", "Overconfidence"];

  const handleRunBacktest = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const backtestResult = runMockBacktest({
        strategy: selectedStrategy,
        ticker: selectedTicker,
        ...params,
      });
      setResult(backtestResult);
      setIsRunning(false);
    }, 2000);
  }, [selectedStrategy, selectedTicker, params]);

  const getFilteredData = () => {
    if (!result) return [];
    const days = { "1D": 1, "1W": 7, "1M": 30, "1Y": 365, "5Y": 1825 }[selectedTimeframe];
    return result.ohlcData.slice(-days);
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
        <div className="grid-overlay opacity-15" />
      </div>

      <AppNavbar />

      <main className="relative container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">The Lab</h1>
            <p className="text-sm text-muted-foreground">Backtest strategies before risking real capital</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Save className="h-4 w-4" />
              Save Strategy
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          {/* Left Sidebar - Strategy Controls */}
          <div className="lg:col-span-3 space-y-4">
            <Panel title="Strategy" icon={Zap}>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="bg-card-elevated border-border/50">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ema-crossover">EMA Crossover</SelectItem>
                  <SelectItem value="rsi-reversion">RSI Mean Reversion</SelectItem>
                  <SelectItem value="bollinger-bands">Bollinger Bands</SelectItem>
                </SelectContent>
              </Select>
            </Panel>

            <Panel title="Asset" icon={BarChart3}>
              <Select value={selectedTicker} onValueChange={setSelectedTicker}>
                <SelectTrigger className="bg-card-elevated border-border/50">
                  <SelectValue placeholder="Select ticker" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_TICKERS.map((ticker) => (
                    <SelectItem key={ticker.symbol} value={ticker.symbol}>
                      <span className="font-mono">{ticker.symbol}</span>
                      <span className="text-muted-foreground ml-2">- {ticker.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Panel>

            <Panel title="Parameters" icon={Settings2}>
              <div className="space-y-5">
                {[
                  { label: "Fast EMA", value: params.fastEMA, key: "fastEMA", min: 5, max: 50, step: 1 },
                  { label: "Slow EMA", value: params.slowEMA, key: "slowEMA", min: 20, max: 200, step: 5 },
                  { label: "Stop Loss", value: params.stopLoss, key: "stopLoss", min: 1, max: 10, step: 0.5, suffix: "%" },
                  { label: "Take Profit", value: params.takeProfit, key: "takeProfit", min: 2, max: 20, step: 0.5, suffix: "%" },
                ].map((param) => (
                  <div key={param.key}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{param.label}</span>
                      <span className="font-mono font-medium text-primary">
                        {param.value}{param.suffix || ""}
                      </span>
                    </div>
                    <Slider
                      value={[param.value]}
                      onValueChange={([v]) => setParams((p) => ({ ...p, [param.key]: v }))}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-glow-sm"
                    />
                  </div>
                ))}
              </div>
            </Panel>

            <Button
              className="w-full h-12 text-base font-semibold btn-glow"
              onClick={handleRunBacktest}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Run Backtest
                </>
              )}
            </Button>
          </div>

          {/* Center - Chart & Results */}
          <div className="lg:col-span-6 space-y-4">
            {/* Chart Panel */}
            <Panel
              title={selectedTicker}
              icon={BarChart3}
              className="h-fit"
              headerAction={
                <div className="flex items-center gap-2">
                  {result && (
                    <Badge variant="secondary" className="font-mono text-2xs bg-primary/10 text-primary border-primary/20">
                      {result.signals.length} signals
                    </Badge>
                  )}
                  <div className="flex gap-0.5 ml-2">
                    {(["1D", "1W", "1M", "1Y", "5Y"] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-2 py-1 rounded text-2xs font-medium transition-all ${selectedTimeframe === tf
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              }
            >
              <div className="h-80">
                {result ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        interval="preserveStartEnd"
                        axisLine={{ stroke: "hsl(var(--border))" }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "0 8px 24px hsl(0 0% 0% / 0.4)",
                        }}
                        formatter={(value: number, name: string) => [
                          `$${value.toFixed(2)}`,
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                      />
                      <Bar
                        dataKey="high"
                        shape={<CandlestickShape />}
                        isAnimationActive={false}
                      />
                      {result.signals.slice(0, 10).map((signal, i) => (
                        <ReferenceLine
                          key={i}
                          x={signal.date}
                          stroke={signal.type === "buy" ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                          strokeDasharray="3 3"
                          strokeOpacity={0.6}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">Run a backtest to see chart data</p>
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            {/* Results Stats */}
            {result && (
              <div className="grid grid-cols-5 gap-2">
                <StatPill
                  label="Win Rate"
                  value={`${result.results.winRate}%`}
                  variant={result.results.winRate >= 50 ? "profit" : "loss"}
                />
                <StatPill
                  label="Return"
                  value={`${result.results.totalReturn >= 0 ? "+" : ""}${result.results.totalReturn}%`}
                  variant={result.results.totalReturn >= 0 ? "profit" : "loss"}
                />
                <StatPill
                  label="Drawdown"
                  value={`-${result.results.maxDrawdown}%`}
                  variant="loss"
                />
                <StatPill
                  label="Sharpe"
                  value={result.results.sharpeRatio}
                />
                <StatPill
                  label="Trades"
                  value={result.results.numTrades}
                />
              </div>
            )}

            {/* Trade History */}
            {result && (
              <Panel title="Trade History" icon={Clock}>
                <div className="max-h-64 overflow-y-auto scrollbar-hide">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>P/L</th>
                        <th>Duration</th>
                        <th>Journal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.tradeHistory.slice(0, 15).map((trade) => (
                        <tr key={trade.id}>
                          <td className="text-2xs text-muted-foreground">{trade.entryDate}</td>
                          <td>${trade.entryPrice}</td>
                          <td>${trade.exitPrice}</td>
                          <td className={trade.isProfit ? "text-profit" : "text-loss"}>
                            <span className="flex items-center gap-1">
                              {trade.isProfit ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                              {trade.pnlPercent > 0 ? "+" : ""}{trade.pnlPercent}%
                            </span>
                          </td>
                          <td className="text-muted-foreground">{trade.duration}d</td>
                          <td>
                            <Select defaultValue={trade.journalTag || ""}>
                              <SelectTrigger className="h-7 text-2xs w-24 bg-transparent border-border/30">
                                <SelectValue placeholder="Tag..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {journalTags.map((tag) => (
                                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}
          </div>

          {/* Right Sidebar - News */}
          <div className="lg:col-span-3 space-y-4">
            <Collapsible open={newsOpen} onOpenChange={setNewsOpen}>
              <Panel
                title="Market Context"
                icon={Newspaper}
                headerAction={
                  <CollapsibleTrigger asChild>
                    <button className="p-1 hover:bg-muted/50 rounded transition-colors">
                      {newsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </CollapsibleTrigger>
                }
              >
                <CollapsibleContent>
                  <div className="space-y-3">
                    {news.map((item, i) => (
                      <div key={i} className="group p-3 rounded-lg bg-card-elevated/50 hover:bg-card-hover transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm leading-snug group-hover:text-primary transition-colors">{item.title}</p>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-2xs text-muted-foreground">{item.source}</span>
                          <span className="text-2xs text-muted-foreground">•</span>
                          <span className="text-2xs text-muted-foreground">{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Panel>
            </Collapsible>

            {/* Quick Tips */}
            <Panel title="Pro Tips" icon={Zap}>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• Button-triggered backtests prevent server overload</p>
                <p>• Tag trades to build behavioral insights</p>
                <p>• Check news for context before deployment</p>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}
