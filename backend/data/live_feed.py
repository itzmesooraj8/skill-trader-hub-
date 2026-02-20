from typing import Callable, List, Dict
import logging
from .binance_ws import BinanceWebSocketClient

logger = logging.getLogger(__name__)

class LiveDataManager:
    def __init__(self, symbols: List[str]):
        """
        Manages real-time data fetching using WebSockets for lower latency.
        """
        self.symbols = symbols
        self.client = BinanceWebSocketClient(symbols)
        self.latest_prices: Dict[str, float] = {}

    def register_callback(self, callback: Callable):
        self.client.register_callback(callback)

    async def start(self):
        # Hook into client's latest_prices
        self.client.latest_prices = self.latest_prices
        await self.client.start()

    def stop(self):
        self.client.stop()

# Global instance
live_data_manager = LiveDataManager(['BTC/USDT', 'ETH/USDT'])
