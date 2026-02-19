import yfinance as yf
import pandas as pd
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class FundamentalAnalysis:
    """
    Fetches and analyzes fundamental data using yfinance.
    """
    
    @staticmethod
    def get_fundamentals(symbol: str) -> Dict[str, Any]:
        """
        Retrieves key fundamental metrics.
        """
        try:
            # Handle crypto vs stocks
            if "/" in symbol:
                symbol = symbol.replace("/", "-")
            
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Extract key metrics with safety checks
            metrics = {
                "market_cap": info.get("marketCap"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "trailing_pe": info.get("trailingPE"),
                "forward_pe": info.get("forwardPE"),
                "peg_ratio": info.get("pegRatio"),
                "price_to_book": info.get("priceToBook"),
                "profit_margins": info.get("profitMargins"),
                "beta": info.get("beta"),
                "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
                "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
                "currency": info.get("currency"),
                "description": info.get("longBusinessSummary"),
            }
            
            # Simple valuation check
            valuation_status = "Unknown"
            if metrics["trailing_pe"]:
                if metrics["trailing_pe"] < 15:
                    valuation_status = "Undervalued"
                elif metrics["trailing_pe"] > 30:
                    valuation_status = "Overvalued"
                else:
                    valuation_status = "Fair Value"
                    
            metrics["valuation_assessment"] = valuation_status
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error fetching fundamentals for {symbol}: {e}")
            return {"error": "Could not fetch fundamental data", "details": str(e)}
