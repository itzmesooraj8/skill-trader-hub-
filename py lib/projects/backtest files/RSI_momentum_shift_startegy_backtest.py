import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt

# ==============================
# PARAMETERS
# ==============================

ticker = "AAPL"
start = "2019-01-01"
end = "2024-01-01"

account_size = 10_000_000
risk_per_trade = 0.05
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
# EMA TREND FILTER
# ==============================

data['ema200'] = close.ewm(span=200, adjust=False).mean()

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
# ATR
# ==============================

tr1 = high - low
tr2 = abs(high - close.shift())
tr3 = abs(low - close.shift())

tr = pd.concat([tr1,tr2,tr3], axis=1).max(axis=1)

data['ATR'] = tr.rolling(14).mean()

# ==============================
# STRICT ENTRY CONDITIONS
# ==============================

data['long_signal'] = (
    (close > data['ema200']) &
    (data['RSI'] < 30) &
    (close > data['ema200'] * 1.002) &
    (data['ATR'].notna())
)

data['short_signal'] = (
    (close < data['ema200']) &
    (data['RSI'] > 70) &
    (close < data['ema200'] * 0.998) &
    (data['ATR'].notna())
)

# ==============================
# POSITION ENGINE
# ==============================

position = 0
entry_price = 0
stop_price = 0
shares = 0

positions = []
equity_curve = []

equity = account_size

for i in range(len(data)):

    price = close.iloc[i]
    rsi = data['RSI'].iloc[i]
    atr = data['ATR'].iloc[i]

    long_signal = data['long_signal'].iloc[i]
    short_signal = data['short_signal'].iloc[i]

    # ==========================
    # NO POSITION
    # ==========================

    if position == 0:

        if pd.notna(atr):

            risk_dollars = equity * risk_per_trade

            if long_signal:

                entry_price = price
                stop_price = price - atr

                shares = risk_dollars / atr

                position = 1

            elif short_signal:

                entry_price = price
                stop_price = price + atr

                shares = risk_dollars / atr

                position = -1

    # ==========================
    # LONG POSITION
    # ==========================

    elif position == 1:

        stop_hit = price <= stop_price
        momentum_exit = rsi > 55

        if stop_hit or momentum_exit:

            equity += shares * (price - entry_price)
            position = 0

    # ==========================
    # SHORT POSITION
    # ==========================

    elif position == -1:

        stop_hit = price >= stop_price
        momentum_exit = rsi < 45

        if stop_hit or momentum_exit:

            equity += shares * (entry_price - price)
            position = 0

    positions.append(position)
    equity_curve.append(equity)

data['position'] = positions
data['equity'] = equity_curve

# ==============================
# RETURNS
# ==============================

returns = pd.Series(equity_curve).pct_change().fillna(0)

# ==============================
# METRICS
# ==============================

years = len(data) / 252

CAGR = (equity_curve[-1] / account_size) ** (1/years) - 1

Sharpe = (returns.mean() / returns.std()) * np.sqrt(252)

rolling_max = pd.Series(equity_curve).cummax()
drawdown = pd.Series(equity_curve) / rolling_max - 1
max_dd = drawdown.min()

print("===== RESULTS =====")
print("CAGR:", round(CAGR*100,2),"%")
print("Sharpe:", round(Sharpe,2))
print("Max Drawdown:", round(max_dd*100,2),"%")

# ==============================
# PRICE CHART + SIGNALS
# ==============================

plt.figure(figsize=(14,6))

plt.plot(data.index, close, label="Price")
plt.plot(data.index, data['ema200'], label="EMA200")

longs = data[data['position'].diff() == 1]
shorts = data[data['position'].diff() == -1]

plt.scatter(longs.index, longs['Close'], marker="^", label="Long Entry")
plt.scatter(shorts.index, shorts['Close'], marker="v", label="Short Entry")

plt.title("Price + EMA200 + Signals")
plt.legend()
plt.grid()

plt.show()

# ==============================
# RSI CHART
# ==============================

plt.figure(figsize=(14,6))

plt.plot(data.index, data['RSI'])

plt.axhline(30)
plt.axhline(70)

plt.title("RSI Indicator")

plt.grid()

plt.show()

# ==============================
# EQUITY CURVE
# ==============================

plt.figure(figsize=(14,6))

plt.plot(data.index, equity_curve)

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
# RETURN DISTRIBUTION
# ==============================

plt.figure(figsize=(10,5))

mu = returns.mean()
sigma = returns.std()

x = np.linspace(mu-4*sigma, mu+4*sigma,100)

y = (1/(sigma*np.sqrt(2*np.pi))) * np.exp(-(x-mu)**2/(2*sigma**2))

plt.hist(returns, bins=60, density=True)
plt.plot(x,y)

plt.title("Return Distribution")

plt.grid()

plt.show()