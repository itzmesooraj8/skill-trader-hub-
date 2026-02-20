import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
    children: React.ReactNode;
    showBackButton?: boolean;
    className?: string; // For main container customization
}

export function PageLayout({ children, showBackButton = true, className }: PageLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show back button on Dashboard or Landing Page generally, 
    // but if explicit showBackButton is true, we show it.
    // However, usually Dashboard is the 'home' for authenticated users.
    const isDashboard = location.pathname === "/dashboard";
    const shouldShowBack = showBackButton && !isDashboard;

    return (
        <div className="min-h-screen bg-background">
            {/* Global Background Effects could be moved here if they are consistent across pages */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-50" />
                <div className="grid-overlay opacity-10" />
            </div>

            <AppNavbar />

            <main className={cn("container mx-auto px-6 py-8 relative z-10", className)}>
                {shouldShowBack && (
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="group pl-0 hover:bg-transparent hover:text-primary transition-colors"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Button>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
