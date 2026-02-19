/**
 * API Service Layer Structure
 * 
 * This directory contains all API integration code.
 * Replace mock data functions with real API calls here.
 * 
 * Structure:
 * - auth.ts: Authentication endpoints
 * - market.ts: Market data (OHLC, quotes, news)
 * - trading.ts: Trading operations (backtest, trades, analytics)
 * - user.ts: User profile and settings
 * - scanner.ts: Stock scanner functionality
 * 
 * Usage:
 * import { authAPI } from '@/lib/api/auth';
 * const user = await authAPI.login(email, password);
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface APIError {
    message: string;
    code?: string;
    status?: number;
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error: APIError = {
                message: `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
            };

            // Try to parse error response
            try {
                const errorData = await response.json();
                error.message = errorData.message || error.message;
                error.code = errorData.code;
            } catch {
                // Response is not JSON, use default error
            }

            throw error;
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw {
                message: error.message,
                code: 'NETWORK_ERROR',
            } as APIError;
        }
        throw error;
    }
}

export { apiFetch };
