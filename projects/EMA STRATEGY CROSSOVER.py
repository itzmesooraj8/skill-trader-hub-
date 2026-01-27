"""
EMA crossover demo runner.
Uses yfinance data via MarketData and the reusable helpers in built_in_strategies.
"""

from market_data import MarketData
from built_in_strategies import ema_crossover_signals, backtest_signals, summarize_signals


def run_ema_demo(symbol: str = 'GBPUSD=X', fast: int = 21, slow: int = 50) -> None:
	data = MarketData.get_ticker(symbol, period='6mo', interval='1d')
	if data.empty:
		print(f"No data for {symbol}")
		return

	signals = ema_crossover_signals(data, fast=fast, slow=slow)
	stats = backtest_signals(signals)
	summarize_signals(signals, label=f"EMA {fast}/{slow} {symbol}")
	print(f"Total return: {stats['total_return']*100:.2f}% | Win rate: {stats['win_rate']*100:.1f}%")


if __name__ == '__main__':
	run_ema_demo()
