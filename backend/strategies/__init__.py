from .core import SMACrossover, RSIMeanReversion, MomentumBreakout
from .base import BaseStrategy

class StrategyFactory:
    """
    Factory class to instantiate strategy objects.
    """
    @staticmethod
    def get_strategy(name: str, params: dict) -> BaseStrategy:
        if name == "SMA_Cross":
            return SMACrossover(params)
        elif name == "RSI":
            return RSIMeanReversion(params)
        elif name == "Momentum":
            return MomentumBreakout(params)
        else:
            raise ValueError(f"Unknown strategy: {name}")
