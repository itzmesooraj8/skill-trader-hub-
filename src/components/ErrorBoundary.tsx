import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full glass p-8 rounded-xl text-center space-y-6 border border-border/50 shadow-2xl">
                        <div className="mx-auto w-16 h-16 rounded-full bg-loss/10 flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-loss" />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground font-display">
                            Something went wrong
                        </h1>

                        <div className="text-muted-foreground text-sm space-y-2">
                            <p>We encountered an unexpected error in the trading interface.</p>
                            {this.state.error && (
                                <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono text-left overflow-auto max-h-32 my-4 border border-border/50">
                                    {this.state.error.toString()}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 justify-center pt-2">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                            >
                                Go Home
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                className="gap-2 bg-primary hover:bg-primary/90"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reload Application
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
