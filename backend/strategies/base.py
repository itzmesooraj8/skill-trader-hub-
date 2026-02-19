from abc import ABC, abstractmethod
import pandas as pd

class BaseStrategy(ABC):
    """
    Abstract base class for all trading strategies.
    
    Attributes:
        params (dict): Dictionary of strategy parameters (e.g., {'fast_period': 50}).
    """
    def __init__(self, params: dict):
        self.params = params

    @abstractmethod
    def generate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates technical indicators and adds them to the DataFrame.
        """
        pass

    @abstractmethod
    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generates buy/sell signals based on indicators.
        Adds 'signal' column: 1 (Buy), -1 (Sell), 0 (Hold).
        """
        pass
