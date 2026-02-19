import { apiFetch } from './index';

export interface OHLCData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Quote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap?: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
}

export interface NewsItem {
    id: string;
    symbol: string;
    title: string;
    source: string;
    timestamp: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    url?: string;
    summary?: string;
}

/**
 * Market Data API Service
 * 
 * TODO: Replace mock data generators with these real API calls
 * 
 * Recommended APIs:
 * - Alpha Vantage (free tier available)
 * - Polygon.io (good for real-time data)
 * - Finnhub (comprehensive free tier)
 * - IEX Cloud (developer-friendly)
 * 
 * Backend Requirements:
 * - GET /api/market/ohlc/:symbol - Get OHLC candlestick data
 * - GET /api/market/quote/:symbol - Get real-time quote
 * - GET /api/market/news/:symbol - Get news for symbol
 * - GET /api/market/search - Search for stocks
 */
export const marketAPI = {
    /**
     * Get OHLC (candlestick) data for a symbol
     * Replaces: generateOHLCData() from mock-data.ts
     * 
     * @param symbol - Stock ticker symbol (e.g., "AAPL")
     * @param timeframe - Timeframe (e.g., "1D", "1H", "5M")
     * @param from - Start date (ISO string)
     * @param to - End date (ISO string)
     */
    async getOHLCData(
        symbol: string,
        timeframe: string = '1D',
        from?: string,
        to?: string
    ): Promise<OHLCData[]> {
        // Backend currently only supports 1H/Default timeframe, ignore params for MVP
        // Endpoint: /api/market-data/{symbol}
        return await apiFetch<OHLCData[]>(`/market-data/${symbol.replace('/', '-')}`);
    },

    /**
     * Get real-time quote for a symbol
     * 
     * @param symbol - Stock ticker symbol
     */
    async getQuote(symbol: string): Promise<Quote> {
        return await apiFetch<Quote>(`/market/quote/${symbol}`);
    },

    /**
     * Get multiple quotes at once
     * 
     * @param symbols - Array of stock ticker symbols
     */
    async getQuotes(symbols: string[]): Promise<Quote[]> {
        const params = new URLSearchParams({
            symbols: symbols.join(','),
        });

        return await apiFetch<Quote[]>(`/market/quotes?${params}`);
    },

    /**
     * Get news for a specific symbol
     * Replaces: generateMockNews() from mock-data.ts
     * 
     * @param symbol - Stock ticker symbol
     * @param limit - Number of news items to return
     */
    async getNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
        return await apiFetch<NewsItem[]>(`/market/news/${symbol}?limit=${limit}`);
    },

    /**
     * Search for stocks by name or symbol
     * 
     * @param query - Search query
     */
    async searchStocks(query: string): Promise<Array<{
        symbol: string;
        name: string;
        sector: string;
        exchange: string;
    }>> {
        return await apiFetch(`/market/search?q=${encodeURIComponent(query)}`);
    },

    /**
     * Get market overview/indices
     */
    async getMarketOverview(): Promise<{
        indices: Array<{
            symbol: string;
            name: string;
            value: number;
            change: number;
            changePercent: number;
        }>;
        topGainers: Quote[];
        topLosers: Quote[];
        mostActive: Quote[];
    }> {
        return await apiFetch('/market/overview');
    },
    async getScanner(): Promise<Array<{
        symbol: string;
        name: string;
        price: number;
        change: number;
        volume: number;
        rvol: number;
        sector: string;
        marketCap: number;
    }>> {
        return await apiFetch('/market/scanner');
    },
    async getInstitutionalAnalysis(symbol: string): Promise<any> {
        return await apiFetch(`/analysis/${symbol.replace('/', '-')}`);
    },
};

/**
 * MIGRATION GUIDE: Replacing Mock Data
 * 
 * 1. In LabPage.tsx, replace:
 * 
 * const ohlcData = useMemo(() => generateOHLCData(365, 150), []);
 * 
 * With:
 * 
 * const { data: ohlcData, isLoading } = useQuery({
 *   queryKey: ['ohlc', selectedTicker, timeframe],
 *   queryFn: () => marketAPI.getOHLCData(selectedTicker, timeframe),
 * });
 * 
 * 2. In DashboardPage.tsx, replace:
 * 
 * const news = generateMockNews(symbol);
 * 
 * With:
 * 
 * const { data: news } = useQuery({
 *   queryKey: ['news', symbol],
 *   queryFn: () => marketAPI.getNews(symbol),
 * });
 * 
 * 3. For real-time quotes, use polling:
 * 
 * const { data: quote } = useQuery({
 *   queryKey: ['quote', symbol],
 *   queryFn: () => marketAPI.getQuote(symbol),
 *   refetchInterval: 5000, // Refresh every 5 seconds
 * });
 */
