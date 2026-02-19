import numpy as np
import pandas as pd
from typing import Dict, Any, List

class MonteCarloSimulator:
    """
    Performs Monte Carlo simulations for price projection and risk assessment.
    """
    
    @staticmethod
    def run_simulation(df: pd.DataFrame, days_ahead: int = 30, num_simulations: int = 1000) -> Dict[str, Any]:
        """
        Simulates future price paths based on historical returns distribution.
        """
        if df.empty or len(df) < 50:
            return {"error": "Insufficient data for simulation"}
            
        # Calculate daily log returns
        df['log_ret'] = np.log(df['close'] / df['close'].shift(1))
        
        # Determine drift and volatility
        mean_return = df['log_ret'].mean()
        var_return = df['log_ret'].var()
        drift = mean_return - (0.5 * var_return)
        stdev = df['log_ret'].std()
        
        last_price = df['close'].iloc[-1]
        
        # Generate random paths
        # Z is random values from normal distribution
        # Price_t = Price_0 * exp(cumsum(drift + stdev * Z))
        
        daily_returns = np.exp(drift + stdev * np.random.normal(0, 1, (days_ahead, num_simulations)))
        
        # Create price paths
        price_paths = np.zeros_like(daily_returns)
        price_paths[0] = last_price * daily_returns[0]
        
        for t in range(1, days_ahead):
            price_paths[t] = price_paths[t-1] * daily_returns[t]
            
        # Final prices distribution
        final_prices = price_paths[-1]
        
        # Calculate percentiles (Confidence Intervals)
        p95 = np.percentile(final_prices, 95) # Bull case
        p50 = np.percentile(final_prices, 50) # Base case
        p05 = np.percentile(final_prices, 5)  # Bear case
        
        # Monte Carlo VaR (Value at Risk) - 95% confidence
        # Maximum expected loss in % from current price
        var_95 = (last_price - p05) / last_price * 100
        
        return {
            "current_price": last_price,
            "projected_range": {
                "bull_case_95": float(p95),
                "base_case_50": float(p50),
                "bear_case_05": float(p05),
            },
            "metrics": {
                "volatility_annualized": float(stdev * np.sqrt(252)),
                "drift_annualized": float(mean_return * 252),
                "var_95_percent": float(var_95)
            },
            "simulation_params": {
                "days_ahead": days_ahead,
                "iterations": num_simulations
            }
        }
