import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns

# ==============================
# PORTFOLIO PARAMETERS
# ==============================

tickers = [
"KO",
"PEP",
"PG",
"WMT",
"COST",
"JNJ",
"MRK",
"ABBV",
"MCD",
"CL"
]

account_size = 10_000_000
portfolio_risk = 0.15

start = "2014-01-01"
end = "2024-01-01"

# ==============================
# DOWNLOAD DATA
# ==============================

data = yf.download(tickers, start=start, end=end, auto_adjust=True)['Close']

returns = data.pct_change()

# ==============================
# RSI FUNCTION
# ==============================

def compute_rsi(series, period=14):

    delta = series.diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean()

    rs = avg_gain / avg_loss

    rsi = 100 - (100/(1+rs))

    return rsi

# ==============================
# STRATEGY RETURNS
# ==============================

strategy_returns = pd.DataFrame(index=data.index)

for ticker in tickers:

    price = data[ticker]

    rsi = compute_rsi(price)

    long = rsi < 30
    short = rsi > 70

    position = np.zeros(len(price))

    for i in range(1,len(price)):

        if position[i-1] == 0:

            if long.iloc[i]:
                position[i] = 1

            elif short.iloc[i]:
                position[i] = -1

        elif position[i-1] == 1:

            if rsi.iloc[i] > 70:
                position[i] = 0
            else:
                position[i] = 1

        elif position[i-1] == -1:

            if rsi.iloc[i] < 30:
                position[i] = 0
            else:
                position[i] = -1

    strat_ret = returns[ticker] * pd.Series(position,index=data.index).shift(1)

    strategy_returns[ticker] = strat_ret

strategy_returns = strategy_returns.fillna(0)

# ==============================
# PORTFOLIO AGGREGATION
# ==============================

weights = np.repeat(1/len(tickers),len(tickers))

portfolio_returns = strategy_returns.dot(weights)

portfolio_equity = (1 + portfolio_returns).cumprod()

portfolio_value = account_size * portfolio_equity

# ==============================
# DRAWDOWN
# ==============================

rolling_max = portfolio_equity.cummax()

drawdown = portfolio_equity / rolling_max - 1

# ==============================
# METRICS
# ==============================

years = len(portfolio_returns) / 252

CAGR = portfolio_equity.iloc[-1]**(1/years) - 1

Sharpe = (portfolio_returns.mean()/portfolio_returns.std()) * np.sqrt(252)

max_dd = drawdown.min()

print("===== PORTFOLIO RESULTS =====")
print("CAGR:",round(CAGR*100,2),"%")
print("Sharpe:",round(Sharpe,2))
print("Max Drawdown:",round(max_dd*100,2),"%")

# ==============================
# EQUITY CURVE
# ==============================

plt.figure(figsize=(14,6))

plt.plot(portfolio_equity)

plt.title("Portfolio Equity Curve")

plt.grid()

plt.show()

# ==============================
# PORTFOLIO DRAWDOWN
# ==============================

plt.figure(figsize=(14,6))

plt.plot(drawdown)

plt.title("Portfolio Drawdown")

plt.grid()

plt.show()

# ==============================
# RETURN DISTRIBUTION
# ==============================

plt.figure(figsize=(10,6))

sns.histplot(portfolio_returns,bins=80,kde=True)

plt.title("Portfolio Return Distribution")

plt.show()

# ==============================
# COVARIANCE HEATMAP
# ==============================

cov_matrix = strategy_returns.cov()

plt.figure(figsize=(12,10))

sns.heatmap(cov_matrix)

plt.title("Strategy Covariance Matrix")

plt.show()

# ==============================
# MONTE CARLO SIMULATION
# ==============================

simulations = 500

days = len(portfolio_returns)

mc_paths = np.zeros((days,simulations))

for i in range(simulations):

    simulated_returns = np.random.choice(
        portfolio_returns,
        size=days,
        replace=True
    )

    mc_paths[:,i] = (1 + simulated_returns).cumprod()

plt.figure(figsize=(14,6))

plt.plot(mc_paths,alpha=0.1)

plt.title("Monte Carlo Sample Paths")

plt.grid()

plt.show()