import { Loader2 } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
            <div className="relative">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse">
                    <span className="font-display font-bold text-primary-foreground text-2xl">ST</span>
                </div>
                <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full -z-10 animate-pulse" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                <h2 className="text-xl font-display font-medium tracking-tight">Loading Interface</h2>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Initializing trading system...</span>
                </div>
            </div>
        </div>
    );
}
