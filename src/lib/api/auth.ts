import { apiFetch, APIError } from './index';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
        level: number;
        xp: number;
        xpToNextLevel: number;
        tier: 'free' | 'pro' | 'elite';
        completedAssessment: boolean;
        capital: number;
    };
    token: string;
    refreshToken: string;
}

/**
 * Authentication API Service
 * 
 * TODO: Replace mock authentication in AuthContext with these real API calls
 * 
 * Backend Requirements:
 * - POST /api/auth/login - User login
 * - POST /api/auth/register - User registration
 * - POST /api/auth/logout - User logout
 * - POST /api/auth/refresh - Refresh access token
 * - GET /api/auth/me - Get current user
 */
export const authAPI = {
    /**
     * Login user with email and password
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await apiFetch<AuthResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // Store tokens
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('refresh_token', response.refreshToken);

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * Register new user
     */
    async register(email: string, password: string, name: string): Promise<AuthResponse> {
        try {
            const response = await apiFetch<AuthResponse>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name }),
            });

            // Store tokens
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('refresh_token', response.refreshToken);

            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        try {
            await apiFetch('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Clear tokens regardless of API response
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
        }
    },

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(): Promise<{ token: string }> {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await apiFetch<{ token: string }>('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });

            localStorage.setItem('auth_token', response.token);
            return response;
        } catch (error) {
            // If refresh fails, clear tokens and force re-login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            throw error;
        }
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<AuthResponse['user']> {
        try {
            return await apiFetch<AuthResponse['user']>('/auth/me');
        } catch (error) {
            console.error('Get current user failed:', error);
            throw error;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    },

    /**
     * Get stored auth token
     */
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },
};

/**
 * MIGRATION GUIDE: Updating AuthContext to use real API
 * 
 * 1. Update the login function in AuthContext.tsx:
 * 
 * const login = async (email: string, password: string) => {
 *   try {
 *     const response = await authAPI.login(email, password);
 *     setUser(response.user);
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *     throw error;
 *   }
 * };
 * 
 * 2. Update the logout function:
 * 
 * const logout = async () => {
 *   await authAPI.logout();
 *   setUser(null);
 * };
 * 
 * 3. Add token refresh logic:
 * 
 * useEffect(() => {
 *   const interval = setInterval(async () => {
 *     if (authAPI.isAuthenticated()) {
 *       try {
 *         await authAPI.refreshToken();
 *       } catch (error) {
 *         logout();
 *       }
 *     }
 *   }, 15 * 60 * 1000); // Refresh every 15 minutes
 * 
 *   return () => clearInterval(interval);
 * }, []);
 * 
 * 4. Load user on app start:
 * 
 * useEffect(() => {
 *   const loadUser = async () => {
 *     if (authAPI.isAuthenticated()) {
 *       try {
 *         const user = await authAPI.getCurrentUser();
 *         setUser(user);
 *       } catch (error) {
 *         logout();
 *       }
 *     }
 *   };
 *   loadUser();
 * }, []);
 */
