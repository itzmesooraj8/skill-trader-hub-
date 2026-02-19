from typing import Dict, List, Optional
from datetime import datetime
import uuid

class Position:
    def __init__(self, symbol: str, side: str, entry_price: float, size: float, stop_loss: float, take_profit: float):
        self.id = str(uuid.uuid4())
        self.symbol = symbol
        self.side = side # 'long' or 'short'
        self.entry_price = entry_price
        self.size = size
        self.stop_loss = stop_loss
        self.take_profit = take_profit
        self.entry_time = datetime.utcnow()
        self.status = 'OPEN'
        self.pnl = 0.0

    def update_pnl(self, current_price: float):
        if self.side == 'long':
            self.pnl = (current_price - self.entry_price) * self.size
        else:
            self.pnl = (self.entry_price - current_price) * self.size
        return self.pnl

class PortfolioManager:
    def __init__(self, initial_capital: float = 10000.0):
        self.initial_capital = initial_capital
        self.balance = initial_capital
        self.positions: Dict[str, Position] = {} # Key by symbol (assuming 1 pos per symbol for simplicity)
        self.trade_history: List[dict] = []
        self.daily_pnl = 0.0
        self.start_of_day_balance = initial_capital

    def open_position(self, symbol: str, side: str, price: float, size: float, sl: float, tp: float):
        """
        Opens a new simulated position.
        """
        if symbol in self.positions:
            raise ValueError(f"Position already exists for {symbol}")
        
        # Check buying power
        cost = price * size
        if cost > self.balance:
            raise ValueError("Insufficient funds")
            
        pos = Position(symbol, side, price, size, sl, tp)
        self.positions[symbol] = pos
        self.balance -= cost # Deduct cost (assuming cash account or margin usage tracking)
        
        self.trade_history.append({
            'id': pos.id,
            'type': 'ENTRY',
            'symbol': symbol,
            'side': side,
            'price': price,
            'size': size,
            'time': pos.entry_time.isoformat()
        })
        return pos

    def close_position(self, symbol: str, exit_price: float, reason: str = 'MANUAL'):
        """
        Closes an existing position.
        """
        if symbol not in self.positions:
            return None
            
        pos = self.positions[symbol]
        pnl = pos.update_pnl(exit_price)
        
        # Return cost + pnl to balance
        cost = pos.entry_price * pos.size
        self.balance += cost + pnl
        
        self.positions.pop(symbol)
        
        record = {
            'id': pos.id,
            'type': 'EXIT',
            'symbol': symbol,
            'side': pos.side,
            'entry_price': pos.entry_price,
            'exit_price': exit_price,
            'pnl': pnl,
            'reason': reason,
            'time': datetime.utcnow().isoformat()
        }
        self.trade_history.append(record)
        
        # Update Daily Stats
        self.daily_pnl += pnl
        
        return record

    def get_portfolio_summary(self):
        """
        Returns current portfolio state.
        """
        total_pnl = sum([p.pnl for p in self.positions.values()])
        equity = self.balance + total_pnl
        
        return {
            "balance": self.balance,
            "equity": equity,
            "positions": [vars(p) for p in self.positions.values()],
            "open_pnl": total_pnl,
            "daily_pnl": self.daily_pnl,
            "num_open_positions": len(self.positions)
        }

# Global Instance
portfolio_manager = PortfolioManager()
