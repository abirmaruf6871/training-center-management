import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/config/api";
import { apiClient } from "@/lib/apiClient";
import { apiService } from "@/lib/api";

export function useAuth() {
  const [localUser, setLocalUser] = useState(() => {
    // Initialize user from localStorage if available
    const storedUser = localStorage.getItem('auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const queryClient = useQueryClient();
  
  // Debug logging
  console.log('useAuth hook - token:', token, 'hasToken:', !!token, 'localUser:', localUser);
  
  const { data: user, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.AUTH.USER],
    queryFn: async () => {
      console.log('useAuth queryFn called - this should not happen without token');
      return await apiService.getUser();
    },
    retry: false,
    enabled: false, // Disable completely for now to prevent timeout issues
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer versions)
  });

  const login = (userData: any, authToken: string) => {
    console.log('Login called with:', { userData, authToken });
    setLocalUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    // Invalidate the auth query to refresh
    queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AUTH.USER] });
    console.log('Login state updated, user should be authenticated now');
  };

  const logout = async () => {
    try {
      // Call logout API with token
      if (token) {
        await apiClient.post(getApiUrl(API_ENDPOINTS.AUTH.LOGOUT));
      }
      // Clear local state
      setLocalUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Clear query cache
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AUTH.USER] });
      // Redirect to login page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local state and redirect
      setLocalUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AUTH.USER] });
      window.location.href = "/";
    }
  };

  // Use local user if available, otherwise use query user
  const currentUser = localUser || user;

  return {
    user: currentUser,
    isLoading: false, // Set to false since we're not making API calls
    isAuthenticated: !!currentUser || !!token, // Check both user and token
    token,
    login,
    logout,
  };
}
