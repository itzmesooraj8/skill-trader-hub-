import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { tradingAPI } from "@/lib/api/trading";
import { ArrowUp, ArrowDown, Download, Search, Filter, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const { data: trades = [], isLoading } = useQuery({
        queryKey: ['trades-history'],
        queryFn: () => tradingAPI.getTrades({ limit: 100 }), // Fetch more trades for history
    });

    const filteredTrades = trades.filter(trade => {
        const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        // In a real app, I would filter by date period too
        return matchesSearch;
    });

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold mb-2">Trade History</h1>
                    <p className="text-muted-foreground">Comprehensive log of all your trading activity.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto relative">
                    <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
                    <Input
                        placeholder="Search symbol..."
                        className="pl-9 bg-background/50 border-border/50 w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                        <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Trade Table */}
            <div className="glass rounded-xl overflow-hidden min-h-[500px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredTrades.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/30 border-b border-border/50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Symbol</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Side</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Entry</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Exit</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">P&L</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredTrades.map((trade: any) => (
                                    <tr key={trade.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                                            {new Date(trade.entryDate).toLocaleDateString()} <span className="text-2xs opacity-70">{new Date(trade.entryDate).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="py-3 px-4 text-sm font-bold">{trade.symbol}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <Badge variant={trade.side === 'long' ? 'default' : 'destructive'} className="uppercase text-2xs">
                                                {trade.side}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm font-mono text-right">${trade.entryPrice}</td>
                                        <td className="py-3 px-4 text-sm font-mono text-right">${trade.exitPrice || '-'}</td>
                                        <td className={`py-3 px-4 text-sm font-mono text-right ${trade.pnl > 0 ? 'text-profit' : trade.pnl < 0 ? 'text-loss' : ''}`}>
                                            {trade.pnl ? (
                                                <span className="flex items-center justify-end gap-1">
                                                    {trade.pnl > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                                    ${Math.abs(trade.pnl).toFixed(2)}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <Badge variant="outline" className={`text-2xs ${trade.status === 'closed' ? 'bg-muted/50' : 'bg-primary/20 text-primary border-primary/30'}`}>
                                                {trade.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <History className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No history found</p>
                        <p className="text-sm">Trades will appear here once executed.</p>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
