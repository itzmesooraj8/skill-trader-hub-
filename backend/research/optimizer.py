from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np
from engine import Backtester
import logging

logger = logging.getLogger(__name__)

class GridSearchOptimizer:
    def __init__(self, data: pd.DataFrame, strategy_name: str, param_grid: Dict[str, List[Any]], risk_config: Dict[str, Any]):
        self.data = data
        self.strategy_name = strategy_name
        self.param_grid = param_grid
        self.risk_config = risk_config
        self.best_result = None
        self.all_results = []

    def _generate_combinations(self, grid: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        if not grid:
            return [{}]
        
        keys = list(grid.keys())
        first_key = keys[0]
        remaining_grid = {k: grid[k] for k in keys[1:]}
        
        combinations = []
        remaining_combinations = self._generate_combinations(remaining_grid)
        
        for value in grid[first_key]:
            for combo in remaining_combinations:
                new_combo = combo.copy()
                new_combo[first_key] = value
                combinations.append(new_combo)
                
        return combinations

    def optimize(self, metric: str = 'sharpe_ratio') -> Dict[str, Any]:
        combinations = self._generate_combinations(self.param_grid)
        logger.info(f"Running Grid Search with {len(combinations)} combinations for Metric: {metric}")
        
        valid_results = []
        
        for params in combinations:
            try:
                config = {
                    "name": self.strategy_name,
                    "symbol": "OPTIMIZATION", # Dummy
                    "params": params,
                    "risk": self.risk_config
                }
                
                backtester = Backtester(self.data)
                result = backtester.run(config)
                
                # Check for validity (minimum number of trades to be statistically significant)
                if result['metrics']['num_trades'] > 5:
                    result['params'] = params
                    valid_results.append(result)
                    
            except Exception as e:
                logger.error(f"Optimization failed for params {params}: {e}")

        if not valid_results:
             return {"error": "No valid results found"}

        # Sort by metric
        # Handle cases where metric might be win_rate (higher is better) vs max_drawdown (lower is better? usually passed as positive number in result)
        # Assuming higher is better for sharpe, total_return, win_rate, sortino
        
        reverse_sort = True
        if metric == 'max_drawdown': 
             # We want the lowest drawdown (closest to 0). If returned as positive %, we want min.
             reverse_sort = False 

        valid_results.sort(key=lambda x: x['metrics'].get(metric, -999), reverse=reverse_sort)
        
        self.best_result = valid_results[0]
        self.all_results = valid_results
        
        return self.best_result

