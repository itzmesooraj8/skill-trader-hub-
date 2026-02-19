import ccxt.async_support as ccxt
import pandas as pd
import asyncio
import asyncpg
import os
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database Configuration
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "skilltrader")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

async def get_db_connection():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None

async def create_table_if_not_exists(conn):
    try:
        with open("schema.sql", "r") as f:
            sql = f.read()
        await conn.execute(sql)
        logger.info("Schema applied successfully.")
    except Exception as e:
        logger.error(f"Failed to apply schema: {e}")

async def fetch_and_store(symbol, timeframe='1h'):
    """
    Orchestrates fetching and storing data for a single symbol.
    """
    conn = await get_db_connection()
    if not conn:
        return

    try:
        exchange = ccxt.binance()
        logger.info(f"Fetching {timeframe} data for {symbol} from Binance...")
        
        # Calculate start time for 1 year ago
        since = exchange.parse8601((datetime.utcnow() - timedelta(days=365)).isoformat())
        
        all_ohlcv = []
        try:
            while True:
                ohlcv = await exchange.fetch_ohlcv(symbol, timeframe, since, 1000)
                if not ohlcv:
                    break
                
                since = ohlcv[-1][0] + 1  # Next timestamp
                all_ohlcv.extend(ohlcv)
                logger.info(f"Fetched {len(ohlcv)} candles for {symbol}, total: {len(all_ohlcv)}")
                
                # Rate limit
                # await asyncio.sleep(exchange.rateLimit / 1000) 
                
                if len(all_ohlcv) > 24 * 365:
                    break
            
            # Use 'upsert_data' logic inline or separate function
            if all_ohlcv:
                await upsert_data(conn, symbol, all_ohlcv)
                
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
        finally:
            await exchange.close()

    finally:
        await conn.close()

async def upsert_data(conn, symbol, ohlcv_data):
    """
    Upserts OHLCV data into PostgreSQL.
    """
    logger.info(f"Upserting {len(ohlcv_data)} records for {symbol}...")
    
    # Prepare data for executemany
    records = []
    for candle in ohlcv_data:
        # candle: [timestamp, open, high, low, close, volume]
        ts = datetime.utcfromtimestamp(candle[0] / 1000.0)
        records.append((symbol, ts, candle[1], candle[2], candle[3], candle[4], candle[5]))

    query = """
        INSERT INTO market_data (symbol, timestamp, open, high, low, close, volume)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (symbol, timestamp) DO UPDATE
        SET open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume;
    """
    
    try:
        await conn.executemany(query, records)
        logger.info(f"Successfully upserted data for {symbol}.")
    except Exception as e:
        logger.error(f"Failed to upsert data: {e}")

async def main():
    # Ensure schema exists first
    conn = await get_db_connection()
    if not conn:
        logger.error("Could not establish database connection. Exiting.")
        return
    await create_table_if_not_exists(conn)
    await conn.close()

    symbols = ['BTC/USDT', 'ETH/USDT']
    
    # Run fetches concurrently
    tasks = [fetch_and_store(symbol) for symbol in symbols]
    await asyncio.gather(*tasks)
    
    logger.info("Data loading complete.")

if __name__ == "__main__":
    asyncio.run(main())
