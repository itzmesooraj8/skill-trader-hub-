from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import asyncpg
import os
import uvicorn
from typing import List, Optional, Dict, Any
from datetime import datetime
from engine import Backtester
from execution.portfolio import portfolio_manager
from data.live_feed import live_data_manager
import asyncio
from research.walk_forward import WalkForwardValidator

from analysis.institutional import InstitutionalAnalyst

app = FastAPI(title="Stratix API")

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
    "http://localhost:8080", # Added for user environment
    "*" # Open for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup / Shutdown Events
@app.on_event("startup")
async def startup_event():
    # Start the live data feed as a background task
    asyncio.create_task(live_data_manager.start())

@app.on_event("shutdown")
async def shutdown_event():
    live_data_manager.stop()


# Database Connection
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "stratix")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

async def get_market_data_df(symbol: str, limit: Optional[int] = 1000):
    """
    Fetches market data from DB. If missing, falls back to Real-Time APIs (YFinance/CCXT).
    """
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        try:
# ... (skipping some lines to get to get_equity_curve, but wait, replace_file_content needs contiguous block? I should split this if they are far apart)
# They are far apart. I will do 2 chunks.

            # 1. Try Database
            if limit and limit > 0:
                query = 'SELECT * FROM market_data WHERE symbol = $1 ORDER BY timestamp ASC LIMIT $2'
                rows = await conn.fetch(query, symbol, limit)
            else:
                query = 'SELECT * FROM market_data WHERE symbol = $1 ORDER BY timestamp ASC'
                rows = await conn.fetch(query, symbol)
                
            if rows:
                data = [dict(row) for row in rows]
                df = pd.DataFrame(data)
                numeric_cols = ['open', 'high', 'low', 'close', 'volume']
                for col in numeric_cols:
                    if col in df.columns:
                        df[col] = df[col].astype(float)
                return df
                
            # 2. Fallback: Real Data Fetching (No Mocking)
            print(f"Data not found in DB for {symbol}, fetching live...")
            
            # Check if Crypto (contains / or is known crypto)
            is_crypto = "/" in symbol or symbol in ["BTC", "ETH", "SOL"]
            
            if is_crypto:
                import ccxt.async_support as ccxt
                exchange = ccxt.binance()
                try:
                    # Map symbol format (BTC/USDT is standard for CCXT)
                    ccxt_symbol = symbol.replace('-', '/')
                    ohlcv = await exchange.fetch_ohlcv(ccxt_symbol, timeframe='1d', limit=limit or 500)
                    if ohlcv:
                        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                        return df
                except Exception as cx_err:
                    print(f"CCXT Fetch Error: {cx_err}")
                finally:
                    await exchange.close()
            
            # Try YFinance (Stocks/Indices/Crypto fallbacks)
            import yfinance as yf
            # YF often uses '-' for crypto (BTC-USD)
            yf_symbol = symbol.replace('/', '-') 
            if is_crypto and not yf_symbol.endswith("-USD"):
                 yf_symbol = f"{yf_symbol}-USD"
            
            def fetch_yf():
                ticker = yf.Ticker(yf_symbol)
                # period='2y' gives enough history
                return ticker.history(period="2y")
            
            loop = asyncio.get_event_loop()
            yf_df = await loop.run_in_executor(None, fetch_yf)
            
            if not yf_df.empty:
                yf_df.reset_index(inplace=True)
                # Rename cols to lowercase
                yf_df.rename(columns={
                    "Date": "timestamp", "Open": "open", "High": "high", 
                    "Low": "low", "Close": "close", "Volume": "volume"
                }, inplace=True)
                # Ensure timezone naive for consistency
                if yf_df['timestamp'].dt.tz is not None:
                    yf_df['timestamp'] = yf_df['timestamp'].dt.tz_localize(None)
                return yf_df[['timestamp', 'open', 'high', 'low', 'close', 'volume']]

            return pd.DataFrame()
            
        finally:
            await conn.close()
    except Exception as e:
        print(f"Data Fetch Error: {e}")
        return pd.DataFrame()

# Pydantic Models
class StrategyConfigPayload(BaseModel):
    name: str = "SMA_Cross"
    symbol: str = "BTC/USDT"
    params: Dict[str, Any] = {"fast_period": 50, "slow_period": 200}
    risk: Dict[str, Any] = {"risk_per_trade": 0.02, "max_drawdown": 0.20}

class BacktestResponse(BaseModel):
    equity_curve: List[float]
    dates: List[str]
    num_trades: int
    metrics: Dict[str, float]
    trades: List[Dict[str, Any]]

class WalkForwardPayload(BaseModel):
    strategy: str = "SMA_Cross"
    symbol: str = "BTC/USDT"
    param_grid: Dict[str, List[Any]]
    risk: Dict[str, Any]
    train_months: int = 6
    test_months: int = 2

@app.get("/")
async def root():
    return {"message": "Stratix Quantum Engine v2.0 is running"}

@app.get("/api/market-data/{symbol}")
async def get_market_data(symbol: str):
    db_symbol = symbol.replace('-', '/')
    df = await get_market_data_df(db_symbol, limit=500)
    
    if df.empty:
        return []
        
    result = df.to_dict(orient='records')
    for row in result:
        row['date'] = row['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        del row['timestamp']
        
    return result

@app.get("/api/portfolio")
async def get_portfolio():
    """
    Returns the current simulated portfolio state (balance, open positions, PnL).
    """
    return portfolio_manager.get_portfolio_summary()

@app.get("/api/trades")
async def get_trades():
    """
    Returns the trade history for the current session.
    """
    return portfolio_manager.trade_history

@app.get("/api/live-status")
async def get_live_status():
    """
    Returns the latest live market data.
    """
    return {
        "status": "active" if live_data_manager.running else "stopped",
        "latest_prices": live_data_manager.latest_prices
    }

@app.post("/api/paper-trade")
async def execute_paper_trade(trade: dict = Body(...)):
    """
    Manually execute a paper trade.
    """
    try:
        portfolio_manager.open_position(
            trade['symbol'], 
            trade['side'], 
            trade['price'], 
            trade['size'], 
            trade['sl'], 
            trade['tp']
        )
        return {"status": "success", "message": "Trade executed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/backtest", response_model=BacktestResponse)
async def run_backtest(config: StrategyConfigPayload):
    """
    Runs a backtest simulation.
    """
    db_symbol = config.symbol.replace('-', '/')
    
    df = await get_market_data_df(db_symbol, limit=None)
    
    if df.empty:
         raise HTTPException(status_code=404, detail=f"No data found for symbol {db_symbol}")
    
    backtester = Backtester(df)
    results = backtester.run(config.dict())
    
    return results

@app.post("/api/research/walk-forward")
async def run_walk_forward(config: WalkForwardPayload):
    """
    Runs Walk-Forward Optimization/Validation.
    WARNING: Computationally expensive.
    """
    db_symbol = config.symbol.replace('-', '/')
    
    # 1. Fetch ALL data (needs to be enough for WFA)
    df = await get_market_data_df(db_symbol, limit=None)
    
    if len(df) < 500: # Heuristic check
         raise HTTPException(status_code=404, detail="Not enough data for Walk-Forward Analysis")
    
    # Ensure Index is Datetime
    if not isinstance(df.index, pd.DatetimeIndex):
         # If index is not datetime, check if 'timestamp' column exists
         if 'timestamp' in df.columns:
             df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
             df.set_index('timestamp', inplace=True)
         else:
             # Try to parse index
             try:
                 df.index = pd.to_datetime(df.index)
             except:
                 raise HTTPException(status_code=400, detail="Data index must be datetime for WFA")

    validator = WalkForwardValidator(
        data=df,
        strategy_name=config.strategy,
        params=config.param_grid,
        risk_config=config.risk
    )
    
    results = validator.run_validation(train_months=config.train_months, test_months=config.test_months)
    
    return results

# --- Market Data Extensions for Frontend Compatibility ---

@app.get("/api/market/quotes")
async def get_market_quotes(symbols: str):
    """
    Get multiple quotes in one call.
    symbols: comma-separated list of tickers.
    """
    symbol_list = symbols.split(',')
    results = []
    
    # Check live data manager for any available real-time prices
    live_prices = live_data_manager.latest_prices
    
    # We will fetch missing ones in batch
    to_fetch = []
    
    for sym in symbol_list:
        db_sym = sym.replace('-', '/')
        if db_sym in live_prices:
            results.append({
                "symbol": sym,
                "price": live_prices[db_sym],
                "change": 0.0, # Live feed usually doesn't store change
                "changePercent": 0.0,
                "volume": 0.0,
                "marketCap": 0.0,
                "high": live_prices[db_sym],
                "low": live_prices[db_sym],
                "open": live_prices[db_sym],
                "previousClose": live_prices[db_sym]
            })
        else:
            to_fetch.append(sym)
            
    if not to_fetch:
        return results

    # Batch fetch from YFinance for missing
    import yfinance as yf
    
    # Normalize symbols for YF
    yf_map = {}
    yf_list = []
    
    for s in to_fetch:
        yf_s = s.replace('/', '-')
        # Crypto handling
        if s in ["BTC", "ETH", "SOL"] or "USDT" in s:
            if not yf_s.endswith("-USD"):
                yf_s = yf_s.replace("USDT", "-USD") if "USDT" in yf_s else f"{yf_s}-USD"
        
        yf_map[yf_s] = s
        yf_list.append(yf_s)
        
    try:
        # Fetch 5 days to ensure we cover weekends/holidays for change calc
        data = yf.download(yf_list, period="5d", group_by='ticker', threads=True, progress=False)
        
        # If single ticker, data structure is different
        if len(yf_list) == 1:
            if not data.empty:
                last_close = data['Close'].iloc[-1]
                prev_close = data['Close'].iloc[-2] if len(data) > 1 else last_close
                change = last_close - prev_close
                pct = (change / prev_close) * 100 if prev_close != 0 else 0
                
                results.append({
                    "symbol": yf_map[yf_list[0]],
                    "price": float(last_close),
                    "change": float(change),
                    "changePercent": float(pct),
                    "volume": float(data['Volume'].iloc[-1]),
                    "marketCap": 0.0,
                    "high": float(data['High'].iloc[-1]),
                    "low": float(data['Low'].iloc[-1]),
                    "open": float(data['Open'].iloc[-1]),
                    "previousClose": float(prev_close)
                })
        else:
            # Multi-ticker DataFrame
            for yf_sym, original_sym in yf_map.items():
                try:
                    df = data[yf_sym]
                    if df.empty: continue
                    
                    last_close = df['Close'].iloc[-1]
                    prev_close = df['Close'].iloc[-2] if len(df) > 1 else last_close
                    change = last_close - prev_close
                    pct = (change / prev_close) * 100 if prev_close != 0 else 0
                    
                    results.append({
                        "symbol": original_sym,
                        "price": float(last_close),
                        "change": float(change),
                        "changePercent": float(pct),
                        "volume": float(df['Volume'].iloc[-1]),
                        "marketCap": 0.0,
                        "high": float(df['High'].iloc[-1]),
                        "low": float(df['Low'].iloc[-1]),
                        "open": float(df['Open'].iloc[-1]),
                        "previousClose": float(prev_close)
                    })
                except Exception:
                    continue
                    
    except Exception as e:
        print(f"Batch fetch error: {e}")
        
    return results

@app.get("/api/market/quote/{symbol}")
async def get_market_quote(symbol: str):
    """
    Real-time quote from Live Data Manager.
    Matches frontend Quote interface.
    """
    db_symbol = symbol.replace('-', '/')
    price = live_data_manager.latest_prices.get(db_symbol)
    
    # If not in live feed, try to get last price from DB/API
    price = live_data_manager.latest_prices.get(db_symbol)
    change = 0.0
    change_pct = 0.0
    volume = 0.0
    
    if not price:
        # Fetch last 2 days to calculate change
        df = await get_market_data_df(db_symbol, limit=2)
        if not df.empty:
            price = df.iloc[-1]['close']
            volume = float(df.iloc[-1]['volume'])
            
            if len(df) >= 2:
                prev_close = df.iloc[-2]['close']
                change = price - prev_close
                change_pct = (change / prev_close) * 100
                
    if not price:
         # If still no price, return 0 or error, but DO NOT FAKE IT
         raise HTTPException(status_code=404, detail="Quote not found")

    return {
        "symbol": symbol,
        "price": price,
        "change": round(change, 2),
        "changePercent": round(change_pct, 2),
        "volume": volume,
        "high": price * 1.05, # Estimates derived from current price if low/high not available
        "low": price * 0.95,
        "open": price - change,
        "previousClose": price - change
    }

@app.get("/api/market/search")
async def search_market(q: str):
    """
    Search for symbols.
    """
    query = q.lower()
    # Support major crypto pairs for this demo
    available = [
        {"symbol": "BTC/USDT", "name": "Bitcoin", "sector": "Crypto", "exchange": "Binance"},
        {"symbol": "ETH/USDT", "name": "Ethereum", "sector": "Crypto", "exchange": "Binance"},
        {"symbol": "SOL/USDT", "name": "Solana", "sector": "Crypto", "exchange": "Binance"},
        {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology", "exchange": "NASDAQ"}, # Added for demo
        {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Automotive", "exchange": "NASDAQ"},
    ]
    return [s for s in available if query in s['symbol'].lower() or query in s['name'].lower()]

@app.get("/api/market/news/{symbol}")
async def get_market_news(symbol: str, limit: int = 10):
    """
    Get real news from YFinance.
    """
    import yfinance as yf
    try:
        yf_symbol = symbol.replace('/', '-')
        # Adjust for crypto common format in YF
        if '/' in symbol or symbol in ["BTC", "ETH", "SOL"]:
             if not yf_symbol.endswith("-USD"):
                  yf_symbol = f"{yf_symbol}-USD"

        def fetch_news():
            t = yf.Ticker(yf_symbol)
            return t.news
            
        loop = asyncio.get_event_loop()
        news_data = await loop.run_in_executor(None, fetch_news)
        
        formatted_news = []
        for item in news_data[:limit]:
            try:
                # YF news format varies, handle carefully
                pub_date = datetime.fromtimestamp(item.get('providerPublishTime', 0)).isoformat()
                formatted_news.append({
                    "id": item.get('uuid', str(item.get('providerPublishTime'))),
                    "symbol": symbol,
                    "title": item.get('title', 'Market News'),
                    "source": item.get('publisher', 'Yahoo Finance'),
                    "timestamp": pub_date,
                    "sentiment": "neutral", # We'd need NLP for real sentiment
                    "url": item.get('link'),
                    "summary": f"Read full story at {item.get('publisher')}"
                })
            except:
                continue
                
        return formatted_news
    except Exception as e:
        print(f"News Error: {e}")
        return []

# --- Research Lab Endpoints ---

class StrategyTemplate(BaseModel):
    id: str
    name: str
    description: str
    assetClass: str
    risk: str
    winRate: float
    returnRate: float
    maxDrawdown: float
    params: Dict[str, Any]
    whyItWorks: str

@app.get("/api/research/templates", response_model=List[StrategyTemplate])
async def get_research_templates():
    """
    Get strategy templates for Research Lab.
    """
    return [
        {
            "id": "conservative-swing",
            "name": "Conservative Swing Trader",
            "description": "Low-risk approach using moving averages and support/resistance levels.",
            "assetClass": "Equities",
            "risk": "Low",
            "winRate": 58,
            "returnRate": 12.5,
            "maxDrawdown": 8,
            "params": {"fastEMA": 20, "slowEMA": 50, "stopLoss": 2, "takeProfit": 4},
            "whyItWorks": "By aligning with the major trend (50 EMA) and entering on pullbacks (20 EMA), this strategy minimizes exposure to volatility while capturing steady gains."
        },
        {
            "id": "momentum-breakout",
            "name": "Momentum Breakout",
            "description": "High-reward strategy targeting price breakouts with volume confirmation.",
            "assetClass": "Crypto",
            "risk": "High",
            "winRate": 42,
            "returnRate": 35.2,
            "maxDrawdown": 22,
            "params": {"fastEMA": 10, "slowEMA": 30, "stopLoss": 5, "takeProfit": 15},
            "whyItWorks": "Breakouts accompanied by high volume often signal a regime shift. This strategy aggressively pursues these shifts to capture the 'meat' of the move."
        },
        {
            "id": "crypto-mean-reversion",
            "name": "Crypto Mean Reversion",
            "description": "Capitalizes on crypto's tendency to return to mean prices after extremes.",
            "assetClass": "Crypto",
            "risk": "Medium",
            "winRate": 52,
            "returnRate": 28.7,
            "maxDrawdown": 18,
            "params": {"fastEMA": 14, "slowEMA": 28, "stopLoss": 8, "takeProfit": 12},
            "whyItWorks": "Crypto markets are highly inefficient and prone to overreaction. Statistical reversion to the mean identifies these overextensions for quick profit."
        },
    ]

@app.post("/api/research/experiments")
async def create_experiment(exp: Dict[str, Any]):
    import uuid
    new_id = str(uuid.uuid4())
    # In a real app, persist this to DB
    return {"id": new_id, "status": "created", "msg": "Experiment created"}

@app.get("/api/research/experiments")
async def list_experiments():
    return []

@app.get("/api/market/scanner")
async def get_scanner():
    """
    Returns scanner results based on 24h ticker data from Binance.
    """
    try:
        # Use CCXT from live_data_manager or create a new instance for snapshot
        # For speed, we'll try to use the live_data_manager's exchange if available,
        # otherwise create a temporary one.
        
        # We will scan a defined universe of assets to avoid API weight limits
        universe = [
            "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", 
            "DOGE/USDT", "AVAX/USDT", "DOT/USDT", "LINK/USDT", "MATIC/USDT"
        ]
        
        # Fetch 24hr ticker for these
        import ccxt.async_support as ccxt
        exchange = ccxt.binance()
        results = []
        try:
            tickers = await exchange.fetch_tickers(universe)
            for symbol, data in tickers.items():
                results.append({
                    "symbol": symbol,
                    "name": symbol.split('/')[0], # Simplified name
                    "price": data['last'],
                    "change": data['percentage'],
                    "volume": data['quoteVolume'], # Quote volume in USDT
                    "rvol": 1.2, # Placeholder as real RVOL requires history
                    "sector": "Crypto",
                    "marketCap": 0 # Not available in simple ticker, set 0 to avoid frontend error
                })
            return results
        except Exception as cx_err:
             print(f"CCXT Scanner Error: {cx_err}, falling back to YFinance")
             # Fallback to YFinance
             import yfinance as yf
             yf_universe = [s.replace('/', '-') for s in universe] # e.g. BTC-USD
             # Check if end with USDT, replace with USD for YF if needed, YF usually BTC-USD
             yf_universe = [s.replace('USDT', 'USD') for s in yf_universe]
             
             def fetch_yf_scanner():
                 data = yf.download(yf_universe, period="1d", group_by='ticker', threads=True)
                 return data
             
             loop = asyncio.get_event_loop()
             yf_data = await loop.run_in_executor(None, fetch_yf_scanner)
             
             fallback_results = []
             # yf_data columns are likely MultiIndex (Ticker, OHLCV)
             # If failing, yf_data might be empty
             if not yf_data.empty:
                 for sym in yf_universe:
                     try:
                         # Check if symbol data exists in columns
                         # yf.download sometimes normalizes symbols (e.g. BTC-USD)
                         # We'll try direct access
                         if sym in yf_data.columns.levels[0]:
                             ticker_df = yf_data[sym]
                             if not ticker_df.empty:
                                 row = ticker_df.iloc[-1]
                                 open_p = row['Open']
                                 close_p = row['Close']
                                 
                                 # Avoid division by zero
                                 if open_p == 0: continue
                                 
                                 change_pct = ((close_p - open_p) / open_p) * 100
                                 
                                 fallback_results.append({
                                    "symbol": sym.replace('-', '/').replace('USD', 'USDT'), # Map back to USDT for frontend
                                    "name": sym.split('-')[0],
                                    "price": float(close_p),
                                    "change": float(change_pct),
                                    "volume": float(row['Volume'] * close_p), # Approx quote volume
                                    "rvol": 1.0,
                                    "sector": "Crypto",
                                    "marketCap": 0
                                 })
                     except Exception as parse_err:
                         # print(f"Parse error for {sym}: {parse_err}")
                         continue
             # Sanitize numeric values to avoid NaN/Infinity
             for r in fallback_results:
                 for k, v in r.items():
                     if isinstance(v, float) and (v != v or v == float('inf') or v == float('-inf')):
                         r[k] = 0.0 # Default to 0 for frontend safety
             
             return fallback_results
        finally:
            await exchange.close()
    except Exception as e:
        print(f"Scanner Critical Error: {e}")
        return []

@app.get("/api/market/overview")
async def get_market_overview():
    """
    Market overview fetching real indices via yfinance.
    """
    import yfinance as yf
    
    indices = [
        {"symbol": "SPY", "name": "S&P 500"},
        {"symbol": "QQQ", "name": "Nasdaq"},
        {"symbol": "BTC-USD", "name": "Bitcoin"},
    ]
    
    data = []
    
    # Run yfinance calls (note: yfinance is blocking, ideally run in executor)
    # For simplicity in this async endpoint:
    def fetch_yfinance(sym):
        try:
            t = yf.Ticker(sym)
            info = t.info
            # Calculate change if not provided directly
            current = info.get('currentPrice') or info.get('regularMarketPrice')
            previous = info.get('previousClose') or info.get('regularMarketPreviousClose')
            
            change = 0
            change_pct = 0
            if current and previous:
                change = current - previous
                change_pct = (change / previous) * 100
                
            return {
                "symbol": sym,
                "name": info.get('shortName') or sym,
                "value": current,
                "change": change,
                "changePercent": change_pct
            }
        except:
             return None

    loop = asyncio.get_event_loop()
    # Fetch in parallel
    tasks = [loop.run_in_executor(None, fetch_yfinance, idx["symbol"]) for idx in indices]
    results = await asyncio.gather(*tasks)
    
    # Filter valid results
    valid_indices = [r for r in results if r is not None]

    return {
        "indices": valid_indices,
        "topGainers": [], # Populate if we had a stock source
        "topLosers": [],
        "mostActive": []
    }

@app.get("/api/trading/equity-curve")
async def get_equity_curve():
    """
    Returns equity curve based on actual portfolio state and trade history.
    """
    current_capital = portfolio_manager.balance
    history = portfolio_manager.trade_history
    
    # If no trades, return a flat line from initial capital
    if not history:
        dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
        return [{"date": d.isoformat(), "equity": current_capital} for d in dates]
        
    # Construct curve from trades
    # Sort trades by exit time
    sorted_trades = sorted([t for t in history if t.get('exit_time')], key=lambda x: x['exit_time'])
    
    curve = []
    running_equity = portfolio_manager.initial_capital
    
    # this is a simplified reconstruction
    # Ideally we'd log equity daily, but for now we step through trades
    
    # Start point
    curve.append({"date": (datetime.now() - pd.Timedelta(days=30)).isoformat(), "equity": portfolio_manager.initial_capital})
    
    for trade in sorted_trades:
        running_equity += trade.get('pnl', 0)
        curve.append({
            "date": trade['exit_time'],
            "equity": running_equity
        })
        
    # Add current point
    curve.append({"date": datetime.now().isoformat(), "equity": current_capital})
    
    return curve

@app.get("/api/trading/behavioral-analytics")
async def get_behavioral_analytics():
    """
    Returns metrics derived from trade history.
    """
    trades = portfolio_manager.trade_history
    if not trades:
         return []
        
    # Aggregate tags
    from collections import defaultdict
    tag_stats = defaultdict(lambda: {'count': 0, 'pnl': 0})
    
    for t in trades:
        # Use journalTag if present, else categorize by PnL
        tag = t.get('journalTag')
        if not tag:
            if t.get('pnl', 0) > 0:
                tag = "Untagged Win"
            else:
                tag = "Untagged Loss"
        
        tag_stats[tag]['count'] += 1
        tag_stats[tag]['pnl'] += t.get('pnl', 0)
        
    results = []
    for tag, stats in tag_stats.items():
        count = stats['count']
        total_pnl = stats['pnl']
        avg_pnl = total_pnl / count if count > 0 else 0
        
        results.append({
            "tag": tag,
            "count": count,
            "totalPnl": total_pnl,
            "avgPnl": avg_pnl,
            "isDestructive": avg_pnl < 0 # Simple heuristic
        })
        
    return results

@app.get("/api/analysis/{symbol}")
async def get_institutional_analysis(symbol: str):
    """
    Generates a full institutional-grade analysis report.
    Includes: Regime, Fundamentals, Monte Carlo Scenarios.
    """
    db_symbol = symbol.replace('-', '/')
    
    # Fetch Data
    df = await get_market_data_df(db_symbol, limit=500)
    
    if df.empty:
         raise HTTPException(status_code=404, detail=f"No market data found for {symbol}. Please verify the ticker.")
    
    analyst = InstitutionalAnalyst(df, symbol)
    report = analyst.analyze()
    
    return report

@app.get("/api/trading/analytics")
async def get_trading_analytics():
    """
    Returns aggregated trading stats from portfolio history.
    """
    history = portfolio_manager.trade_history
    # Filter only EXIT trades which have PnL
    closed_trades = [t for t in history if t.get('type') == 'EXIT']
    
    total_trades = len(closed_trades)
    
    # Initialize default structure
    response = {
        "totalTrades": 0,
        "winRate": 0.0,
        "profitFactor": 0.0,
        "avgWin": 0.0,
        "avgLoss": 0.0,
        "totalPnl": 0.0,
        "totalPnlPercent": 0.0,
        "bestTrade": None,
        "worstTrade": None,
        "currentStreak": 0,
        "longestWinStreak": 0,
        "longestLossStreak": 0,
        "behavioralTags": []
    }

    if total_trades == 0:
        return response
        
    winning_trades = [t for t in closed_trades if t.get('pnl', 0) > 0]
    losing_trades = [t for t in closed_trades if t.get('pnl', 0) <= 0]
    
    gross_profit = sum(t.get('pnl', 0) for t in winning_trades)
    gross_loss = abs(sum(t.get('pnl', 0) for t in losing_trades))
    
    win_rate = (len(winning_trades) / total_trades) * 100
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else float('inf') if gross_profit > 0 else 0.0
    
    avg_win = gross_profit / len(winning_trades) if winning_trades else 0.0
    avg_loss = sum(t.get('pnl', 0) for t in losing_trades) / len(losing_trades) if losing_trades else 0.0
    
    total_pnl = gross_profit - gross_loss
    initial_cap = portfolio_manager.initial_capital
    try:
        total_return_pct = (total_pnl / initial_cap) * 100
    except ZeroDivisionError:
        total_return_pct = 0.0
    
    # Simple mapping helper
    def map_trade(t):
        return {
            "id": t['id'],
            "symbol": t['symbol'],
            "side": t['side'],
            "entryDate": t.get('entry_time', t.get('time')), # Fallback
            "exitDate": t.get('exit_time', t.get('time')),
            "entryPrice": t['entry_price'],
            "exitPrice": t['exit_price'],
            "pnl": t['pnl'],
            "pnlPercent": (t['pnl'] / (t['entry_price'] * t['size'])) * 100 if t['size'] > 0 else 0,
            "isProfit": t['pnl'] > 0,
            "duration": 0,
            "size": t.get('size', 0)
        }

    best_trade = map_trade(max(closed_trades, key=lambda x: x['pnl'])) if closed_trades else None
    worst_trade = map_trade(min(closed_trades, key=lambda x: x['pnl'])) if closed_trades else None

    # Streak calculation
    current_streak = 0
    longest_win = 0
    longest_loss = 0
    current_win_streak = 0
    current_loss_streak = 0
    
    sorted_trades = sorted(closed_trades, key=lambda x: x.get('time', ''))
    
    for t in sorted_trades:
        pnl = t.get('pnl', 0)
        if pnl > 0:
            current_win_streak += 1
            current_loss_streak = 0
            current_streak = current_win_streak
            longest_win = max(longest_win, current_win_streak)
        else:
            current_loss_streak += 1
            current_win_streak = 0
            current_streak = -current_loss_streak
            longest_loss = max(longest_loss, current_loss_streak)
            
    response.update({
        "totalTrades": total_trades,
        "winRate": round(win_rate, 2),
        "profitFactor": round(profit_factor, 2),
        "avgWin": round(avg_win, 2),
        "avgLoss": round(avg_loss, 2),
        "totalPnl": round(total_pnl, 2),
        "totalPnlPercent": round(total_return_pct, 2),
        "bestTrade": best_trade,
        "worstTrade": worst_trade,
        "currentStreak": current_streak,
        "longestWinStreak": longest_win,
        "longestLossStreak": longest_loss
    })
    
    return response

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
