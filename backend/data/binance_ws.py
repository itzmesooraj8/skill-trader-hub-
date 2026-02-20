import asyncio
import json
import logging
import websockets
from typing import List, Callable, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class BinanceWebSocketClient:
    def __init__(self, symbols: List[str], update_interval: int = 1):
        self.symbols = [s.replace('/', '').lower() for s in symbols]
        self.base_url = "wss://stream.binance.com:9443/stream?streams="
        self.callbacks: List[Callable] = []
        self.running = False
        self.latest_prices: Dict[str, float] = {}

    def register_callback(self, callback: Callable):
        self.callbacks.append(callback)

    async def start(self):
        self.running = True
        streams = [f"{s}@ticker" for s in self.symbols]
        url = self.base_url + "/".join(streams)
        
        logger.info(f"Connecting to Binance WebSocket: {url}")
        
        while self.running:
            try:
                async with websockets.connect(url) as websocket:
                    logger.info("Connected to Binance WebSocket")
                    while self.running:
                        message = await websocket.recv()
                        data = json.loads(message)
                        
                        if 'data' in data:
                            ticker = data['data']
                            symbol = ticker['s']
                            # Convert back to slash format if needed, but for now map clean
                            # Binance returns symbol like BTCUSDT
                            
                            # Simple normalization: Insert / before last 3-4 chars? 
                            # Better: maintain a map.
                            normalized_symbol = self._normalize_symbol(symbol)
                            
                            price = float(ticker['c'])
                            self.latest_prices[normalized_symbol] = price
                            
                            event = {
                                'symbol': normalized_symbol,
                                'price': price,
                                'timestamp': ticker['E'],
                                'datetime': datetime.utcfromtimestamp(ticker['E'] / 1000.0).isoformat()
                            }
                            
                            for callback in self.callbacks:
                                if asyncio.iscoroutinefunction(callback):
                                    await callback(event)
                                else:
                                    callback(event)
                                    
            except Exception as e:
                logger.error(f"WebSocket Error: {e}")
                await asyncio.sleep(5) # Reconnect delay

    def _normalize_symbol(self, binance_symbol: str) -> str:
        # Simple heuristic for common pairs
        if binance_symbol.endswith("USDT"):
            return f"{binance_symbol[:-4]}/USDT"
        return binance_symbol

    def stop(self):
        self.running = False
