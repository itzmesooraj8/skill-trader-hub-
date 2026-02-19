import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Play, TrendingUp, TrendingDown, BarChart3, Zap, Activity, ChevronDown, Minus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { SAMPLE_TICKERS } from "@/lib/constants";

// Internal demo generator for landing page visualization
function runDemoBacktest(params: any) {
  return {
    params,
    results: {
      winRate: Number((45 + Math.random() * 25).toFixed(1)),
      totalReturn: Number((-20 + Math.random() * 80).toFixed(2)),
      maxDrawdown: Number((5 + Math.random() * 20).toFixed(2)),
      sharpeRatio: Number((-0.5 + Math.random() * 2.5).toFixed(2)),
      numTrades: Math.floor(50 + Math.random() * 150),
      profitFactor: Number((1 + Math.random()).toFixed(2)),
    }
  };
}

// Animated number counter
function CountUp({ end, duration = 2000, prefix = "", suffix = "" }: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={ref} className="font-mono font-black">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Floating particle system
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-px h-px bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated candlestick visualization
function CandlestickVisualization() {
  const [candles, setCandles] = useState<Array<{ open: number; close: number; high: number; low: number }>>([]);

  useEffect(() => {
    const generateCandles = () => {
      const newCandles = [];
      let price = 100;
      for (let i = 0; i < 20; i++) {
        const change = (Math.random() - 0.48) * 8;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 3;
        const low = Math.min(open, close) - Math.random() * 3;
        newCandles.push({ open, close, high, low });
        price = close;
      }
      setCandles(newCandles);
    };

    generateCandles();
    const interval = setInterval(generateCandles, 4000);
    return () => clearInterval(interval);
  }, []);

  const minPrice = Math.min(...candles.flatMap(c => [c.low])) - 5;
  const maxPrice = Math.max(...candles.flatMap(c => [c.high])) + 5;
  const range = maxPrice - minPrice;

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-1 p-8 opacity-20">
      {candles.map((candle, i) => {
        const bullish = candle.close > candle.open;
        const bodyTop = ((maxPrice - Math.max(candle.open, candle.close)) / range) * 100;
        const bodyHeight = (Math.abs(candle.close - candle.open) / range) * 100;
        const wickTop = ((maxPrice - candle.high) / range) * 100;
        const wickHeight = ((candle.high - candle.low) / range) * 100;

        return (
          <div
            key={i}
            className="relative flex-1 h-full transition-all duration-1000"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Wick */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-px ${bullish ? 'bg-profit' : 'bg-loss'}`}
              style={{
                top: `${wickTop}%`,
                height: `${wickHeight}%`,
              }}
            />
            {/* Body */}
            <div
              className={`absolute left-0 right-0 rounded-sm ${bullish ? 'bg-profit' : 'bg-loss'}`}
              style={{
                top: `${bodyTop}%`,
                height: `${Math.max(bodyHeight, 1)}%`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// Minimal stat card
function StatCard({ label, value, trend, trendValue }: {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-white/[0.02] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6 border-l border-white/10">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">{label}</p>
        <p className="font-mono text-3xl font-black text-white">{value}</p>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-profit' : trend === 'down' ? 'text-loss' : 'text-white/50'
            }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
              trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                <Minus className="h-3 w-3" />}
            <span className="font-mono text-xs">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [backtestResult, setBacktestResult] = useState<ReturnType<typeof runDemoBacktest> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll to top on mount
  // Scroll to top on mount and disable browser scroll restoration
  useEffect(() => {
    // Prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll to top
    window.scrollTo(0, 0);

    // Fallback for some browsers that might need a tick
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);

    return () => {
      // Optional: restore to auto if you want other pages to have normal behavior when navigating away
      // But for landing page refresh fix, leaving it manual is mostly fine or we can reset it.
      // Let's not reset it here to be safe about the "refresh" behavior. 
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDemoBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = runDemoBacktest({
        strategy: "EMA Crossover",
        ticker: selectedTicker,
        fastEMA: 20,
        slowEMA: 50,
        stopLoss: 2,
        takeProfit: 4,
      });
      setBacktestResult(result);
      setIsRunning(false);
    }, 1500);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleExploreDashboard = () => {
    login("demo@stratix.io");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic gradient that follows mouse */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.03) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(34,197,94,0.05) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(239,68,68,0.03) 0%, transparent 40%)
          `,
        }}
      />

      {/* Particle field */}
      <ParticleField />

      {/* Candlestick background */}
      <CandlestickVisualization />

      {/* Minimal top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                <span className="font-display font-black text-black text-sm">SX</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">Stratix</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleGetStarted}
                className="bg-white text-black hover:bg-white/90 font-semibold"
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full viewport */}
      <section className="min-h-screen flex flex-col justify-center relative pt-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Minimal badge */}
              <div className="inline-flex items-center gap-3 animate-fade-in">
                <div className="h-px w-8 bg-white/30" />
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">Skill-Based Trading</span>
              </div>

              {/* Main headline - Massive typography */}
              <div className="space-y-4">
                <h1 className="font-sans text-[clamp(3rem,9vw,7.5rem)] font-black leading-[0.9] tracking-tighter text-white animate-fade-in">
                  TRADE WITH
                </h1>
                <h1 className="font-sans text-[clamp(3rem,9vw,7.5rem)] font-black leading-[0.9] tracking-tighter text-white animate-fade-in" style={{ animationDelay: "0.15s" }}>
                  PRECISION
                </h1>
              </div>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-white/60 max-w-lg leading-relaxed font-normal animate-fade-in" style={{ animationDelay: "0.3s" }}>
                Build real edge with backtested strategies and behavioral analytics.
                Trade like an institution, not a gambler.
              </p>

              {/* CTA Buttons - Minimal */}
              <div className="flex items-center gap-6 pt-6 animate-fade-in" style={{ animationDelay: "0.45s" }}>
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-bold text-base px-8 h-14 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300"
                  onClick={handleGetStarted}
                >
                  Take Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <button
                  onClick={handleExploreDashboard}
                  className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                    <Play className="h-4 w-4 ml-0.5 fill-current" />
                  </div>
                  <span className="text-sm font-medium tracking-wide">Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Right: Live Demo Widget - Floating */}
            <div className="lg:col-span-5 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] blur-xl opacity-50" />

                <div className="relative glass-elevated p-8 border border-white/10 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white/70" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">Live Backtest</h3>
                        <p className="text-xs text-white/40">EMA Crossover Strategy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
                      <span className="text-xs text-white/40">Real-time</span>
                    </div>
                  </div>

                  {/* Ticker Selection - Minimal pills */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {SAMPLE_TICKERS.slice(0, 5).map((ticker) => (
                      <button
                        key={ticker.symbol}
                        onClick={() => {
                          setSelectedTicker(ticker.symbol);
                          setBacktestResult(null);
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all whitespace-nowrap ${selectedTicker === ticker.symbol
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        {ticker.symbol}
                      </button>
                    ))}
                  </div>

                  {/* Run Button */}
                  <Button
                    className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold rounded-xl mb-6"
                    onClick={handleDemoBacktest}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Run Backtest</span>
                      </div>
                    )}
                  </Button>

                  {/* Results - Minimal grid */}
                  {backtestResult && (
                    <div className="grid grid-cols-3 gap-4 animate-fade-in">
                      <div className="text-center p-4 rounded-xl bg-white/5">
                        <p className="text-2xl font-mono font-bold text-profit">
                          {backtestResult.results.winRate}%
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Win Rate</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-white/5">
                        <p className={`text-2xl font-mono font-bold ${backtestResult.results.totalReturn >= 0 ? "text-profit" : "text-loss"
                          }`}>
                          {backtestResult.results.totalReturn >= 0 ? "+" : ""}
                          {backtestResult.results.totalReturn}%
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Return</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-white/5">
                        <p className="text-2xl font-mono font-bold text-loss">
                          -{backtestResult.results.maxDrawdown}%
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Drawdown</p>
                      </div>
                    </div>
                  )}

                  {!backtestResult && !isRunning && (
                    <div className="h-24 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-white/10" />
                        <p className="text-xs text-white/30">Select ticker & run backtest</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 text-white/30" />
        </div>
      </section>

      {/* Stats Section - Horizontal strip */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            <StatCard label="Traders" value="2,400+" trend="up" trendValue="+18% this month" />
            <StatCard label="Win Rate" value="72%" trend="up" trendValue="+3.2% avg" />
            <StatCard label="Backtests" value="50K+" trend="up" trendValue="+2.4K today" />
            <StatCard label="Analyzed" value="$2.1M" trend="neutral" trendValue="5yr data" />
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
              Trade Smarter
            </h2>
            <p className="text-white/40 text-lg max-w-md mx-auto">
              Professional-grade tools for serious traders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Large feature card */}
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:border-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-profit/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-profit/10 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-profit" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">The Lab</h3>
                <p className="text-white/50 leading-relaxed mb-8 max-w-sm">
                  Backtest any strategy on years of historical data. Know your edge before risking capital.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="font-mono text-xl font-bold text-white">15+</p>
                    <p className="text-xs text-white/40 mt-1">Strategies</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="font-mono text-xl font-bold text-white">5yr</p>
                    <p className="text-xs text-white/40 mt-1">Data Range</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="font-mono text-xl font-bold text-white">&lt;2s</p>
                    <p className="text-xs text-white/40 mt-1">Results</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smaller feature cards */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Activity className="h-5 w-5 text-white/70" />
                </div>
                <h3 className="font-semibold text-white mb-2">Behavioral Analytics</h3>
                <p className="text-sm text-white/40">Track mistakes. Eliminate emotional trading patterns.</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5 text-white/70" />
                </div>
                <h3 className="font-semibold text-white mb-2">Market Scanner</h3>
                <p className="text-sm text-white/40">Find setups that match your strategy criteria.</p>
              </div>
            </div>

            {/* Full width card */}
            <div className="md:col-span-3 group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:border-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-profit/5 via-transparent to-loss/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-between flex-wrap gap-8">
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">Ready to build real skill?</h3>
                  <p className="text-white/40">Take the assessment and discover your trading level.</p>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-8"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                <span className="font-display font-black text-black text-xs">SX</span>
              </div>
              <span className="text-white/40 text-sm">© 2026 Stratix</span>
            </div>
            <p className="text-xs text-white/20 max-w-xs text-right">
              Educational platform for skill development. Not investment advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
