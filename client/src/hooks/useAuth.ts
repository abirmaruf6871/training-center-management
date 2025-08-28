import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/config/api";
import { apiClient } from "@/lib/apiClient";

export function useAuth() {
  const [localUser, setLocalUser] = useState(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.AUTH.USER],
    queryFn: async () => {
      const response = await apiClient.get(getApiUrl(API_ENDPOINTS.AUTH.USER));
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    retry: false,
    enabled: !!token, // Only run query if we have a token
  });

  const login = (userData: any, authToken: string) => {
    console.log('Login called with:', { userData, authToken });
    setLocalUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
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
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AUTH.USER] });
      window.location.href = "/";
    }
  };

  // Use local user if available, otherwise use query user
  const currentUser = localUser || user;

  return {
    user: currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    token,
    login,
    logout,
  };
}
