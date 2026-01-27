"""
Convenience runner that ties together market data fetch, screener, and built-in strategies.
Usage:
  python run_market_suite.py                # run all steps
  python run_market_suite.py data           # only fetch sample market data
  python run_market_suite.py screener       # only run screener
  python run_market_suite.py strategies     # only run strategy previews
"""

import argparse
from typing import List

from market_data import MarketData, EquityScreener
from built_in_strategies import (
    ema_crossover_signals,
    rsi_mean_reversion_signals,
    backtest_signals,
    summarize_signals,
)


def fetch_sample_data(symbols: List[str]) -> None:
    print("\n== Market Data ==")
    data = MarketData.get_tickers(symbols, period='6mo', interval='1d')
    for symbol, df in data.items():
        if df.empty:
            print(f"{symbol}: no data")
            continue
        summarize_signals(df.assign(signal=0), label=f"{symbol} raw")


def run_sample_screener(symbols: List[str]) -> None:
    print("\n== Screener ==")
    screener = EquityScreener()
    results = screener.screen_by_criteria(
        symbols=symbols,
        min_market_cap=50_000_000_000,
        max_pe=60,
        sectors=None,
    )
    if results.empty:
        print("No symbols passed the screener")
    else:
        print(results[['symbol', 'name', 'sector', 'marketCap', 'pe_ratio']].head().to_string(index=False))


def run_strategy_previews(symbol: str = 'AAPL') -> None:
    print("\n== Strategy Previews ==")
    data = MarketData.get_ticker(symbol, period='1y', interval='1d')
    if data.empty:
        print(f"No data for {symbol}")
        return

    ema_df = ema_crossover_signals(data)
    ema_stats = backtest_signals(ema_df)
    summarize_signals(ema_df, label=f"EMA crossover {symbol}")
    print(f"EMA total return: {ema_stats['total_return']*100:.2f}% | Win rate: {ema_stats['win_rate']*100:.1f}%")

    rsi_df = rsi_mean_reversion_signals(data)
    rsi_stats = backtest_signals(rsi_df)
    summarize_signals(rsi_df, label=f"RSI mean reversion {symbol}")
    print(f"RSI total return: {rsi_stats['total_return']*100:.2f}% | Win rate: {rsi_stats['win_rate']*100:.1f}%")


def main() -> None:
    parser = argparse.ArgumentParser(description="Market data + screener + strategy previews")
    parser.add_argument('action', nargs='?', default='all', choices=['all', 'data', 'screener', 'strategies'])
    parser.add_argument('--symbols', nargs='*', default=['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'], help='Symbols to use for data/screener')
    parser.add_argument('--strategy-symbol', default='AAPL', help='Symbol for strategy preview')
    args = parser.parse_args()

    if args.action in ('all', 'data'):
        fetch_sample_data(args.symbols)
    if args.action in ('all', 'screener'):
        run_sample_screener(args.symbols)
    if args.action in ('all', 'strategies'):
        run_strategy_previews(args.strategy_symbol)


if __name__ == '__main__':
    main()
