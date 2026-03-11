# MT5 Trading Automation Project

A comprehensive Python-based trading automation suite for MT5 with market data access, backtesting, and equity screening capabilities.

## 📁 Project Structure

```
├── backtest_ema_backtrader.py    # EMA crossover backtest (21/50 MA)
├── market_data.py                # Market data module with yfinance
├── examples_market_data.py       # Usage examples & demos
├── built_in_strategies.py        # Pandas-based strategy helpers (EMA, RSI)
├── run_market_suite.py           # One-shot runner for data + screener + strategies
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## 🚀 Features

### 1. Market Data Module (`market_data.py`)
Complete market data interface using yfinance:

- **Ticker**: Single ticker OHLCV data with customizable periods
- **Tickers**: Multiple tickers data fetching
- **Download**: Bulk download for multiple tickers
- **Search**: Search tickers by company name/symbol
- **Sector & Industry**: Get sector and industry classification
- **News**: Latest news articles for any ticker
- **EquityScreener**: Advanced stock screening with custom filters

### 2. Built-in Strategies (`built_in_strategies.py`)
Lightweight pandas strategies you can reuse anywhere:

- EMA crossover signals (21/50 by default)
- RSI mean reversion signals
- Vectorized backtest helper and quick summaries

### 2. EMA Crossover Backtest (`backtest_ema_backtrader.py`)
GBP/USD daily timeframe backtest (2005-2015) using Backtrader:

- **Strategy**: 21 EMA crosses 50 EMA
  - Buy: 21 EMA crosses above 50 EMA
  - Sell: 21 EMA crosses below 50 EMA
- **Risk Management**: SL=20 pips, TP=40 pips
- **Data Source**: yfinance (GBPUSD=X)
- **Initial Capital**: $100,000

## 📦 Installation

### 1. Create Virtual Environment (Recommended)

```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

> Note: yfinance is pulled directly from `github.com/ranaroussi/yfinance` for latest fixes.

**Note**: `TA-Lib` is optional and may require prebuilt binaries on Windows. The project works without it.

## 🎯 Quick Start

### Run EMA Backtest

```bash
python backtest_ema_backtrader.py
```

### Market Data Examples

Run all examples:
```bash
python examples_market_data.py
```

Run specific example:
```bash
python examples_market_data.py 1  # Single ticker
python examples_market_data.py 7  # Equity screener
python examples_market_data.py 9  # Forex data
```

### One-Shot Runner (data + screener + strategies)

```bash
python run_market_suite.py            # run everything
python run_market_suite.py data       # only fetch sample data
python run_market_suite.py screener   # only screener
python run_market_suite.py strategies # only strategy previews
```

## 📊 Usage Examples

### Single Ticker Data

```python
from market_data import MarketData

# Get AAPL data for last year
data = MarketData.get_ticker('AAPL', period='1y', interval='1d')
print(data.tail())

# Get ticker information
info = MarketData.get_ticker_info('AAPL')
print(f"Sector: {info['sector']}, Industry: {info['industry']}")
```

### Multiple Tickers

```python
# Fetch multiple stocks
symbols = ['AAPL', 'MSFT', 'GOOGL']
data_dict = MarketData.get_tickers(symbols, period='6mo')

for symbol, df in data_dict.items():
    print(f"{symbol}: {len(df)} rows")
```

### Bulk Download

```python
# Download multiple tickers efficiently
df = MarketData.download(['AAPL', 'MSFT', 'GOOGL'], 
                        start='2024-01-01', 
                        end='2024-12-31')
```

### Search

```python
# Search for companies
results = MarketData.search('Tesla', max_results=5)
print(results[['symbol', 'shortname', 'exchDisp']])
```

### Equity Screener

```python
from market_data import EquityScreener

# Screen with criteria
screener = EquityScreener()
results = screener.screen_by_criteria(
    symbols=['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'],
    min_market_cap=100_000_000_000,  # $100B minimum
    max_pe=50,  # P/E ratio < 50
    sectors=['Technology']
)
print(results)
```

### Built-in Strategies (Pandas)

```python
from built_in_strategies import ema_crossover_signals, rsi_mean_reversion_signals, backtest_signals
from market_data import MarketData

data = MarketData.get_ticker('AAPL', period='1y', interval='1d')
ema_df = ema_crossover_signals(data, fast=21, slow=50)
stats = backtest_signals(ema_df)
print(stats['total_return'])

rsi_df = rsi_mean_reversion_signals(data)
print(rsi_df[['rsi', 'signal']].tail())
```

### Custom Screener Filters

```python
# Define custom filters
def high_volume_filter(info):
    return info.get('volume', 0) > 10_000_000

screener = EquityScreener()
screener.set_universe(['AAPL', 'MSFT', 'GOOGL'])
screener.add_filter(high_volume_filter, "Volume > 10M")
results = screener.screen()
```

### Forex Data (MT5 Compatible)

```python
# Fetch forex pair data
gbpusd = MarketData.get_ticker('GBPUSD=X', period='1y', interval='1d')
eurusd = MarketData.get_ticker('EURUSD=X', period='1y', interval='1d')
```

## 📚 API Reference

### MarketData Class

| Method | Description | Returns |
|--------|-------------|---------|
| `get_ticker(symbol, period, interval)` | Get single ticker OHLCV data | DataFrame |
| `get_ticker_info(symbol)` | Get ticker metadata | Dict |
| `get_tickers(symbols, period, interval)` | Get multiple tickers | Dict[str, DataFrame] |
| `download(tickers, start, end, period)` | Bulk download data | DataFrame |
| `search(query, max_results)` | Search for tickers | DataFrame |
| `get_sector_industry(symbol)` | Get sector/industry | Dict |
| `get_news(symbol, limit)` | Get latest news | DataFrame |

### EquityScreener Class

| Method | Description |
|--------|-------------|
| `set_universe(symbols)` | Set list of symbols to screen |
| `add_filter(func, description)` | Add custom filter function |
| `screen()` | Apply filters and return results |
| `screen_by_criteria(...)` | Quick screen with common criteria |

## 🔧 Configuration

### Backtest Parameters

Edit [backtest_ema_backtrader.py](backtest_ema_backtrader.py):

```python
params = dict(
    ema1_period=21,        # Fast EMA
    ema2_period=50,        # Slow EMA
    sl_pips=20,            # Stop Loss (pips)
    tp_pips=40,            # Take Profit (pips)
    stake=1000,            # Position size
)
```

### yfinance Periods

- **Period**: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`
- **Interval**: `1m`, `2m`, `5m`, `15m`, `30m`, `60m`, `90m`, `1h`, `1d`, `5d`, `1wk`, `1mo`, `3mo`

## 🛠️ Requirements

- Python 3.8+
- yfinance >= 1.0.0
- pandas >= 2.0.0
- numpy >= 1.23.0
- matplotlib >= 3.7.0
- backtrader >= 1.9.78

See [requirements.txt](requirements.txt) for complete list.

## 📝 Notes

- **Internet Required**: All data fetching requires active internet connection
- **Rate Limits**: yfinance has rate limits; avoid excessive requests
- **Data Quality**: Historical forex data may have gaps; validate before live trading
- **Backtest Limitations**: Past performance ≠ future results
- **MT5 Integration**: This project prepares data; MT5 connection requires MetaTrader5 library (not included)

## 🚧 Future Enhancements

- [ ] MT5 direct integration via `MetaTrader5` Python library
- [ ] Real-time data streaming
- [ ] Advanced technical indicators
- [ ] Multi-strategy backtesting framework
- [ ] Risk management module
- [ ] Performance analytics dashboard
- [ ] Database integration for historical data caching

## 📄 License

This project is for educational purposes. Use at your own risk in live trading.

## 🤝 Contributing

Contributions welcome! Feel free to submit issues or pull requests.

---

**Disclaimer**: Trading involves substantial risk. This software is provided "as is" without warranty. Always validate strategies thoroughly before deploying with real capital.
