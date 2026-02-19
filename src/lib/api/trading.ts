import { apiFetch } from './index';

export interface BacktestParams {
    strategy: string;
    ticker: string;
    fastEMA: number;
    slowEMA: number;
    stopLoss: number;
    takeProfit: number;
    startDate?: string;
    endDate?: string;
    initialCapital?: number;
}

export interface BacktestResults {
    winRate: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    numTrades: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
}

export interface Trade {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    entryDate: string;
    exitDate: string;
    entryPrice: number;
    exitPrice: number;
    pnl: number;
    pnlPercent: number;
    isProfit: boolean;
    duration: number;
    journalTag?: string;
    notes?: string;
    size?: number;
    commission?: number;
}

export interface EquityCurvePoint {
    date: string;
    equity: number;
    drawdown: number;
    drawdownLimit: number;
}

export interface BehavioralTag {
    tag: string;
    count: number;
    totalPnl: number;
    avgPnl: number;
    isDestructive: boolean;
}

/**
 * Trading & Backtesting API Service
 */
export const tradingAPI = {
    /**
     * Run backtest with given parameters
     */
    async runBacktest(params: BacktestParams): Promise<{
        params: BacktestParams;
        results: BacktestResults;
        ohlcData: Array<{
            date: string;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
        }>;
        signals: Array<{
            date: string;
            type: 'buy' | 'sell';
            price: number;
        }>;
        tradeHistory: Trade[];
    }> {
        const backendPayload = {
            name: params.strategy || 'SMA_Cross',
            symbol: params.ticker || 'BTC/USDT',
            params: {
                fast_period: params.fastEMA || 50,
                slow_period: params.slowEMA || 200,
            },
            risk: {
                risk_per_trade: 0.02,
                max_drawdown: 0.20
            }
        };

        const response: any = await apiFetch('/backtest', {
            method: 'POST',
            body: JSON.stringify(backendPayload),
        });

        return {
            params,
            results: {
                winRate: response.metrics.win_rate,
                totalReturn: response.metrics.total_return_percentage,
                maxDrawdown: response.metrics.max_drawdown,
                sharpeRatio: response.metrics.sharpe_ratio,
                numTrades: response.metrics.num_trades,
                profitFactor: response.metrics.profit_factor,
                avgWin: response.metrics.avg_win,
                avgLoss: response.metrics.avg_loss,
                largestWin: response.metrics.largest_win,
                largestLoss: response.metrics.largest_loss
            },
            ohlcData: [], // Backend doesn't return OHLC + Signals separately yet
            signals: [],
            tradeHistory: response.trades ? response.trades.map((t: any) => ({
                id: `trade-${t.date}`,
                symbol: params.ticker,
                side: t.side || t.type || 'buy',
                entryDate: t.date,
                exitDate: t.date,
                entryPrice: t.price,
                exitPrice: t.price,
                pnl: t.pnl || 0,
                pnlPercent: 0,
                isProfit: (t.pnl || 0) > 0,
                duration: 0
            })) : []
        };
    },

    /**
     * Get user's trade history
     */
    async getTrades(filters?: {
        symbol?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<Trade[]> {
        const trades: any[] = await apiFetch('/trades');

        return trades.map(t => ({
            id: t.id,
            symbol: t.symbol,
            side: t.side || t.type || 'buy',
            entryDate: t.time || new Date().toISOString(),
            exitDate: t.time || new Date().toISOString(),
            entryPrice: t.entry_price || 0,
            exitPrice: t.exit_price || 0,
            pnl: t.pnl || 0,
            pnlPercent: 0,
            isProfit: (t.pnl || 0) > 0,
            duration: 0,
            size: t.size
        }));
    },

    /**
     * Add a new trade
     */
    async addTrade(trade: Omit<Trade, 'id'>): Promise<Trade> {
        return await apiFetch<Trade>('/trading/trades', {
            method: 'POST',
            body: JSON.stringify(trade),
        });
    },

    /**
     * Update an existing trade
     */
    async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
        return await apiFetch<Trade>(`/trading/trades/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete a trade
     */
    async deleteTrade(id: string): Promise<void> {
        await apiFetch(`/trading/trades/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * Get equity curve data
     */
    async getEquityCurve(startDate?: string, endDate?: string): Promise<EquityCurvePoint[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const query = params.toString();
        // Remove spaces that might have been introduced by auto-formatters in previous steps
        return await apiFetch<EquityCurvePoint[]>(`/trading/equity-curve${query ? `?${query}` : ''}`);
    },

    /**
     * Get trading analytics
     */
    async getAnalytics(): Promise<{
        totalTrades: number;
        winRate: number;
        profitFactor: number;
        avgWin: number;
        avgLoss: number;
        totalPnl: number;
        totalPnlPercent: number;
        bestTrade: Trade;
        worstTrade: Trade;
        currentStreak: number;
        longestWinStreak: number;
        longestLossStreak: number;
        behavioralTags: BehavioralTag[];
    }> {
        return await apiFetch('/trading/analytics');
    },

    /**
     * Get behavioral analytics
     */
    async getBehavioralAnalytics(): Promise<BehavioralTag[]> {
        return await apiFetch('/trading/behavioral-analytics');
    },

    /**
     * Export trades
     */
    async exportTrades(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trading/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return await response.blob();
    },
};
