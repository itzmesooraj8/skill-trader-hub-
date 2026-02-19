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
 * 
 * TODO: Replace mock trading functions with real backend
 * 
 * Backend Requirements:
 * - POST /api/trading/backtest - Run backtest
 * - GET /api/trading/trades - Get user's trade history
 * - POST /api/trading/trades - Add new trade
 * - PUT /api/trading/trades/:id - Update trade
 * - DELETE /api/trading/trades/:id - Delete trade
 * - GET /api/trading/equity-curve - Get equity curve data
 * - GET /api/trading/analytics - Get trading analytics
 */
export const tradingAPI = {
    /**
     * Run backtest with given parameters
     * Replaces: runMockBacktest() from mock-data.ts
     * 
     * @param params - Backtest parameters
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
        // Backend expects { name, symbol, params, risk }
        // We map frontend params to backend structure
        const backendPayload = {
            name: params.strategy || 'SMA_Cross',
            symbol: params.ticker || 'BTC/USDT',
            params: {
                fast_period: params.fastEMA || 50,
                slow_period: params.slowEMA || 200,
                // Add other params mapping here
            },
            risk: {
                risk_per_trade: 0.02, // Default or add to frontend UI
                max_drawdown: 0.20
            }
        };

        const response: any = await apiFetch('/backtest', {
            method: 'POST',
            body: JSON.stringify(backendPayload),
        });

        // Map backend response to frontend interface
        // Backend returns: { equity_curve, dates, sharpe_ratio, ... }
        // Frontend expects: { params, results, ohlcData, signals, tradeHistory }

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
            ohlcData: [], // Backend doesn't return OHLC + Signals separately yet, need to fetch market data or update backend
            signals: [],
            tradeHistory: response.trades ? response.trades.map((t: any) => ({
                id: `trade-${t.date}`,
                symbol: params.ticker,
                entryDate: t.date,
                exitDate: t.date, // Approx
                entryPrice: t.price,
                exitPrice: t.price, // Needs clarification in backend logs
                pnl: t.pnl || 0,
                pnlPercent: 0,
                isProfit: (t.pnl || 0) > 0,
                duration: 0
            })) : []
        };
    },

    /**
     * Get user's trade history
     * Replaces: generateTradeHistory() from mock-data.ts
     * 
     * @param filters - Optional filters
     */
    async getTrades(filters?: {
        symbol?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<Trade[]> {
        // Backend currently only returns all session trades, ignore filters for MVP
        const trades: any[] = await apiFetch('/trades');

        return trades.map(t => ({
            id: t.id,
            symbol: t.symbol,
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
     * Add a new trade to the journal
     * 
     * @param trade - Trade data
     */
    async addTrade(trade: Omit<Trade, 'id'>): Promise<Trade> {
        return await apiFetch<Trade>('/trading/trades', {
            method: 'POST',
            body: JSON.stringify(trade),
        });
    },

    /**
     * Update an existing trade
     * 
     * @param id - Trade ID
     * @param updates - Fields to update
     */
    async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
        return await apiFetch<Trade>(`/trading/trades/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete a trade
     * 
     * @param id - Trade ID
     */
    async deleteTrade(id: string): Promise<void> {
        await apiFetch(`/trading/trades/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * Get equity curve data
     * Replaces: generateEquityCurve() from mock-data.ts
     * 
     * @param startDate - Optional start date
     * @param endDate - Optional end date
     */
    async getEquityCurve(startDate?: string, endDate?: string): Promise<EquityCurvePoint[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const query = params.toString();
        return await apiFetch<EquityCurvePoint[]>(`/trading/equity-curve${query ? `?${query}` : ''}`);
    },

    /**
     * Get trading analytics and statistics
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
     * Replaces: generateBehavioralAnalytics() from mock-data.ts
     */
    async getBehavioralAnalytics(): Promise<BehavioralTag[]> {
        return await apiFetch('/trading/behavioral-analytics');
    },

    /**
     * Export trades to CSV
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

/**
 * MIGRATION GUIDE: Replacing Mock Trading Data
 * 
 * 1. In DashboardPage.tsx, replace:
 * 
 * const equityCurve = useMemo(() => generateEquityCurve(180, user?.capital || 10000), [user]);
 * const trades = useMemo(() => generateTradeHistory(50), []);
 * 
 * With:
 * 
 * const { data: equityCurve } = useQuery({
 *   queryKey: ['equity-curve'],
 *   queryFn: () => tradingAPI.getEquityCurve(),
 * });
 * 
 * const { data: trades } = useQuery({
 *   queryKey: ['trades'],
 *   queryFn: () => tradingAPI.getTrades({ limit: 50 }),
 * });
 * 
 * 2. In LabPage.tsx, replace:
 * 
 * const result = runMockBacktest(params);
 * 
 * With:
 * 
 * const { mutate: runBacktest, data: result, isLoading } = useMutation({
 *   mutationFn: (params: BacktestParams) => tradingAPI.runBacktest(params),
 * });
 * 
 * 3. For adding trades:
 * 
 * const { mutate: addTrade } = useMutation({
 *   mutationFn: tradingAPI.addTrade,
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['trades'] });
 *     queryClient.invalidateQueries({ queryKey: ['equity-curve'] });
 *     queryClient.invalidateQueries({ queryKey: ['analytics'] });
 *   },
 * });
 */
