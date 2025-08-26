import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useAuth() {
  const [localUser, setLocalUser] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const login = (userData: any) => {
    setLocalUser(userData);
    // Invalidate the auth query to refresh
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  const logout = async () => {
    try {
      // Call logout API
      await fetch("/api/logout");
      // Clear local user state
      setLocalUser(null);
      // Clear query cache
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect to login page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local state and redirect
      setLocalUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    }
  };

  // Use local user if available, otherwise use query user
  const currentUser = localUser || user;

  return {
    user: currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    logout,
  };
}
