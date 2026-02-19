import pandas as pd
import numpy as np
from .base import BaseStrategy

class SMACrossover(BaseStrategy):
    """
    Simple Moving Average Crossover Strategy.
    """
    def generate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        fast_period = self.params.get('fast_period', 50)
        slow_period = self.params.get('slow_period', 200)
        
        df['fast_sma'] = df['close'].rolling(window=fast_period).mean()
        df['slow_sma'] = df['close'].rolling(window=slow_period).mean()
        return df

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        # 1 = Buy, 0 = Hold (For crossover logic, we need to detect transitions)
        # Here we start with raw trend signal: 1 if Fast > Slow
        df['signal'] = np.where(df['fast_sma'] > df['slow_sma'], 1, 0)
        return df


class RSIMeanReversion(BaseStrategy):
    """
    RSI Mean Reversion Strategy.
    Buys when RSI < Oversold, Sells when RSI > Overbought.
    """
    def generate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        period = self.params.get('period', 14)
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        return df

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        oversold = self.params.get('oversold', 30)
        overbought = self.params.get('overbought', 70)
        
        # 1 = Buy Signal, -1 = Sell Signal, 0 = Hold
        df['signal'] = np.where(df['rsi'] < oversold, 1, np.where(df['rsi'] > overbought, -1, 0))
        return df


class MomentumBreakout(BaseStrategy):
    """
    Momentum Breakout Strategy.
    Buys when Price > Upper Bollinger Band + Volume Spike.
    """
    def generate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        period = self.params.get('period', 20)
        std_dev_multiplier = self.params.get('std_dev', 2)
        volume_ma_period = self.params.get('volume_ma_period', 20)

        # Bollinger Bands
        df['sma'] = df['close'].rolling(window=period).mean()
        df['std'] = df['close'].rolling(window=period).std()
        df['upper_band'] = df['sma'] + (df['std'] * std_dev_multiplier)
        df['lower_band'] = df['sma'] - (df['std'] * std_dev_multiplier)
        
        # Volume MA
        df['volume_ma'] = df['volume'].rolling(window=volume_ma_period).mean()
        
        return df

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        volume_factor = self.params.get('volume_factor', 1.5)
        
        # Condition: Close > Upper Band AND Volume > Volume MA * factor
        buy_condition = (df['close'] > df['upper_band']) & (df['volume'] > df['volume_ma'] * volume_factor)
        
        # Simple exit: Close < SMA (Mean Reversion) or just standard trail stop logic handled by engine
        # For signal generation, we output 1 for entry
        df['signal'] = np.where(buy_condition, 1, 0)
        
        # Optional: Short signal on Lower Band Breakout
        sell_condition = (df['close'] < df['lower_band']) & (df['volume'] > df['volume_ma'] * volume_factor)
        df['signal'] = np.where(sell_condition, -1, df['signal'])
        
        return df
