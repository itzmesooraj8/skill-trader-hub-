# Quick Reference Guide - MT5 Trading Project

## 🎯 What You Have

### Files Created:
1. **market_data.py** - Complete market data module
2. **backtest_ema_backtrader.py** - EMA strategy backtest  
3. **examples_market_data.py** - 9 usage examples
4. **built_in_strategies.py** - Pandas EMA/RSI helpers
5. **run_market_suite.py** - One-shot runner (data + screener + strategies)
4. **requirements.txt** - All dependencies
5. **README.md** - Complete documentation
6. **QUICKSTART.md** - This file

## ⚡ Quick Commands

### Install Everything
```powershell
pip install -r requirements.txt
```

> yfinance installs from GitHub (ranaroussi/yfinance) for latest fixes.

### Run Backtest
```powershell
python backtest_ema_backtrader.py
```

### Test Market Data Module
```powershell
python market_data.py
```

### Run Examples
```powershell
# All examples
python examples_market_data.py

# Specific example (1-9)
python examples_market_data.py 7
```

### Run Data + Screener + Strategies Together

```powershell
python run_market_suite.py            # all steps
python run_market_suite.py data       # only data fetch
python run_market_suite.py screener   # only screener
python run_market_suite.py strategies # only strategy previews
```

## 📊 Market Data Module - Key Functions

### Single Ticker
```python
from market_data import MarketData

# Get OHLCV data
data = MarketData.get_ticker('AAPL', period='1y')

# Get ticker info
info = MarketData.get_ticker_info('AAPL')
```

### Multiple Tickers
```python
# Method 1: Individual DataFrames
data_dict = MarketData.get_tickers(['AAPL', 'MSFT', 'GOOGL'])

# Method 2: Bulk download
df = MarketData.download(['AAPL', 'MSFT'], start='2024-01-01', end='2024-12-31')
```

### Search
```python
results = MarketData.search('Tesla', max_results=5)
```

### Sector/Industry
```python
info = MarketData.get_sector_industry('AAPL')
# Returns: {'sector': 'Technology', 'industry': 'Consumer Electronics'}
```

### News
```python
news = MarketData.get_news('AAPL', limit=10)
```

## 🔍 Screener Usage

### Quick Screen
```python
from market_data import EquityScreener

screener = EquityScreener()
results = screener.screen_by_criteria(
    symbols=['AAPL', 'MSFT', 'GOOGL', 'TSLA'],
    min_market_cap=100_000_000_000,  # $100B
    max_pe=50,
    sectors=['Technology']
)
```

### Custom Filters
```python
screener = EquityScreener()
screener.set_universe(['AAPL', 'MSFT', 'GOOGL'])

# Add custom filter
def volume_filter(info):
    return info.get('volume', 0) > 10_000_000

screener.add_filter(volume_filter, "High Volume")
results = screener.screen()
```

## 💱 Forex Data (for MT5)

```python
# Major pairs
gbpusd = MarketData.get_ticker('GBPUSD=X', period='1y', interval='1d')
eurusd = MarketData.get_ticker('EURUSD=X', period='1y', interval='1d')
usdjpy = MarketData.get_ticker('USDJPY=X', period='1y', interval='1d')
```

## 📈 Backtest Configuration

Edit `backtest_ema_backtrader.py`:

```python
params = dict(
    ema1_period=21,     # Fast EMA
    ema2_period=50,     # Slow EMA
    sl_pips=20,         # Stop Loss
    tp_pips=40,         # Take Profit
    stake=1000,         # Position size
)
```

## 🎨 yfinance Cheat Sheet

### Periods
- Short: `1d`, `5d`, `1mo`, `3mo`, `6mo`
- Long: `1y`, `2y`, `5y`, `10y`, `max`
- Special: `ytd` (year-to-date)

### Intervals
- Intraday: `1m`, `5m`, `15m`, `30m`, `1h`
- Daily+: `1d`, `5d`, `1wk`, `1mo`

### Common Tickers
- Stocks: `AAPL`, `MSFT`, `GOOGL`
- Forex: `EURUSD=X`, `GBPUSD=X`, `USDJPY=X`
- Crypto: `BTC-USD`, `ETH-USD`
- Indices: `^GSPC` (S&P 500), `^DJI` (Dow Jones)

## 🚀 Example Workflows

### 1. Screen Tech Stocks
```python
from market_data import EquityScreener

tech_stocks = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMD', 'INTC']
screener = EquityScreener()
results = screener.screen_by_criteria(
    symbols=tech_stocks,
    min_market_cap=50_000_000_000,
    max_pe=40
)
print(results)
```

### 2. Fetch & Analyze Forex
```python
from market_data import MarketData
import pandas as pd

# Get multiple forex pairs
pairs = ['GBPUSD=X', 'EURUSD=X', 'USDJPY=X']
data = MarketData.get_tickers(pairs, period='1y')

# Calculate returns
for pair, df in data.items():
    df['Returns'] = df['Close'].pct_change()
    print(f"{pair} - Last Price: {df['Close'].iloc[-1]:.5f}")
```

### 3. Download & Export Data
```python
from market_data import MarketData

# Download data
df = MarketData.download(['AAPL', 'MSFT'], start='2020-01-01', end='2024-12-31')

# Export to CSV
df.to_csv('stock_data.csv')
```

## 🛠️ Troubleshooting

### Issue: "No data downloaded"
- Check internet connection
- Try alternative ticker (e.g., `GBP=X` instead of `GBPUSD=X`)
- Verify ticker exists on Yahoo Finance

### Issue: "Rate limit exceeded"
- Add delays between requests: `import time; time.sleep(1)`
- Reduce number of tickers in batch

### Issue: Import errors
- Run: `pip install -r requirements.txt`
- Check Python version: `python --version` (need 3.8+)

## 📞 Next Steps

1. ✅ All packages installed
2. ✅ Market data module working
3. ✅ Backtest ready to run
4. 🔲 Connect to MT5 (requires MetaTrader5 library)
5. 🔲 Implement live trading logic
6. 🔲 Add risk management

---

**Ready to start?** Run `python examples_market_data.py` to see everything in action!
