import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { marketAPI } from "@/lib/api/market";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, DollarSign, Bitcoin } from "lucide-react";

import { PageLayout } from "@/components/layout/PageLayout";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function TradeDialog({ open, onOpenChange, symbol }: { open: boolean, onOpenChange: (open: boolean) => void, symbol: string }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[80vh] flex flex-col bg-background/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="font-display font-bold text-xl">Trade {symbol}</span>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">USD</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 w-full bg-card rounded-xl overflow-hidden border border-border/50 relative mt-4">
                    <iframe
                        src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=${symbol.replace("/", "")}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${symbol}`}
                        style={{ width: "100%", height: "100%", border: "none" }}
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MarketCard({ title, value, change, changePercent }: { title: string, value: string, change?: number, changePercent?: number }) {
    const isPositive = (changePercent || 0) >= 0;
    return (
        <div className="glass p-5 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 group">
            <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground font-medium">{title}</span>
                <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-profit/10' : 'bg-loss/10'} group-hover:bg-opacity-20 transition-colors`}>
                    {isPositive ? <ArrowUpRight className={`h-4 w-4 text-profit`} /> : <ArrowDownRight className={`h-4 w-4 text-loss`} />}
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-2xl font-mono font-bold tracking-tight">{value}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${isPositive ? 'text-profit' : 'text-loss'}`}>
                        {isPositive ? '+' : ''}{changePercent?.toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground">24h</span>
                </div>
            </div>
        </div>
    );
}

function AssetRow({ symbol, name, price, change, volume, onTrade }: { symbol: string, name: string, price: number, change: number, volume: string, onTrade: (symbol: string) => void }) {
    const isPositive = change >= 0;
    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-card-elevated/50 hover:bg-card-hover transition-colors cursor-pointer group border border-transparent hover:border-border/50" onClick={() => onTrade(symbol)}>
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center font-display font-bold text-primary group-hover:scale-105 transition-transform">
                    {symbol.slice(0, 1)}
                </div>
                <div>
                    <h4 className="font-bold text-sm">{symbol}</h4>
                    <p className="text-xs text-muted-foreground">{name}</p>
                </div>
            </div>

            <div className="text-right min-w-[100px]">
                <p className="font-mono font-medium">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="text-right min-w-[80px]">
                <p className={`font-mono text-sm ${isPositive ? 'text-profit' : 'text-loss'} flex items-center justify-end gap-1`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(change).toFixed(2)}%
                </p>
            </div>

            <div className="text-right min-w-[100px] hidden md:block">
                <p className="text-xs text-muted-foreground mb-0.5">Vol</p>
                <p className="font-mono text-sm">{volume}</p>
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                    e.stopPropagation();
                    onTrade(symbol);
                }}
            >
                Trade
            </Button>
        </div>
    );
}

export default function MarketsPage() {
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

    const { data: marketOverview, isLoading } = useQuery({
        queryKey: ['market-overview'],
        queryFn: () => marketAPI.getMarketOverview(),
    });

    const { data: scannerData = [] } = useQuery({
        queryKey: ['market-scanner'],
        queryFn: () => marketAPI.getScanner(),
    });

    const { data: stockQuotes = [] } = useQuery({
        queryKey: ['stock-quotes'],
        queryFn: () => marketAPI.getQuotes(['NVDA', 'AMD', 'MSFT', 'TSLA', 'AAPL', 'AMZN']),
    });

    const handleTrade = (symbol: string) => {
        setSelectedAsset(symbol);
    };

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">

                <div>
                    <h1 className="font-display text-3xl font-bold mb-2">Markets</h1>
                    <p className="text-muted-foreground">Real-time market data and analysis for Stocks and Crypto.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-profit"></span>
                        </span>
                        Market Open
                    </span>
                </div>
            </div>

            <Tabs defaultValue="stocks" className="space-y-8">
                <TabsList className="glass p-1">
                    <TabsTrigger value="stocks" className="gap-2 px-6">
                        <Activity className="h-4 w-4" /> Stocks
                    </TabsTrigger>
                    <TabsTrigger value="crypto" className="gap-2 px-6">
                        <Bitcoin className="h-4 w-4" /> Crypto
                    </TabsTrigger>
                </TabsList>

                {/* Chart removed from top level */}

                <TabsContent value="stocks" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Market Indices */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {marketOverview?.indices?.map((idx: any) => (
                            <MarketCard
                                key={idx.symbol}
                                title={idx.name}
                                value={`$${idx.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                changePercent={idx.changePercent}
                            />
                        ))}
                        {!marketOverview?.indices && (
                            <>
                                <div className="glass p-5 h-32 animate-pulse space-y-3">
                                    <div className="h-4 bg-muted/50 rounded w-1/3"></div>
                                    <div className="h-8 bg-muted/50 rounded w-1/2"></div>
                                </div>
                                <div className="glass p-5 h-32 animate-pulse space-y-3">
                                    <div className="h-4 bg-muted/50 rounded w-1/3"></div>
                                    <div className="h-8 bg-muted/50 rounded w-1/2"></div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Top Movers (Using specific quotes for now as backend top gainers is WIP) */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass p-6">
                            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-profit" /> Popular Tech
                            </h3>
                            <div className="space-y-2">
                                {stockQuotes.slice(0, 3).map((q: any) => (
                                    <AssetRow
                                        key={q.symbol}
                                        symbol={q.symbol}
                                        name={q.symbol} // Name not always available in simple quote
                                        price={q.price}
                                        change={q.changePercent}
                                        volume={(q.volume / 1000000).toFixed(1) + 'M'}
                                        onTrade={handleTrade}
                                    />
                                ))}
                                {stockQuotes.length === 0 && <p className="text-sm text-muted-foreground">Loading specific stocks...</p>}
                            </div>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" /> Most Active
                            </h3>
                            <div className="space-y-2">
                                {stockQuotes.slice(3, 6).map((q: any) => (
                                    <AssetRow
                                        key={q.symbol}
                                        symbol={q.symbol}
                                        name={q.symbol}
                                        price={q.price}
                                        change={q.changePercent}
                                        volume={(q.volume / 1000000).toFixed(1) + 'M'}
                                        onTrade={handleTrade}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="crypto" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Crypto Stats - Using same indices for now, or could filter if backend separates them */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Fallback to Bitcoin manually if marketOverview doesn't have it, or reusing market indices if mixed */}
                        {marketOverview?.indices?.filter((i: any) => i.name.toLowerCase().includes('bitcoin')).map((idx: any) => (
                            <MarketCard
                                key={idx.symbol}
                                title={idx.name}
                                value={`$${idx.value?.toLocaleString()}`}
                                changePercent={idx.changePercent}
                            />
                        ))}
                        {/* Add placeholders for other crypto stats if needed, or fetch specific crypto quotes */}
                        {marketOverview?.indices?.filter((i: any) => i.name.toLowerCase().includes('ethereum')).map((idx: any) => (
                            <MarketCard
                                key={idx.symbol}
                                title={idx.name}
                                value={`$${idx.value?.toLocaleString()}`}
                                changePercent={idx.changePercent}
                            />
                        ))}
                        {marketOverview?.indices?.filter((i: any) => i.name.toLowerCase().includes('solana')).map((idx: any) => (
                            <MarketCard
                                key={idx.symbol}
                                title={idx.name}
                                value={`$${idx.value?.toLocaleString()}`}
                                changePercent={idx.changePercent}
                            />
                        ))}
                        {(!marketOverview?.indices || marketOverview.indices.filter((i: any) => i.name.toLowerCase().includes('bitcoin')).length === 0) && (
                            <>
                                <MarketCard title="Bitcoin" value="$68,450.00" changePercent={2.4} />
                                <MarketCard title="Ethereum" value="$3,890.10" changePercent={1.8} />
                                <MarketCard title="Solana" value="$145.20" changePercent={5.6} />
                            </>
                        )}
                    </div>

                    <div className="glass p-6">
                        <h3 className="font-display font-semibold mb-6">Crypto Market Scanner (24h)</h3>
                        <div className="space-y-2">
                            {scannerData.map((coin: any) => (
                                <AssetRow
                                    key={coin.symbol}
                                    symbol={coin.symbol.split('/')[0]}
                                    name={coin.name}
                                    price={coin.price}
                                    change={coin.change}
                                    volume={(coin.volume / 1000000).toFixed(1) + 'M'}
                                    onTrade={handleTrade}
                                />
                            ))}
                            {scannerData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Loading live crypto data...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <TradeDialog
                open={!!selectedAsset}
                onOpenChange={(open) => !open && setSelectedAsset(null)}
                symbol={selectedAsset || ''}
            />
        </PageLayout>
    );
}
