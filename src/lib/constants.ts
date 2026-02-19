
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

export function calculateProskillLevel(answers: Record<number, string>): number {
    let totalScore = 0;

    ASSESSMENT_QUESTIONS.forEach(q => {
        const answer = answers[q.id];
        const option = q.options.find(o => o.value === answer);
        if (option) {
            totalScore += option.score;
        }
    });

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
