class RiskEngine:
    def __init__(self, config: dict):
        """
        Initializes the Risk Engine with global risk settings.
        
        Args:
            config (dict): Global risk parameters.
                - risk_per_trade (float): % of account to risk per trade (e.g., 0.01 for 1%).
                - max_drawdown_limit (float): Max allowed drawdown before halting trading.
        """
        self.risk_per_trade = config.get('risk_per_trade', 0.02) # Default 2%
        self.max_drawdown = config.get('max_drawdown_limit', 0.20) # Default 20%

    def calculate_position_size(self, account_equity: float, entry_price: float, stop_loss_price: float) -> float:
        """
        Calculates position size based on risk percentage and stop loss distance.
        Formula: (Equity * Risk%) / (Entry - StopLoss)
        """
        if entry_price == stop_loss_price:
            return 0.0
            
        risk_amount = account_equity * self.risk_per_trade
        stop_distance = abs(entry_price - stop_loss_price)
        
        if stop_distance == 0:
            return 0.0
            
        position_size = risk_amount / stop_distance
        
        # Leverage constraints or safety limits could be added here
        # Return amount of base currency (e.g., BTC amount)
        return position_size

    def calculate_stop_loss(self, entry_price: float, atr: float, multiplier: float = 2.0, side: int = 1) -> float:
        """
        Calculates dynamic stop loss based on ATR.
        
        Args:
            side (int): 1 for Long, -1 for Short.
        """
        if side == 1:
            return entry_price - (atr * multiplier)
        else:
            return entry_price + (atr * multiplier)

    def calculate_take_profit(self, entry_price: float, stop_loss_price: float, risk_reward_ratio: float = 2.0) -> float:
        """
        Calculates take profit based on risk-reward ratio.
        """
        risk = abs(entry_price - stop_loss_price)
        if entry_price > stop_loss_price: # Long
            return entry_price + (risk * risk_reward_ratio)
        else: # Short
            return entry_price - (risk * risk_reward_ratio)
