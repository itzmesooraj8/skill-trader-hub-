from typing import Dict, Any, List
from .regime import MarketRegimeDetector
from .fundamentals import FundamentalAnalysis
from .monte_carlo import MonteCarloSimulator
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class InstitutionalAnalyst:
    """
    The 'Brain' of the Stratix Quant Agent.
    Aggregates Regime, Fundamentals, and Monte Carlo into a structured Institutional Analysis.
    """
    
    def __init__(self, data: pd.DataFrame, symbol: str):
        self.data = data
        self.symbol = symbol
        
    def analyze(self) -> Dict[str, Any]:
        """
        Produces the full "Wall Street" standard analysis report.
        """
        logger.info(f"Running Institutional Analysis for {self.symbol}")
        
        # 1. Regime Analysis
        regime = MarketRegimeDetector.detect_regime(self.data)
        
        # 2. Monte Carlo Simulation (Probabilistic Engine)
        simulation = MonteCarloSimulator.run_simulation(self.data, days_ahead=30)
        
        # 3. Fundamental Analysis (Data Layer)
        fundamentals = FundamentalAnalysis.get_fundamentals(self.symbol)
        
        # 4. Construct Probabilistic Scenarios (Synthesis)
        current_price = self.data['close'].iloc[-1] if not self.data.empty else 0
        
        scenarios = self._construct_scenarios(current_price, regime, simulation, fundamentals)
        
        return {
            "symbol": self.symbol,
            "current_price": current_price,
            "timestamp": pd.Timestamp.now().isoformat(),
            "regime_analysis": regime,
            "probabilistic_models": simulation,
            "fundamental_data": fundamentals,
            "institutional_scenarios": scenarios,
            "verdict": self._generate_verdict(regime, scenarios)
        }
        
    def _construct_scenarios(self, price, regime, sim, funds):
        """
        Synthesizes technicals and quant data into narrative scenarios.
        """
        if "error" in sim:
            return {}
            
        vol_regime = regime.get("volatility", "Normal")
        trend = regime.get("trend", "Neutral")
        
        # Bull Case Logic
        bull_target = sim['projected_range']['bull_case_95']
        bull_logic = "Monte Carlo 95th percentile"
        if "Bullish" in trend:
            bull_logic += " + Strong Trend Momentum"
        
        # Bear Case Logic
        bear_target = sim['projected_range']['bear_case_05']
        bear_logic = "Monte Carlo 5th percentile (Downside Risk)"
        if "High Volatility" in vol_regime:
            bear_logic += " + Volatility Expansion Risk"
            
        # Base Case Logic
        base_target = sim['projected_range']['base_case_50']
        
        return {
            "bull_case": {
                "target": round(bull_target, 2),
                "probability": "25%" if "Bearish" in trend else "35%",
                "logic": bull_logic
            },
            "base_case": {
                "target": round(base_target, 2),
                "probability": "50%",
                "logic": f"Statistical drift continuation ({trend})"
            },
            "bear_case": {
                "target": round(bear_target, 2),
                "probability": "35%" if "Bearish" in trend else "15%",
                "logic": bear_logic
            },
            "invalidation_level": {
                "price": round(price * 0.95, 2), # Simplified invalidation
                "logic": "5% Break below current structure"
            }
        }
        
    def _generate_verdict(self, regime, scenarios):
        """
        Generates a concise institutional verdict.
        """
        trend = regime.get("trend", "Neutral")
        return f"{trend} structure detected. Focus on {'Long' if 'Bullish' in trend else 'Short'} setups. Volatility is {regime.get('volatility')}."
