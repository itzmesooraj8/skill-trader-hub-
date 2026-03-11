import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt

# ==============================
# PARAMETERS
# ==============================

ticker = "NVDA"
start = "2023-01-01"
end = "2024-12-31"

cost = 0.001

# ==============================
# LOAD DATA
# ==============================

data = yf.download(ticker, start=start, end=end, auto_adjust=True)

if isinstance(data.columns, pd.MultiIndex):
    data.columns = data.columns.get_level_values(0)

data = data[['Open','High','Low','Close','Volume']].copy()

close = data['Close']
high = data['High']
low = data['Low']

# ==============================
# RSI
# ==============================

period = 14

delta = close.diff()

gain = delta.clip(lower=0)
loss = -delta.clip(upper=0)

avg_gain = gain.rolling(period).mean()
avg_loss = loss.rolling(period).mean()

rs = avg_gain / avg_loss

data['RSI'] = 100 - (100/(1+rs))

# ==============================
# TREND REGIME (EMA200)
# ==============================

data['ema200'] = close.ewm(span=200, adjust=False).mean()

data['bull_regime'] = close > data['ema200']
data['bear_regime'] = close < data['ema200']

# ==============================
# VOLATILITY FILTER (ATR)
# ==============================

tr1 = high - low
tr2 = abs(high - close.shift())
tr3 = abs(low - close.shift())

tr = pd.concat([tr1,tr2,tr3], axis=1).max(axis=1)

data['ATR'] = tr.rolling(14).mean()
data['ATR_avg'] = data['ATR'].rolling(50).mean()

data['volatility_ok'] = data['ATR'] > data['ATR_avg']

# ==============================
# ADAPTIVE RSI THRESHOLDS
# ==============================

vol_factor = (data['ATR'] / close) * 100

data['rsi_low'] = 30 + vol_factor
data['rsi_high'] = 70 - vol_factor

# ==============================
# ENTRY CONDITIONS
# ==============================

data['long_entry'] = (
    (data['RSI'] < data['rsi_low']) &
    data['bull_regime'] &
    data['volatility_ok']
)

data['short_entry'] = (
    (data['RSI'] > data['rsi_high']) &
    data['bear_regime'] &
    data['volatility_ok']
)

# ==============================
# POSITION ENGINE
# ==============================

position = 0
positions = []

for i in range(len(data)):

    rsi = data['RSI'].iloc[i]
    low_th = data['rsi_low'].iloc[i]
    high_th = data['rsi_high'].iloc[i]

    long_entry = bool(data['long_entry'].iloc[i])
    short_entry = bool(data['short_entry'].iloc[i])

    if position == 0:

        if long_entry:
            position = 1

        elif short_entry:
            position = -1

    elif position == 1:

        if rsi > 60:
            position = 0

    elif position == -1:

        if rsi < 40:
            position = 0

    positions.append(position)

data['position'] = positions

# ==============================
# RETURNS
# ==============================

data['returns'] = close.pct_change()

data['strategy_returns'] = data['returns'] * data['position'].shift(1)

data['trades'] = data['position'].diff().abs()

data['strategy_returns'] -= data['trades'] * cost

data['strategy_returns'] = data['strategy_returns'].fillna(0)

data['equity'] = (1 + data['strategy_returns']).cumprod()

# ==============================
# METRICS
# ==============================

years = len(data) / 252

CAGR = data['equity'].iloc[-1]**(1/years) - 1

Sharpe = (
    data['strategy_returns'].mean() /
    data['strategy_returns'].std()
) * np.sqrt(252)

rolling_max = data['equity'].cummax()
drawdown = data['equity'] / rolling_max - 1
max_dd = drawdown.min()

print("===== RESULTS =====")
print("CAGR:", round(CAGR*100,2),"%")
print("Sharpe:", round(Sharpe,2))
print("Max Drawdown:", round(max_dd*100,2),"%")

# ==============================
# PRICE CHART
# ==============================

plt.figure(figsize=(14,6))

plt.plot(data.index, close, label="Price")
plt.plot(data.index, data['ema200'], label="EMA200")

plt.title("Price + EMA200")
plt.legend()
plt.grid()

plt.show()


# ==============================
# RSI CHART
# ==============================

plt.figure(figsize=(14,6))

plt.plot(data.index, data['RSI'], label="RSI")
plt.plot(data.index, data['rsi_low'], label="RSI Lower Threshold")
plt.plot(data.index, data['rsi_high'], label="RSI Upper Threshold")

plt.title("RSI Adaptive Levels")
plt.legend()
plt.grid()

plt.show()


# ==============================
# EQUITY CURVE
# ==============================

plt.figure(figsize=(14,6))

plt.plot(data.index, data['equity'])

plt.title("Equity Curve")
plt.grid()

plt.show()


# ==============================
# DRAWDOWN
# ==============================

plt.figure(figsize=(14,6))

plt.plot(data.index, drawdown)

plt.title("Drawdown")
plt.grid()

plt.show()

# ==============================
# BELL CURVE
# ==============================

plt.figure(figsize=(10,5))

returns = data['strategy_returns']

mu = returns.mean()
sigma = returns.std()

x = np.linspace(mu-4*sigma, mu+4*sigma,100)

y = (1/(sigma*np.sqrt(2*np.pi))) * np.exp(-(x-mu)**2/(2*sigma**2))

plt.hist(returns, bins=60, density=True)
plt.plot(x,y)

plt.title("Return Distribution")
plt.grid()
plt.show()