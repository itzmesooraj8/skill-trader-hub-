from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import asyncpg
import os
import uvicorn
from typing import List, Optional, Dict, Any
from datetime import datetime
from .engine import Backtester
from .execution.portfolio import portfolio_manager
from .data.live_feed import live_data_manager
import asyncio
from .research.walk_forward import WalkForwardValidator

app = FastAPI(title="Skill Trader Hub API")

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
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
DB_NAME = os.getenv("POSTGRES_DB", "skilltrader")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

async def get_market_data_df(symbol: str, limit: Optional[int] = 1000):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        if limit and limit > 0:
            query = 'SELECT * FROM market_data WHERE symbol = $1 ORDER BY timestamp ASC LIMIT $2'
            rows = await conn.fetch(query, symbol, limit)
        else:
            query = 'SELECT * FROM market_data WHERE symbol = $1 ORDER BY timestamp ASC'
            rows = await conn.fetch(query, symbol)
            
        if not rows:
            return pd.DataFrame()
        
        data = [dict(row) for row in rows]
        df = pd.DataFrame(data)
        
        numeric_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = df[col].astype(float)
                
        return df
    finally:
        await conn.close()

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
    return {"message": "Skill Trader Hub Quantum Engine v2.0 is running"}

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
         # For Mock Data Fallback if DB is empty
         if os.getenv("APP_ENV") == "dev":
             # Create dummy DF with date index
             dates = pd.date_range(end=datetime.now(), periods=1000, freq='H')
             df = pd.DataFrame({
                 'open': [50000] * 1000,
                 'high': [51000] * 1000,
                 'low': [49000] * 1000,
                 'close': [50500] * 1000,
                 'volume': [100] * 1000
             }, index=dates)
         else:
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
