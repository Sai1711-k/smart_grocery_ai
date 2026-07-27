// frontend/src/hooks/auth-hooks.ts
// Combines useAuth, useProtectedRoute, useApi, and auth utilities
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<void>;
  clearError: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create API client
const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const useAuth = (): AuthContextType => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setAccessToken(token);
      setUser(JSON.parse(userData));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post('/auth/login', {
          email,
          password,
        });

        const { user: userData, accessToken: token } = response.data;

        // Store in localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setAccessToken(token);
        setUser(userData);

        // Set axios default header
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${token}`;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Login failed. Please try again.';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post('/auth/signup', {
          email,
          password,
          fullName,
        });

        const { user: userData, accessToken: token } = response.data;

        // Store in localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setAccessToken(token);
        setUser(userData);

        // Set axios default header
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${token}`;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          'Signup failed. Please try again.';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Clear state
      setUser(null);
      setAccessToken(null);
      delete apiClient.defaults.headers.common['Authorization'];

      // Redirect to login
      router.push('/login');
      setIsLoading(false);
    }
  }, [router]);

  const updateProfile = useCallback(async (fullName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put('/auth/profile', {
        fullName,
      });

      const { user: userData } = response.data;

      // Update localStorage and state
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to update profile. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    accessToken,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    clearError,
  };
};

// ============================================
// useProtectedRoute Hook
// ============================================

export const useProtectedRoute = () => {
  const router = useRouter();
  const { user, accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken || !user) {
      router.push('/login');
    }
  }, [accessToken, user, router]);

  return { user, accessToken };
};

// ============================================
// useApi Hook
// ============================================

interface UseApiOptions {
  enabled?: boolean;
  retry?: number;
  staleTime?: number;
}

export const useApi = (
  url: string,
  options?: UseApiOptions
) => {
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: options?.enabled !== false,
    retry: options?.retry ?? 1,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
  });
};

export const useApiMutation = (method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, data }: { url: string; data?: any }) => {
      const response = await apiClient[method.toLowerCase() as any](
        url,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries();
    },
  });
};

// ============================================
// frontend/src/lib/auth.ts
// ============================================

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};

export const getStoredUser = (): any => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};
