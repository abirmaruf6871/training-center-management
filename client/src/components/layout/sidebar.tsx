import { useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  Receipt,
  BarChart3,
  Settings,
  Users2,
  Building2,
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  Shield,
  TrendingUp,
  Award,
  FileText,
  MessageSquare
} from "lucide-react";

// Navigation groups will be defined inside the component to use dynamic data

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { user, logout, isAuthenticated } = useAuth();

  // Fetch dashboard stats for dynamic badges - with better caching and non-blocking
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats-public"],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/dashboard/stats-public');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  // Dynamic navigation groups with real-time data - with fallback values
  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, testId: "nav-dashboard", badge: null },
      ]
    },
    {
      title: "Academic Management",
      items: [
        { name: "Students", href: "/students", icon: Users, testId: "nav-students", badge: stats?.data?.totalStudents?.toString() || "4" },
        { name: "Course Management", href: "/course-management", icon: GraduationCap, testId: "nav-course-management", badge: stats?.data?.activeCourses?.toString() || "3" },
        { name: "Batches", href: "/batches", icon: Users2, testId: "nav-batches", badge: "3" },
        { name: "Attendance", href: "/attendance", icon: CalendarCheck, testId: "nav-attendance", badge: `${stats?.data?.attendanceRate || 92}%` },
        { name: "Quiz Management", href: "/quiz-management", icon: BookOpen, testId: "nav-quiz-management", badge: null },
      ]
    },
    {
      title: "Financial Management",
      items: [
        { name: "Payments", href: "/payments", icon: CreditCard, testId: "nav-payments", badge: `৳${(stats?.data?.pendingDues || 95000) / 1000}K` },
        { name: "Expenses", href: "/expenses", icon: Receipt, testId: "nav-expenses", badge: null },
        { name: "Reports & Analytics", href: "/reports-analytics", icon: BarChart3, testId: "nav-reports", badge: null },
      ]
    },
    {
      title: "Administration",
      items: [
        { name: "Branch Management", href: "/branch-management", icon: Building2, testId: "nav-branch-management", badge: "3" },
        { name: "Notifications", href: "/notifications-automation", icon: Bell, testId: "nav-notifications", badge: "5" },
        { name: "Admin Settings", href: "/admin-settings", icon: Settings, testId: "nav-admin-settings", badge: null },
      ]
    }
  ];

  const toggleGroup = (groupTitle: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupTitle)) {
      newCollapsed.delete(groupTitle);
    } else {
      newCollapsed.add(groupTitle);
    }
    setCollapsedGroups(newCollapsed);
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-slate-200 dark:border-gray-700 h-screen sticky top-16 overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-6 border-b border-slate-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6">
        {navigationGroups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.title);
          
          return (
            <div key={group.title} className="space-y-2">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <span>{group.title}</span>
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <button
                        key={item.name}
                        onClick={() => setLocation(item.href)}
                        className={cn(
                          "group flex items-center justify-between px-3 py-2.5 rounded-xl text-left w-full transition-all duration-200 relative",
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                            : "text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                        )}
                        data-testid={item.testId}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isActive 
                              ? "bg-white/20" 
                              : "bg-slate-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                          )}>
                            <Icon size={16} className={cn(
                              isActive ? "text-white" : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600"
                            )} />
                          </div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        
                        {/* Badge */}
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-700">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-200 group">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Analytics</span>
            </button>
            <button className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-200 group">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-1" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Reports</span>
            </button>
            <button className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 transition-all duration-200 group">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mb-1" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Documents</span>
            </button>
            <button className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30 transition-all duration-200 group">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-700">
        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left w-full text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
