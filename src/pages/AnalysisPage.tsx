import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { marketAPI } from "@/lib/api/market";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Activity, BarChart3, AlertTriangle, ShieldCheck, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { PageLayout } from "@/components/layout/PageLayout";

export default function AnalysisPage() {
    const [symbol, setSymbol] = useState("BTC/USDT");
    const [searchInput, setSearchInput] = useState("BTC/USDT");

    const { data: analysis, isLoading, error } = useQuery({
        queryKey: ['institutional-analysis', symbol],
        queryFn: () => marketAPI.getInstitutionalAnalysis(symbol),
        refetchInterval: 30000, // Refresh every 30s
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput) setSymbol(searchInput.toUpperCase());
    };

    if (error) {
        return (
            <div className="container mx-auto p-6 text-center">
                <div className="p-12 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-destructive mb-2">Analysis Failed</h2>
                    <p className="text-muted-foreground">Could not generate institutional report for {symbol}.</p>
                </div>
            </div>
        );
    }

    return (
        <PageLayout>
            {/* Header */}
            <div className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Institutional Analysis
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Multi-factor regime detection & probabilistic scenario modeling
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Enter Ticker (e.g. BTC/USDT, AAPL)"
                                className="w-64 bg-background/50"
                            />
                            <Button type="submit" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 space-y-8">
                {isLoading ? (
                    <AnalysisSkeleton />
                ) : (
                    <>
                        {/* Top Level Verdict */}
                        <div className="glass-elevated p-6 border-l-4 border-l-primary flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">AI Verdict</h3>
                                <p className="text-xl text-primary font-medium mt-1">
                                    {analysis?.verdict || "Analyzing market structure..."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Regime Analysis */}
                            <Card className="glass h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-accent" />
                                        Market Regime
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Trend</p>
                                            <p className={`font-bold font-mono text-lg ${analysis?.regime_analysis?.trend?.includes('Bull') ? 'text-profit' : 'text-loss'}`}>
                                                {analysis?.regime_analysis?.trend}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Volatility</p>
                                            <p className="font-bold font-mono text-lg text-warning">
                                                {analysis?.regime_analysis?.volatility}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Liquidity Status</span>
                                            <span className="font-medium">{analysis?.regime_analysis?.liquidity}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">SMA 50 Distance</span>
                                            <span className="font-mono">{analysis?.regime_analysis?.metrics?.sma_50_dist_pct?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">ATR Ratio</span>
                                            <span className="font-mono">{analysis?.regime_analysis?.metrics?.atr_ratio?.toFixed(2)}x</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Probabilistic Scenarios */}
                            <Card className="glass lg:col-span-2 h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-profit" />
                                        Probabilistic Scenarios (30-Day)
                                    </CardTitle>
                                    <CardDescription>Monte Carlo Simulation (1000 Iterations)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {/* Bear Case */}
                                        <div className="p-4 rounded-xl bg-loss/5 border border-loss/20 relative overflow-hidden group hover:bg-loss/10 transition-colors">
                                            <div className="absolute top-0 right-0 p-2 opacity-50">
                                                <TrendingUp className="h-12 w-12 text-loss rotate-180" />
                                            </div>
                                            <p className="text-sm font-bold text-loss mb-1">Bear Case</p>
                                            <p className="text-2xl font-black font-mono tracking-tight text-foreground">
                                                ${analysis?.institutional_scenarios?.bear_case?.target?.toLocaleString()}
                                            </p>
                                            <Badge variant="outline" className="mt-2 border-loss/30 text-loss">
                                                Prob: {analysis?.institutional_scenarios?.bear_case?.probability}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                                {analysis?.institutional_scenarios?.bear_case?.logic}
                                            </p>
                                        </div>

                                        {/* Base Case */}
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden group hover:bg-primary/10 transition-colors">
                                            <p className="text-sm font-bold text-primary mb-1">Base Case</p>
                                            <p className="text-3xl font-black font-mono tracking-tight text-foreground">
                                                ${analysis?.institutional_scenarios?.base_case?.target?.toLocaleString()}
                                            </p>
                                            <Badge variant="outline" className="mt-2 border-primary/30 text-primary">
                                                Prob: {analysis?.institutional_scenarios?.base_case?.probability}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                                {analysis?.institutional_scenarios?.base_case?.logic}
                                            </p>
                                        </div>

                                        {/* Bull Case */}
                                        <div className="p-4 rounded-xl bg-profit/5 border border-profit/20 relative overflow-hidden group hover:bg-profit/10 transition-colors">
                                            <div className="absolute top-0 right-0 p-2 opacity-50">
                                                <TrendingUp className="h-12 w-12 text-profit" />
                                            </div>
                                            <p className="text-sm font-bold text-profit mb-1">Bull Case</p>
                                            <p className="text-2xl font-black font-mono tracking-tight text-foreground">
                                                ${analysis?.institutional_scenarios?.bull_case?.target?.toLocaleString()}
                                            </p>
                                            <Badge variant="outline" className="mt-2 border-profit/30 text-profit">
                                                Prob: {analysis?.institutional_scenarios?.bull_case?.probability}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                                {analysis?.institutional_scenarios?.bull_case?.logic}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Invalidation Level</p>
                                            <p className="text-sm text-foreground mt-1">
                                                {analysis?.institutional_scenarios?.invalidation_level?.logic}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-mono font-bold text-destructive">
                                                ${analysis?.institutional_scenarios?.invalidation_level?.price?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fundamental Data */}
                            <Card className="glass lg:col-span-3">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        Fundamental Data Layer (yFinance)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                        <StatItem label="Market Cap" value={formatCompact(analysis?.fundamental_data?.market_cap)} />
                                        <StatItem label="Trailing P/E" value={analysis?.fundamental_data?.trailing_pe?.toFixed(2)} />
                                        <StatItem label="Forward P/E" value={analysis?.fundamental_data?.forward_pe?.toFixed(2)} />
                                        <StatItem label="PEG Ratio" value={analysis?.fundamental_data?.peg_ratio?.toFixed(2)} />
                                        <StatItem label="Price/Book" value={analysis?.fundamental_data?.price_to_book?.toFixed(2)} />

                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valuation</p>
                                            <Badge variant={
                                                analysis?.fundamental_data?.valuation_assessment === "Undervalued" ? "default" :
                                                    analysis?.fundamental_data?.valuation_assessment === "Overvalued" ? "destructive" : "secondary"
                                            }>
                                                {analysis?.fundamental_data?.valuation_assessment}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Separator className="my-6 bg-border/50" />
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                        {analysis?.fundamental_data?.description || "No company description available."}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </PageLayout>
    );
}

function StatItem({ label, value }: { label: string, value: string | number | undefined }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className="font-mono font-medium text-foreground">{value || "N/A"}</p>
        </div>
    );
}

function formatCompact(num: number | undefined) {
    if (!num) return "N/A";
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
}

function AnalysisSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] lg:col-span-2 rounded-xl" />
            </div>
            <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
    );
}
