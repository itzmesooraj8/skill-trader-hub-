import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LockedFeature, LevelBadge } from "@/components/ui/level-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { marketAPI } from "@/lib/api/market";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Lock,
  ArrowUpDown,
  FlaskConical,
  SlidersHorizontal,
  BarChart3,
  Filter,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface FilterState {
  sector: string;
  minPrice: number;
  maxPrice: number;
  minMarketCap: number;
}

// Panel component
function Panel({
  title,
  icon: Icon,
  children,
  className = ""
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function ScannerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [assetClass, setAssetClass] = useState<"all" | "stocks" | "crypto" | "forex">("all");
  const [filters, setFilters] = useState<FilterState>({
    sector: "",
    minPrice: 0,
    maxPrice: 200000,
    minMarketCap: 0,
  });
  const [sortField, setSortField] = useState<"symbol" | "price" | "change" | "volume" | "rvol">("change");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: results = [] } = useQuery({
    queryKey: ['scanner'],
    queryFn: () => marketAPI.getScanner(),
    refetchInterval: 30000,
  });

  const filteredResults = results.filter((stock) => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = !filters.sector || filters.sector === "all" || stock.sector === filters.sector;
    const matchesPrice = stock.price >= filters.minPrice && stock.price <= filters.maxPrice;
    // Market cap filter (input in Billions, data in raw units? Assuming raw. 0 if unknown)
    // If backend returns 0, we might want to show it regardless unless strict
    const matchesCap = !filters.minMarketCap || (stock.marketCap || 0) >= filters.minMarketCap * 1e9;

    return matchesSearch && matchesSector && matchesPrice && matchesCap;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;
    return typeof aVal === "string"
      ? aVal.localeCompare(bVal as string) * modifier
      : ((aVal as number) - (bVal as number)) * modifier;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleOpenInLab = (symbol: string) => {
    navigate(`/lab?ticker=${symbol}`);
  };

  const lockedFilters = [
    { name: "RSI Divergence", level: 5, description: "Detect bullish/bearish RSI divergence patterns" },
    { name: "Relative Volume (RVOL)", level: 7, description: "Stocks trading 3x+ their average volume - often signals big moves" },
    { name: "Volatility Regime", level: 9, description: "Identify low/high volatility environments for optimal strategy selection" },
  ];

  const currentLevel = user?.level || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/3 via-transparent to-primary/3" />
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Market Scanner</h1>
            <p className="text-sm text-muted-foreground">Find opportunities with powerful filters</p>
          </div>
          <Badge variant="secondary" className="font-mono">
            {sortedResults.length} results
          </Badge>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search */}
            <div className="glass p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card-elevated border-border/50"
                />
              </div>
            </div>

            {/* Asset Class */}
            <Panel title="Asset Class" icon={BarChart3}>
              <div className="flex flex-wrap gap-2">
                {(["all", "stocks", "crypto", "forex"] as const).map((ac) => (
                  <button
                    key={ac}
                    onClick={() => setAssetClass(ac)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${assetClass === ac
                      ? "bg-primary text-primary-foreground shadow-glow-sm"
                      : "bg-card-elevated hover:bg-card-hover text-muted-foreground border border-border/50"
                      }`}
                  >
                    {ac.charAt(0).toUpperCase() + ac.slice(1)}
                  </button>
                ))}
              </div>
            </Panel>

            {/* Filters */}
            <Panel title="Filters" icon={SlidersHorizontal}>
              <div className="space-y-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Sector</label>
                  <Select value={filters.sector} onValueChange={(v) => setFilters((f) => ({ ...f, sector: v }))}>
                    <SelectTrigger className="bg-card-elevated border-border/50">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Consumer Cyclical">Consumer Cyclical</SelectItem>
                      <SelectItem value="Automotive">Automotive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Price Range</span>
                    <span className="font-mono text-primary">${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) => setFilters((f) => ({ ...f, minPrice: min, maxPrice: max }))}
                    min={0}
                    max={200000}
                    step={100}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Min Market Cap</span>
                    <span className="font-mono text-primary">${filters.minMarketCap}B+</span>
                  </div>
                  <Slider
                    value={[filters.minMarketCap]}
                    onValueChange={([v]) => setFilters((f) => ({ ...f, minMarketCap: v }))}
                    min={0}
                    max={2000}
                    step={50}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                </div>
              </div>
            </Panel>

            {/* Advanced Filters */}
            <Panel title="Advanced Filters" icon={Filter}>
              <div className="space-y-2">
                {lockedFilters.map((filter) => {
                  const isLocked = currentLevel < filter.level;
                  return (
                    <Tooltip key={filter.name}>
                      <TooltipTrigger asChild>
                        <div
                          className={`group flex items-center justify-between p-3 rounded-lg transition-all ${isLocked
                            ? "bg-card-elevated/50 cursor-not-allowed"
                            : "bg-card-elevated hover:bg-card-hover cursor-pointer border border-transparent hover:border-primary/20"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                            <span className={`text-sm ${isLocked ? "text-muted-foreground" : ""}`}>{filter.name}</span>
                          </div>
                          <LevelBadge level={filter.level} showLabel={false} size="sm" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm">{filter.description}</p>
                        {isLocked && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reach Level {filter.level} to unlock
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* Results Table */}
          <div className="lg:col-span-9">
            <div className="glass overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => handleSort("symbol")}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Ticker
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th>Name</th>
                      <th>
                        <button
                          onClick={() => handleSort("price")}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Price
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("change")}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Change
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("volume")}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Volume
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort("rvol")}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          RVOL
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th>Sector</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((stock) => (
                      <tr key={stock.symbol} className="group">
                        <td className="font-medium">{stock.symbol}</td>
                        <td className="text-muted-foreground">{stock.name}</td>
                        <td>${stock.price.toFixed(2)}</td>
                        <td className={stock.change >= 0 ? "text-profit" : "text-loss"}>
                          <span className="flex items-center gap-1">
                            {stock.change >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            {stock.change >= 0 ? "+" : ""}{stock.change}%
                          </span>
                        </td>
                        <td className="text-muted-foreground">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </td>
                        <td className={`${stock.rvol >= 2 ? "text-warning" : stock.rvol >= 1.5 ? "text-profit" : "text-muted-foreground"}`}>
                          {stock.rvol.toFixed(1)}x
                        </td>
                        <td>
                          <Badge variant="outline" className="text-2xs">
                            {stock.sector}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenInLab(stock.symbol)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FlaskConical className="h-4 w-4 mr-1" />
                            Lab
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
