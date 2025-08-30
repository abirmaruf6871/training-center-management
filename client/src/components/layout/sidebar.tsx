import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Presentation,
  CreditCard,
  CalendarCheck,
  Receipt,
  BarChart3,
  Settings,
  Users2,
  Building2,
  Bell
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, testId: "nav-dashboard" },
  { name: "Students", href: "/students", icon: Users, testId: "nav-students" },
  { name: "Courses", href: "/courses", icon: BookOpen, testId: "nav-courses" },
  { name: "Course Management", href: "/course-management", icon: GraduationCap, testId: "nav-course-management" },
  { name: "Batches", href: "/batches", icon: Users2, testId: "nav-batches" },
  { name: "Branch Management", href: "/branch-management", icon: Building2, testId: "nav-branch-management" },
  { name: "Faculty", href: "/faculty", icon: Presentation, testId: "nav-faculty" },
  { name: "Payments", href: "/payments", icon: CreditCard, testId: "nav-payments" },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck, testId: "nav-attendance" },
  { name: "Expenses", href: "/expenses", icon: Receipt, testId: "nav-expenses" },
  { name: "Reports & Analytics", href: "/reports-analytics", icon: BarChart3, testId: "nav-reports" },
  { name: "Notifications", href: "/notifications-automation", icon: Bell, testId: "nav-notifications" },
  { name: "Settings", href: "/settings", icon: Settings, testId: "nav-settings" },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-sm h-screen sticky top-16 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => setLocation(item.href)}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-left w-full transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
              data-testid={item.testId}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
        
        {/* Theme Toggle */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </aside>
  );
}
