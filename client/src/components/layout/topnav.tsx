import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap,
  Bell,
  User,
  ChevronDown,
  LogOut
} from "lucide-react";

export default function TopNav() {
  const { user, logout } = useAuth() as { user: any; logout: () => Promise<void> };
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    console.log("Logout button clicked");
    setIsLoggingOut(true);
    
    try {
      await logout();
      console.log("Logout completed successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-blue-700 rounded-full flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">ACMR Academy Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2" data-testid="button-notifications">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
            
            {/* Profile Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600" size={16} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"
                  }
                </p>
                <p className="text-xs text-gray-500 capitalize" data-testid="text-user-role">
                  {user?.role || "User"}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-1 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                data-testid="button-logout"
                title={isLoggingOut ? "Logging out..." : "Logout"}
              >
                {isLoggingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <LogOut size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
