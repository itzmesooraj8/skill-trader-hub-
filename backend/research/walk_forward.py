from typing import Dict, Any, List
import pandas as pd
from datetime import timedelta
import logging
from engine import Backtester
from research.optimizer import GridSearchOptimizer

logger = logging.getLogger(__name__)

class WalkForwardValidator:
    def __init__(self, data: pd.DataFrame, strategy_name: str, params: Dict[str, List[Any]], risk_config: Dict[str, Any]):
        self.data = data
        self.strategy_name = strategy_name
        self.params_grid = params
        self.risk_config = risk_config

    def run_validation(self, train_months: int = 6, test_months: int = 2) -> Dict[str, Any]:
        """
        Runs Walk-Forward Optimization.
        
        1. Segments data into rolling Train/Test windows.
        2. Optimizes on Train window.
        3. Tests best params on Test window.
        4. Aggregates results to form an Out-of-Sample equity curve.
        """
        
        # Ensure data is sorted by date
        self.data = self.data.sort_index()
        
        start_date = self.data.index.min()
        end_date = self.data.index.max()
        
        current_train_start = start_date
        
        overall_results = {
            "windows": [],
            "aggregated_metrics": {},
            "equity_curve": [], # Joined OOS curve
        }
        
        train_window = timedelta(days=train_months * 30)
        test_window = timedelta(days=test_months * 30)
        
        logger.info(f"Starting WFA from {start_date} to {end_date}")
        
        current_equity = self.risk_config.get("initial_capital", 10000)
        
        while current_train_start + train_window + test_window <= end_date:
            train_end = current_train_start + train_window
            test_start = train_end
            test_end = test_start + test_window
            
            # Slice Data
            train_data = self.data.loc[current_train_start:train_end]
            test_data = self.data.loc[test_start:test_end]
            
            if train_data.empty or test_data.empty:
                break
                
            # 1. optimize on Train
            optimizer = GridSearchOptimizer(
                data=train_data,
                strategy_name=self.strategy_name,
                param_grid=self.params_grid,
                risk_config=self.risk_config
            )
            
            best_train_result = optimizer.optimize(metric='sharpe_ratio')
            
            if "error" in best_train_result:
                logger.warning(f"No valid strategy found for window {current_train_start} - {train_end}")
                current_train_start += test_window # Move window forward
                continue

            best_params = best_train_result['params']
            
            # 2. Test on OOS (Out of Sample)
            # Run backtest on Test Data using Best Params
            
            config = {
                "name": self.strategy_name,
                "symbol": "WFA_TEST",
                "params": best_params,
                "risk": self.risk_config
            }
            
            backtester = Backtester(test_data, initial_capital=current_equity) # Chain equity?
            # Ideally WFA chains equity, but for simplicity let's reset or track pct change
            
            oos_result = backtester.run(config)
            
            # Store Window Result
            window_summary = {
                "train_start": str(current_train_start),
                "train_end": str(train_end),
                "test_start": str(test_start),
                "test_end": str(test_end),
                "best_params": best_params,
                "train_metrics": best_train_result['metrics'],
                "oos_metrics": oos_result['metrics']
            }
            
            overall_results["windows"].append(window_summary)
            
            # Update Equity for next window?
            # Simple approach: Append returns to overall equity curve
            # For now, just collecting metrics
            
            current_train_start += test_window # Slide forward by test window size
            
        return overall_results

