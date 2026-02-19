// Research Tab Component Content
// This should be added after line 552 (before closing </div></main></div>)

{/* RESEARCH TAB */ }
{
    activeTab === "research" && (
        <div className="space-y-6">
            {/* Strategy Templates Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-display text-xl font-bold">Strategy Templates</h2>
                        <p className="text-sm text-muted-foreground">Professional playbooks ready to test</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <button
                            key={template.template_id}
                            onClick={() => setSelectedTemplate(template)}
                            className={`glass-interactive p-6 text-left transition-all ${selectedTemplate?.template_id === template.template_id
                                    ? 'ring-2 ring-primary shadow-glow'
                                    : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-display font-semibold text-lg mb-1">{template.name}</h3>
                                    <Badge variant="secondary" className="text-2xs">
                                        {template.category}
                                    </Badge>
                                </div>
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <FlaskConical className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {template.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(template.default_params).slice(0, 3).map(([key, value]) => (
                                    <div key={key} className="text-2xs px-2 py-1 rounded bg-card-elevated border border-border/30">
                                        <span className="text-muted-foreground">{key}:</span>{' '}
                                        <span className="font-mono text-primary">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Experiments Grid */}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Experiments List */}
                <div className="lg:col-span-4 space-y-4">
                    <Panel title="Experiments" icon={Trophy} headerAction={
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                                const name = prompt("Experiment name:");
                                if (name && selectedTemplate) {
                                    createExperimentMutation.mutate({
                                        name,
                                        strategy_type: selectedTemplate.category,
                                        description: `Testing ${selectedTemplate.name}`
                                    });
                                }
                            }}
                            disabled={!selectedTemplate}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            New
                        </Button>
                    }>
                        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                            {experiments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No experiments yet</p>
                                    <p className="text-xs mt-1">Select a template and create one</p>
                                </div>
                            ) : (
                                experiments.map((exp) => (
                                    <button
                                        key={exp.experiment_id}
                                        onClick={() => setSelectedExperiment(exp.experiment_id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${selectedExperiment === exp.experiment_id
                                                ? 'bg-primary/10 border border-primary/20'
                                                : 'bg-card-elevated hover:bg-card-hover border border-border/30'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium text-sm">{exp.name}</h4>
                                            <Badge variant="outline" className="text-2xs">
                                                {exp.run_count || 0} runs
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2 line-clamp1">{exp.description}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-2xs">
                                                {exp.strategy_type}
                                            </Badge>
                                            <span className="text-2xs text-muted-foreground">
                                                {new Date(exp.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </Panel>
                </div>

                {/* Right: Experiment Details & Runs */}
                <div className="lg:col-span-8">
                    {selectedExperiment ? (
                        <Panel title="Experiment Runs" icon={TrendUp} headerAction={
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {experimentRuns.length} total runs
                                </Badge>
                            </div>
                        }>
                            {experimentRuns.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-medium mb-1">No runs recorded yet</p>
                                    <p className="text-xs">Run a backtest to log your first run</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Metrics Comparison Table */}
                                    <div className="overflow-x-auto">
                                        <table className="data-table w-full">
                                            <thead>
                                                <tr>
                                                    <th className="text-left">Run Name</th>
                                                    <th>Symbol</th>
                                                    <th>Sharpe</th>
                                                    <th>Sortino</th>
                                                    <th>MaxDD</th>
                                                    <th>Hit Rate</th>
                                                    <th>Trades</th>
                                                    <th>Return</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {experimentRuns.map((run) => (
                                                    <tr key={run.run_id} className="group">
                                                        <td className="font-medium">{run.run_name}</td>
                                                        <td className="font-mono text-sm">{run.symbol}</td>
                                                        <td className={run.metrics.sharpe_ratio && run.metrics.sharpe_ratio > 1 ? 'text-profit' : 'text-muted-foreground'}>
                                                            {run.metrics.sharpe_ratio?.toFixed(2) || '-'}
                                                        </td>
                                                        <td className={run.metrics.sortino_ratio && run.metrics.sortino_ratio > 1 ? 'text-profit' : 'text-muted-foreground'}>
                                                            {run.metrics.sortino_ratio?.toFixed(2) || '-'}
                                                        </td>
                                                        <td className="text-loss">
                                                            {run.metrics.max_drawdown ? `-${run.metrics.max_drawdown}%` : '-'}
                                                        </td>
                                                        <td className={run.metrics.hit_rate && run.metrics.hit_rate > 50 ? 'text-profit' : 'text-warning'}>
                                                            {run.metrics.hit_rate ? `${run.metrics.hit_rate}%` : '-'}
                                                        </td>
                                                        <td className="text-muted-foreground">{run.metrics.total_trades || '-'}</td>
                                                        <td className={run.metrics.total_return && run.metrics.total_return > 0 ? 'text-profit' : 'text-loss'}>
                                                            {run.metrics.total_return ? `${run.metrics.total_return > 0 ? '+' : ''}${run.metrics.total_return}%` : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Best Run Highlight */}
                                    {experimentRuns.length > 0 && experimentRuns[0].metrics.sharpe_ratio && (
                                        <div className="glass p-4 border border-profit/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Trophy className="h-4 w-4 text-profit" />
                                                <span className="text-sm font-medium">Best Performer</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-2xs text-muted-foreground">Run</p>
                                                    <p className="font-medium text-sm">{experimentRuns[0].run_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xs text-muted-foreground">Sharpe</p>
                                                    <p className="font-mono text-profit text-lg font-bold">
                                                        {experimentRuns[0].metrics.sharpe_ratio?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-2xs text-muted-foreground">Hit Rate</p>
                                                    <p className="font-mono text-profit text-lg font-bold">
                                                        {experimentRuns[0].metrics.hit_rate}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-2xs text-muted-foreground">Return</p>
                                                    <p className="font-mono text-profit text-lg font-bold">
                                                        +{experimentRuns[0].metrics.total_return}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Panel>
                    ) : (
                        <div className="glass h-full flex items-center justify-center py-24">
                            <div className="text-center text-muted-foreground">
                                <FlaskConical className="h-20 w-20 mx-auto mb-4 opacity-10" />
                                <p className="font-medium mb-1">Select an experiment</p>
                                <p className="text-sm">View runs and compare metrics</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
