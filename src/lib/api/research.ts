import { apiFetch } from './index';

export interface StrategyTemplate {
    template_id: string;
    name: string;
    category: string;
    description: string;
    default_params: Record<string, any>;
}

export interface Experiment {
    experiment_id: string;
    name: string;
    strategy_type: string;
    description: string;
    created_at: string;
    status: string;
    run_count?: number;
}

export interface ExperimentRun {
    run_id: string;
    run_name: string;
    symbol: string;
    timeframe: string;
    parameters: Record<string, any>;
    metrics: {
        sharpe_ratio?: number;
        sortino_ratio?: number;
        max_drawdown?: number;
        hit_rate?: number;
        total_trades?: number;
        turnover?: number;
        total_return?: number;
        win_rate?: number;
    };
    created_at: string;
}

/**
 * Quant Research Lab API Service
 * Professional experiment tracking and strategy comparison
 */
export const researchAPI = {
    /**
     * Get all strategy templates (Momentum, Mean-Reversion, Seasonality)
     */
    async getTemplates(): Promise<StrategyTemplate[]> {
        return await apiFetch<StrategyTemplate[]>('/research/templates');
    },

    /**
     * Create a new research experiment
     */
    async createExperiment(name: string, strategy_type: string, description?: string): Promise<Experiment> {
        return await apiFetch<Experiment>('/research/experiments', {
            method: 'POST',
            body: JSON.stringify({ name, strategy_type, description: description || '' }),
        });
    },

    /**
     * Get all experiments
     */
    async getExperiments(): Promise<Experiment[]> {
        return await apiFetch<Experiment[]>('/research/experiments');
    },

    /**
     * Get runs for a specific experiment
     */
    async getExperimentRuns(experiment_id: string): Promise<ExperimentRun[]> {
        return await apiFetch<ExperimentRun[]>(`/research/experiments/${experiment_id}/runs`);
    },

    /**
     * Log a new backtest run
     */
    async logRun(data: {
        experiment_id: string;
        run_name: string;
        symbol: string;
        timeframe: string;
        parameters: Record<string, any>;
        metrics: Record<string, any>;
        start_date?: string;
        end_date?: string;
    }): Promise<{ run_id: string }> {
        return await apiFetch('/research/runs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Compare multiple runs side-by-side
     */
    async compareRuns(run_ids: string[]): Promise<ExperimentRun[]> {
        return await apiFetch('/research/compare', {
            method: 'POST',
            body: JSON.stringify(run_ids),
        });
    },
};
