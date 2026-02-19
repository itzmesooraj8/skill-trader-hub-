import pandas as pd
import numpy as np
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class MarketRegimeDetector:
    """
    Detects market regimes: Volatility, Trend, and Liquidity.
    """
    
    @staticmethod
    def detect_regime(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyzing OHLCV data to determine current market regime.
        Expects df with 'close', 'high', 'low', 'volume'.
        """
        if df.empty or len(df) < 50:
            return {"regime": "Insufficient Data"}
            
        try:
            # 1. Trend Regime (SMA + ADX proxy)
            # Using simple SMA slope and relation for robustness
            df['sma_50'] = df['close'].rolling(window=50).mean()
            df['sma_200'] = df['close'].rolling(window=200).mean()
            
            current_close = df['close'].iloc[-1]
            sma_50 = df['sma_50'].iloc[-1]
            sma_200 = df['sma_200'].iloc[-1]
            
            trend = "Neutral"
            if current_close > sma_50 > sma_200:
                trend = "Strong Bullish"
            elif current_close < sma_50 < sma_200:
                trend = "Strong Bearish"
            elif current_close > sma_200:
                trend = "Mild Bullish"
            elif current_close < sma_200:
                trend = "Mild Bearish"
                
            # 2. Volatility Regime (ATR / Historical Vol)
            df['tr'] = np.maximum(
                df['high'] - df['low'],
                np.abs(df['high'] - df['close'].shift(1))
            )
            df['atr_14'] = df['tr'].rolling(window=14).mean()
            
            current_atr = df['atr_14'].iloc[-1]
            avg_atr = df['atr_14'].rolling(window=50).mean().iloc[-1]
            
            volatility = "Normal"
            if current_atr > avg_atr * 1.5:
                volatility = "High Volatility"
            elif current_atr < avg_atr * 0.7:
                volatility = "Low Volatility (Squeeze)"
                
            # 3. Liquidity/Volume Regime
            avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
            current_volume = df['volume'].iloc[-1]
            
            liquidity = "Normal"
            if current_volume > avg_volume * 1.5:
                liquidity = "High Volume"
            elif current_volume < avg_volume * 0.6:
                liquidity = "Low Liquidity"
                
            # 4. Composite Regime Tag
            regime_tag = f"{trend} / {volatility}"
            
            return {
                "trend": trend,
                "volatility": volatility,
                "liquidity": liquidity,
                "summary": regime_tag,
                "metrics": {
                    "sma_50_dist_pct": (current_close - sma_50) / sma_50 * 100 if sma_50 else 0,
                    "atr_ratio": current_atr / avg_atr if avg_atr else 1,
                    "volume_ratio": current_volume / avg_volume if avg_volume else 1
                }
            }
            
        except Exception as e:
            logger.error(f"Error detecting regime: {e}")
            return {"error": str(e)}
