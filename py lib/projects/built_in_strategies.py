"""
Built-in strategy utilities (pandas-based)
- EMA crossover signals
- RSI mean reversion signals
- Simple vectorized backtest for signal series
"""

import pandas as pd
import numpy as np


def ema_crossover_signals(df: pd.DataFrame, fast: int = 21, slow: int = 50) -> pd.DataFrame:
    """Compute EMA crossover signals (1 long, -1 short, 0 flat)."""
    price = df.copy()
    price['ema_fast'] = price['Close'].ewm(span=fast, adjust=False).mean()
    price['ema_slow'] = price['Close'].ewm(span=slow, adjust=False).mean()
    price['signal'] = 0
    price.loc[price['ema_fast'] > price['ema_slow'], 'signal'] = 1
    price.loc[price['ema_fast'] < price['ema_slow'], 'signal'] = -1
    price['position_change'] = price['signal'].diff().fillna(0)
    return price


def rsi_mean_reversion_signals(
    df: pd.DataFrame,
    period: int = 14,
    oversold: float = 30.0,
    overbought: float = 70.0,
) -> pd.DataFrame:
    """RSI mean reversion: long when oversold, short when overbought."""
    price = df.copy()
    delta = price['Close'].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / (avg_loss.replace(0, np.nan))
    price['rsi'] = 100 - (100 / (1 + rs))
    price['signal'] = 0
    price.loc[price['rsi'] < oversold, 'signal'] = 1
    price.loc[price['rsi'] > overbought, 'signal'] = -1
    price['position_change'] = price['signal'].diff().fillna(0)
    return price


def backtest_signals(df: pd.DataFrame, signal_col: str = 'signal') -> dict:
    """Vectorized PnL stats for a signal series on Close prices."""
    price = df.copy()
    price['returns'] = price['Close'].pct_change()
    price['strategy_returns'] = price['returns'] * price[signal_col].shift(1).fillna(0)
    price['equity_curve'] = (1 + price['strategy_returns']).cumprod()
    total_return = price['equity_curve'].iloc[-1] - 1 if not price.empty else 0
    win_rate = (price['strategy_returns'] > 0).sum() / max((price[signal_col] != 0).sum(), 1)
    return {
        'total_return': float(total_return),
        'equity_curve': price['equity_curve'],
        'last_signal': float(price[signal_col].iloc[-1]) if not price.empty else 0,
        'win_rate': float(win_rate),
    }


def summarize_signals(df: pd.DataFrame, label: str) -> None:
    """Print a lightweight summary for quick inspection."""
    if df.empty:
        print(f"{label}: no data to summarize")
        return
    last_price = df['Close'].iloc[-1]
    last_signal = df['signal'].iloc[-1]
    change = df['Close'].pct_change().iloc[-1] * 100
    print(f"{label}: close={last_price:.2f}, signal={last_signal:+.0f}, daily_change={change:.2f}%")


if __name__ == '__main__':
    # Minimal demo using random data for shape checking
    dates = pd.date_range(end=pd.Timestamp.today(), periods=120, freq='D')
    mock = pd.DataFrame({'Close': np.random.lognormal(mean=0, sigma=0.02, size=len(dates)) * 100}, index=dates)
    ema_df = ema_crossover_signals(mock)
    rsi_df = rsi_mean_reversion_signals(mock)
    print("EMA demo stats:", backtest_signals(ema_df))
    print("RSI demo stats:", backtest_signals(rsi_df))
