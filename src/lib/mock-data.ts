// Mock data for the Skill Trader Hub trading platform

// Sample stock tickers
export const SAMPLE_TICKERS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial" },
];

// Generate OHLC candlestick data
export function generateOHLCData(days: number = 365, startPrice: number = 100) {
  const data = [];
  let price = startPrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const volatility = 0.02 + Math.random() * 0.03;
    const trend = Math.random() > 0.48 ? 1 : -1;

    const open = price;
    const change = price * volatility * trend;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(1000000 + Math.random() * 5000000);

    data.push({
      date: date.toISOString().split("T")[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  return data;
}

// Generate equity curve data
export function generateEquityCurve(days: number = 180, startCapital: number = 10000) {
  const data = [];
  let equity = startCapital;
  const now = new Date();
  let maxEquity = startCapital;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate trading returns with slight upward bias
    const dailyReturn = (Math.random() - 0.45) * 0.03;
    equity = equity * (1 + dailyReturn);
    maxEquity = Math.max(maxEquity, equity);
    const drawdown = ((maxEquity - equity) / maxEquity) * 100;

    data.push({
      date: date.toISOString().split("T")[0],
      equity: Number(equity.toFixed(2)),
      drawdown: Number(drawdown.toFixed(2)),
      drawdownLimit: 10, // 10% max drawdown line
    });
  }

  return data;
}

// Generate mock trade history
export function generateTradeHistory(count: number = 50) {
  const trades = [];
  const symbols = SAMPLE_TICKERS.map(t => t.symbol);
  const journalTags = ["FOMO", "Revenge Trade", "Fat Finger", "Followed Plan", "Overconfidence", ""];

  for (let i = 0; i < count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - Math.floor(Math.random() * 90));
    const exitDate = new Date(entryDate);
    exitDate.setDate(exitDate.getDate() + Math.floor(Math.random() * 5) + 1);

    const entryPrice = 100 + Math.random() * 200;
    const pnlPercent = (Math.random() - 0.45) * 10;
    const exitPrice = entryPrice * (1 + pnlPercent / 100);
    const isProfit = pnlPercent > 0;

    trades.push({
      id: `trade-${i}`,
      symbol,
      entryDate: entryDate.toISOString().split("T")[0],
      exitDate: exitDate.toISOString().split("T")[0],
      entryPrice: Number(entryPrice.toFixed(2)),
      exitPrice: Number(exitPrice.toFixed(2)),
      pnl: Number((exitPrice - entryPrice).toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
      isProfit,
      duration: Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)),
      journalTag: journalTags[Math.floor(Math.random() * journalTags.length)],
      notes: "",
    });
  }

  return trades.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
}

// Mock news data
export function generateMockNews(symbol: string) {
  const newsTemplates = [
    { source: "Reuters", title: `${symbol} Reports Strong Quarterly Earnings`, sentiment: "positive" },
    { source: "Bloomberg", title: `Analysts Upgrade ${symbol} Price Target`, sentiment: "positive" },
    { source: "CNBC", title: `${symbol} Announces New Product Launch`, sentiment: "neutral" },
    { source: "WSJ", title: `${symbol} Faces Regulatory Scrutiny`, sentiment: "negative" },
    { source: "MarketWatch", title: `${symbol} Expands Into New Markets`, sentiment: "positive" },
  ];

  return newsTemplates.slice(0, 3).map((news, i) => ({
    ...news,
    id: `news-${i}`,
    timestamp: new Date(Date.now() - i * 3600000 * 4).toISOString(),
    symbol,
  }));
}

// Backtest result generator
export function runMockBacktest(params: {
  strategy: string;
  ticker: string;
  fastEMA: number;
  slowEMA: number;
  stopLoss: number;
  takeProfit: number;
}) {
  // Simulate backtest calculation delay
  const winRate = 45 + Math.random() * 25;
  const totalReturn = -20 + Math.random() * 80;
  const maxDrawdown = 5 + Math.random() * 20;
  const sharpeRatio = -0.5 + Math.random() * 2.5;
  const numTrades = Math.floor(50 + Math.random() * 150);

  // Generate trade signals on the OHLC data
  const ohlcData = generateOHLCData(365, 150);
  const signals: { date: string; type: "buy" | "sell"; price: number }[] = [];

  // Add some random buy/sell signals
  for (let i = 30; i < ohlcData.length; i += Math.floor(10 + Math.random() * 20)) {
    signals.push({
      date: ohlcData[i].date,
      type: Math.random() > 0.5 ? "buy" : "sell",
      price: ohlcData[i].close,
    });
  }

  return {
    params,
    results: {
      winRate: Number(winRate.toFixed(1)),
      totalReturn: Number(totalReturn.toFixed(2)),
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      numTrades,
      profitFactor: Number((1 + Math.random()).toFixed(2)),
    },
    ohlcData,
    signals,
    tradeHistory: generateTradeHistory(numTrades),
  };
}

// Curated strategies
export const CURATED_STRATEGIES = [
  {
    id: "conservative-swing",
    name: "Conservative Swing Trader",
    description: "Low-risk approach using moving averages and support/resistance levels.",
    risk: "Low",
    winRate: 58,
    returnRate: 12.5,
    maxDrawdown: 8,
    assetClass: "Stocks",
    whyItWorks: "This strategy capitalizes on market momentum while using tight stop losses. It works because markets tend to trend, and by following the trend with proper risk management, we capture steady gains over time.",
    params: { fastEMA: 20, slowEMA: 50, stopLoss: 2, takeProfit: 4 },
  },
  {
    id: "momentum-breakout",
    name: "Momentum Breakout",
    description: "High-reward strategy targeting price breakouts with volume confirmation.",
    risk: "High",
    winRate: 42,
    returnRate: 35.2,
    maxDrawdown: 22,
    assetClass: "Stocks",
    whyItWorks: "Breakouts with volume confirmation often lead to significant price movements. While the win rate is lower, the risk-reward ratio compensates by catching major moves.",
    params: { fastEMA: 10, slowEMA: 30, stopLoss: 5, takeProfit: 15 },
  },
  {
    id: "dividend-harvester",
    name: "Dividend Harvester",
    description: "Income-focused strategy targeting high-yield dividend stocks.",
    risk: "Low",
    winRate: 65,
    returnRate: 8.3,
    maxDrawdown: 6,
    assetClass: "Stocks",
    whyItWorks: "Dividend stocks tend to be more stable and provide consistent income. This strategy focuses on quality companies with sustainable payouts.",
    params: { fastEMA: 50, slowEMA: 200, stopLoss: 3, takeProfit: 6 },
  },
  {
    id: "crypto-mean-reversion",
    name: "Crypto Mean Reversion",
    description: "Capitalizes on crypto's tendency to return to mean prices after extremes.",
    risk: "Medium",
    winRate: 52,
    returnRate: 28.7,
    maxDrawdown: 18,
    assetClass: "Crypto",
    whyItWorks: "Crypto markets are highly volatile and often overshoot in both directions. Mean reversion strategies profit when prices normalize after extreme moves.",
    params: { fastEMA: 14, slowEMA: 28, stopLoss: 8, takeProfit: 12 },
  },
  {
    id: "forex-scalper",
    name: "Forex Scalper",
    description: "Quick entries and exits on major currency pairs using RSI divergence.",
    risk: "Medium",
    winRate: 55,
    returnRate: 18.4,
    maxDrawdown: 12,
    assetClass: "Forex",
    whyItWorks: "Forex markets have high liquidity and tight spreads. Scalping captures small, frequent gains that compound over time.",
    params: { fastEMA: 5, slowEMA: 15, stopLoss: 1, takeProfit: 2 },
  },
];

// Scanner mock data
export function generateScannerResults(filters: {
  sector?: string;
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
}) {
  const allStocks = [
    { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", price: 178.23, change: 2.4, volume: 52000000, rvol: 1.2, marketCap: 2800 },
    { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", price: 141.80, change: -0.8, volume: 18000000, rvol: 0.9, marketCap: 1800 },
    { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology", price: 378.91, change: 1.2, volume: 22000000, rvol: 1.1, marketCap: 2900 },
    { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive", price: 248.50, change: -3.2, volume: 98000000, rvol: 3.4, marketCap: 790 },
    { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology", price: 495.22, change: 4.1, volume: 45000000, rvol: 2.1, marketCap: 1200 },
    { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical", price: 153.42, change: 0.5, volume: 35000000, rvol: 1.0, marketCap: 1600 },
    { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology", price: 326.49, change: 1.8, volume: 15000000, rvol: 0.8, marketCap: 840 },
    { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial", price: 172.10, change: -0.3, volume: 8000000, rvol: 0.7, marketCap: 500 },
    { symbol: "V", name: "Visa Inc.", sector: "Financial", price: 259.33, change: 0.9, volume: 6000000, rvol: 0.9, marketCap: 530 },
    { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive", price: 165.21, change: 0.2, volume: 7000000, rvol: 1.0, marketCap: 450 },
  ];

  return allStocks.filter(stock => {
    if (filters.sector && stock.sector !== filters.sector) return false;
    if (filters.minPrice && stock.price < filters.minPrice) return false;
    if (filters.maxPrice && stock.price > filters.maxPrice) return false;
    if (filters.minMarketCap && stock.marketCap < filters.minMarketCap) return false;
    return true;
  });
}

// Assessment questions
export const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    question: "What percentage of your trading capital should you risk on a single trade?",
    options: [
      { value: "a", text: "25-50% - Go big or go home", score: 0 },
      { value: "b", text: "10-15% - Moderate risk for moderate reward", score: 1 },
      { value: "c", text: "1-2% - Preserve capital, consistent growth", score: 3 },
      { value: "d", text: "0.5% or less - Ultra conservative", score: 2 },
    ],
  },
  {
    id: 2,
    question: "A trade is going against you. What's your exit strategy?",
    options: [
      { value: "a", text: "Hold and hope it recovers", score: 0 },
      { value: "b", text: "Double down to average the entry price", score: 0 },
      { value: "c", text: "Exit at my predetermined stop loss", score: 3 },
      { value: "d", text: "Exit immediately at any loss", score: 1 },
    ],
  },
  {
    id: 3,
    question: "How do you determine your position size?",
    options: [
      { value: "a", text: "All-in on high conviction trades", score: 0 },
      { value: "b", text: "Based on how much I want to make", score: 1 },
      { value: "c", text: "Based on my maximum acceptable loss", score: 3 },
      { value: "d", text: "Random amount each time", score: 0 },
    ],
  },
  {
    id: 4,
    question: "You've had 3 losing trades in a row. What do you do?",
    options: [
      { value: "a", text: "Increase size to make back losses quickly", score: 0 },
      { value: "b", text: "Keep trading with the same size", score: 1 },
      { value: "c", text: "Stop, review my journal, identify issues", score: 3 },
      { value: "d", text: "Stop trading for the week", score: 2 },
    ],
  },
  {
    id: 5,
    question: "What's the ideal risk-to-reward ratio for a trade?",
    options: [
      { value: "a", text: "1:1 - Equal risk and reward", score: 1 },
      { value: "b", text: "1:2 or higher - Risk less than potential gain", score: 3 },
      { value: "c", text: "2:1 - Risk more for smaller gains", score: 0 },
      { value: "d", text: "Doesn't matter if the trade is a winner", score: 0 },
    ],
  },
];

// Calculate Proskill level from assessment
export function calculateProskillLevel(answers: Record<number, string>): number {
  let totalScore = 0;

  ASSESSMENT_QUESTIONS.forEach(q => {
    const answer = answers[q.id];
    const option = q.options.find(o => o.value === answer);
    if (option) {
      totalScore += option.score;
    }
  });

  // Max score is 15 (5 questions × 3 points max)
  // Map to levels 1-10
  const maxScore = 15;
  const percentage = totalScore / maxScore;

  if (percentage >= 0.9) return 8;
  if (percentage >= 0.75) return 6;
  if (percentage >= 0.6) return 5;
  if (percentage >= 0.45) return 4;
  if (percentage >= 0.3) return 3;
  if (percentage >= 0.15) return 2;
  return 1;
}

// Behavioral analytics data
export function generateBehavioralAnalytics(trades: ReturnType<typeof generateTradeHistory>) {
  const tagCounts: Record<string, { count: number; totalPnl: number }> = {};

  trades.forEach(trade => {
    if (trade.journalTag) {
      if (!tagCounts[trade.journalTag]) {
        tagCounts[trade.journalTag] = { count: 0, totalPnl: 0 };
      }
      tagCounts[trade.journalTag].count++;
      tagCounts[trade.journalTag].totalPnl += trade.pnl;
    }
  });

  return Object.entries(tagCounts).map(([tag, data]) => ({
    tag,
    count: data.count,
    totalPnl: Number(data.totalPnl.toFixed(2)),
    avgPnl: Number((data.totalPnl / data.count).toFixed(2)),
    isDestructive: data.totalPnl < 0,
  }));
}
