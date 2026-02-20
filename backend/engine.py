import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from strategies import StrategyFactory
from risk import RiskEngine

class Backtester:
    def __init__(self, data: pd.DataFrame, initial_capital=10000.0, commission=0.001):
        """
        Initializes the Backtester with market data.
        """
        self.data = data.copy()
        if 'timestamp' in self.data.columns:
            self.data['timestamp'] = pd.to_datetime(self.data['timestamp'])
            self.data.set_index('timestamp', inplace=True)
            
        self.initial_capital = initial_capital
        self.commission = commission
        self.results = {}

    def run(self, strategy_config: dict) -> dict:
        """
        Runs the backtest simulation using the new modular Strategy and Risk Engine.
        """
        # 1. Instantiate Strategy
        strategy_name = strategy_config.get('name', 'SMA_Cross')
        strategy_params = strategy_config.get('params', {})
        risk_config = strategy_config.get('risk', {})
        
        try:
            strategy = StrategyFactory.get_strategy(strategy_name, strategy_params)
        except ValueError as e:
            raise ValueError(f"Strategy Error: {e}")

        # 2. Generate Indicators & Raw Signals (Vectorized)
        self.data = strategy.generate_indicators(self.data)
        self.data = strategy.generate_signals(self.data)
        
        # 3. Initialize Risk Engine
        risk_engine = RiskEngine({
            "risk_per_trade": risk_config.get("risk_per_trade", 0.02),
            "max_drawdown_limit": risk_config.get("max_drawdown", 0.20)
        })

        # 4. Simulation Loop (Event-Driven for detailed risk management)
        # We need to simulate trade-by-trade to apply dynamic position sizing and stops
        
        equity = self.initial_capital
        equity_curve = []
        position = 0 # 0 = Flat, 1 = Long, -1 = Short (Simulating net position)
        entry_price = 0.0
        stop_loss = 0.0
        take_profit = 0.0
        trades = []
        
        # Performance optimization: Convert DataFrame to dict for faster iteration
        # In a real high-freq system, we'd use Numba or Cython here.
        # For now, standard loop over rows.
        
        # Calculate ATR if needed for Risk Engine (simplistic ATR)
        if 'high' in self.data.columns and 'low' in self.data.columns and 'close' in self.data.columns:
            high_low = self.data['high'] - self.data['low']
            high_close = np.abs(self.data['high'] - self.data['close'].shift())
            low_close = np.abs(self.data['low'] - self.data['close'].shift())
            tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
            self.data['atr'] = tr.rolling(window=14).mean()
        
        
        max_equity = self.initial_capital
        
        for index, row in self.data.iterrows():
            current_price = row['close']
            atr = row.get('atr', current_price * 0.01) # Fallback ATR
            signal = row.get('signal', 0)
            
            # --- Exit Logic ---
            if position != 0:
                # Check Stop Loss
                if (position == 1 and current_price <= stop_loss) or \
                   (position == -1 and current_price >= stop_loss):
                    # Stop Hit
                    pnl = (stop_loss - entry_price) * position * position_size # Approx fill at SL
                    # Subtract commission
                    cost = (entry_price * position_size * self.commission) + (stop_loss * position_size * self.commission)
                    equity += pnl - cost
                    position = 0
                    trades.append({
                        'date': index, 
                        'type': 'stop_loss', 
                        'price': stop_loss, 
                        'pnl': pnl - cost,
                        'balance': equity
                    })
                
                # Check Take Profit
                elif (position == 1 and current_price >= take_profit) or \
                     (position == -1 and current_price <= take_profit):
                    # TP Hit
                    pnl = (take_profit - entry_price) * position * position_size
                    cost = (entry_price * position_size * self.commission) + (take_profit * position_size * self.commission)
                    equity += pnl - cost
                    position = 0
                    trades.append({
                        'date': index, 
                        'type': 'take_profit', 
                        'price': take_profit, 
                        'pnl': pnl - cost,
                        'balance': equity
                    })
                    
                # Signal Reversal (Strategy Exit)
                elif (position == 1 and signal == -1) or (position == -1 and signal == 1):
                    # Close current position
                    pnl = (current_price - entry_price) * position * position_size
                    cost = (entry_price * position_size * self.commission) + (current_price * position_size * self.commission)
                    equity += pnl - cost
                    position = 0
                    trades.append({
                        'date': index, 
                        'type': 'reversal_exit', 
                        'price': current_price, 
                        'pnl': pnl - cost,
                        'balance': equity
                    })

            # --- Entry Logic ---
            if position == 0 and signal != 0:
                # New Entry
                # 1. Calculate Risk Inputs
                sl_price = risk_engine.calculate_stop_loss(current_price, atr, multiplier=2.0, side=signal)
                tp_price = risk_engine.calculate_take_profit(current_price, sl_price, risk_reward_ratio=2.0)
                
                # 2. Calculate Position Size
                # Assuming max risk 2% of current equity
                risk_amount = equity * risk_engine.risk_per_trade
                risk_per_share = abs(current_price - sl_price)
                if risk_per_share > 0:
                     position_size = risk_amount / risk_per_share
                else:
                     position_size = 0
                
                # Cap position size to Buying Power (simple 1x leverage)
                max_size = equity / current_price
                if position_size > max_size:
                    position_size = max_size
                
                if position_size > 0:
                    entry_price = current_price
                    stop_loss = sl_price
                    take_profit = tp_price
                    position = signal
                    
                    trades.append({
                        'date': index, 
                        'type': 'entry', 
                        'side': 'long' if signal == 1 else 'short',
                        'price': entry_price, 
                        'size': position_size,
                        'sl': stop_loss,
                        'tp': take_profit,
                        'balance': equity
                    })
            
            # Record Equity (Mark to Market)
            unrealized_pnl = 0
            if position != 0:
                unrealized_pnl = (current_price - entry_price) * position * position_size
            
            current_total_equity = equity + unrealized_pnl
            equity_curve.append(current_total_equity)
            
            # --- Max Drawdown Kill Switch ---
            max_equity = max(max_equity, current_total_equity)
            if max_equity > 0:
                current_drawdown = (current_total_equity - max_equity) / max_equity
                if abs(current_drawdown) > risk_engine.max_drawdown:
                    # KILL SWITCH TRIGGERED
                    # Close any open position immediately at current price
                    if position != 0:
                        pnl = (current_price - entry_price) * position * position_size
                        cost = (entry_price * position_size * self.commission) + (current_price * position_size * self.commission)
                        equity += pnl - cost
                        trades.append({
                            'date': index, 
                            'type': 'kill_switch_exit', 
                            'price': current_price, 
                            'pnl': pnl - cost,
                            'balance': equity
                        })
                    break

        # 5. Fill remaining dates in equity curve if loop broke early
        if len(equity_curve) < len(self.data):
            # Fill the rest with the final equity value (flatline)
            remaining = len(self.data) - len(equity_curve)
            equity_curve.extend([equity] * remaining)

        self.data['equity_curve'] = equity_curve # Add to end
        
        # Calculate Metrics from Equity Curve
        equity_series = pd.Series(equity_curve)
        returns = equity_series.pct_change().dropna()
        
        # Risk-Free Rate assumption (0% for simplicity in this context)
        risk_free_rate = 0.0
        
        # 1. Sharpe Ratio
        if returns.std() != 0:
            sharpe_ratio = (returns.mean() - risk_free_rate) / returns.std() * np.sqrt(252 * 24)
        else:
            sharpe_ratio = 0.0
            
        # 2. Sortino Ratio (Downside Deviation)
        negative_returns = returns[returns < 0]
        if len(negative_returns) > 0 and negative_returns.std() != 0:
            sortino_ratio = (returns.mean() - risk_free_rate) / negative_returns.std() * np.sqrt(252 * 24)
        else:
            sortino_ratio = 0.0
            
        # 3. Drawdown
        rolling_max = equity_series.cummax()
        drawdown = equity_series / rolling_max - 1
        max_drawdown = drawdown.min()
        
        # 4. Win Rate & Profit Factor
        winning_trades = [t for t in trades if t['pnl'] > 0]
        losing_trades = [t for t in trades if t['pnl'] < 0]
        
        num_winning = len(winning_trades)
        num_losing = len(losing_trades)
        
        win_rate = (num_winning / len(trades)) * 100 if len(trades) > 0 else 0
        
        gross_profit = sum(t['pnl'] for t in winning_trades)
        gross_loss = abs(sum(t['pnl'] for t in losing_trades))
        
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else float('inf') if gross_profit > 0 else 0
        
        avg_win = (gross_profit / num_winning) if num_winning > 0 else 0
        avg_loss = (sum(t['pnl'] for t in losing_trades) / num_losing) if num_losing > 0 else 0
        
        largest_win = max([t['pnl'] for t in winning_trades]) if winning_trades else 0
        largest_loss = min([t['pnl'] for t in losing_trades]) if losing_trades else 0

        # 5. Calmar Ratio
        calmar_ratio = abs(returns.mean() * 252 * 24 / max_drawdown) if max_drawdown != 0 else 0
        
        total_return = (equity_curve[-1] - self.initial_capital) / self.initial_capital
        
        return {
            "equity_curve": equity_curve,
            "dates": self.data.index.astype(str).tolist(),
            "metrics": {
                "sharpe_ratio": float(sharpe_ratio),
                "sortino_ratio": float(sortino_ratio),
                "calmar_ratio": float(calmar_ratio),
                "max_drawdown": float(max_drawdown * 100), # Return as percentage
                "total_return_percentage": float(total_return * 100),
                "win_rate": float(win_rate),
                "profit_factor": float(profit_factor),
                "num_trades": len(trades),
                "avg_win": float(avg_win),
                "avg_loss": float(avg_loss),
                "largest_win": float(largest_win),
                "largest_loss": float(largest_loss),
                "final_equity": float(equity_curve[-1])
            },
            "trades": trades
        }

if __name__ == "__main__":
    # Test locally
    dates = pd.date_range(start='2023-01-01', periods=1000, freq='H')
    df = pd.DataFrame({
        'timestamp': dates,
        'open': np.random.rand(1000) * 100,
        'high': np.random.rand(1000) * 105,
        'low': np.random.rand(1000) * 95,
        'close': np.random.rand(1000) * 100,
        'volume': np.random.rand(1000) * 1000
    })
    
    bt = Backtester(df)
    res = bt.run({
        "name": "SMA_Cross", 
        "params": {"fast_period": 10, "slow_period": 30},
        "risk": {"risk_per_trade": 0.02}
    })
    print(f"Final Equity: {res['final_equity']}")
