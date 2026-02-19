import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    minLevel?: number;
    redirectTo?: string;
}

/**
 * ProtectedRoute component - Wraps routes that require authentication or specific user levels
 * 
 * @param children - The component to render if access is granted
 * @param requireAuth - Whether authentication is required (default: true)
 * @param minLevel - Minimum user level required to access this route
 * @param redirectTo - Where to redirect if access is denied (default: /auth or /dashboard)
 * 
 * @example
 * <Route 
 *   path="/scanner" 
 *   element={
 *     <ProtectedRoute minLevel={3}>
 *       <ScannerPage />
 *     </ProtectedRoute>
 *   } 
 * />
 */
export function ProtectedRoute({
    children,
    requireAuth = true,
    minLevel = 0,
    redirectTo,
}: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication
        if (requireAuth && !isAuthenticated) {
            toast.error('Please sign in to access this page');
            navigate(redirectTo || '/auth', { replace: true });
            return;
        }

        // Check level requirement
        if (user && minLevel > 0 && user.level < minLevel) {
            toast.error(`This feature requires Level ${minLevel}. You are currently Level ${user.level}.`);
            navigate(redirectTo || '/dashboard', { replace: true });
            return;
        }
    }, [isAuthenticated, user, minLevel, requireAuth, navigate, redirectTo]);

    // Don't render anything while checking
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (user && minLevel > 0 && user.level < minLevel) {
        return null;
    }

    return <>{children}</>;
}

/**
 * PublicRoute component - Wraps routes that should only be accessible when NOT authenticated
 * Useful for login/register pages
 * 
 * @example
 * <Route 
 *   path="/auth" 
 *   element={
 *     <PublicRoute>
 *       <AuthPage />
 *     </PublicRoute>
 *   } 
 * />
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
