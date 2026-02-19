import os
import asyncio
import ccxt.async_support as ccxt
import logging
from typing import Callable, List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class LiveDataManager:
    def __init__(self, symbols: List[str], update_interval: int = 5):
        """
        Manages real-time data fetching.
        
        Args:
            symbols: List of symbols (e.g., ['BTC/USDT', 'ETH/USDT'])
            update_interval: Seconds between updates
        """
        self.symbols = symbols
        self.update_interval = update_interval
        self.callbacks: List[Callable] = []
        self.running = False
        self.latest_prices: Dict[str, float] = {}

    def register_callback(self, callback: Callable):
        """
        Register a function to be called when new data arrives.
        """
        self.callbacks.append(callback)

    async def start(self):
        self.running = True
        exchange = ccxt.binance()
        try:
            await exchange.load_markets()
        except Exception as e:
            logger.error(f"Failed to load markets: {e}")
            if os.getenv("APP_ENV", "dev") == "dev":
                logger.info("Using MOCK data mode due to specialized network conditions.")
                await self.run_mock_loop()
                await exchange.close()
                return
            await exchange.close()
            return

        logger.info(f"Starting Live Data Feed for {self.symbols}")
        
        consecutive_failures = 0
        try:
            while self.running:
                for symbol in self.symbols:
                    try:
                        ticker = await exchange.fetch_ticker(symbol)
                        price = ticker['last']
                        timestamp = ticker['timestamp']
                        
                        self.latest_prices[symbol] = price
                        
                        data_event = {
                            'symbol': symbol,
                            'price': price,
                            'timestamp': timestamp,
                            'datetime': datetime.utcfromtimestamp(timestamp / 1000.0).isoformat()
                        }
                        
                        for callback in self.callbacks:
                            if asyncio.iscoroutinefunction(callback):
                                await callback(data_event)
                            else:
                                callback(data_event)
                        
                        consecutive_failures = 0 # Reset on success
                                
                    except Exception as e:
                        logger.error(f"Error fetching ticker for {symbol}: {e}")
                        consecutive_failures += 1
                        if consecutive_failures > 5:
                             logger.warning("Too many failures, backing off...")
                             await asyncio.sleep(30)
                             consecutive_failures = 0
                
                await asyncio.sleep(self.update_interval)
        finally:
            await exchange.close()

    async def run_mock_loop(self):
        """Simulate live data for development/offline mode"""
        import random
        prices = {s: 50000.0 if 'BTC' in s else 3000.0 for s in self.symbols}
        
        while self.running:
            for symbol in self.symbols:
                 change = random.uniform(-0.005, 0.005)
                 prices[symbol] *= (1 + change)
                 
                 data_event = {
                    'symbol': symbol,
                    'price': prices[symbol],
                    'timestamp': int(datetime.utcnow().timestamp() * 1000),
                    'datetime': datetime.utcnow().isoformat()
                 }
                 self.latest_prices[symbol] = prices[symbol]
                 for callback in self.callbacks:
                     if asyncio.iscoroutinefunction(callback):
                         await callback(data_event)
                     else:
                         callback(data_event)
            await asyncio.sleep(self.update_interval)

    def stop(self):
        self.running = False

# Global instance for simplicity in this demo
live_data_manager = LiveDataManager(['BTC/USDT', 'ETH/USDT'])
