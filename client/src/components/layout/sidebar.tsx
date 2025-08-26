import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, testId: "nav-dashboard" },
  { name: "Students", href: "/students", icon: Users, testId: "nav-students" },
  { name: "Courses", href: "/courses", icon: BookOpen, testId: "nav-courses" },
  { name: "Course Management", href: "/course-management", icon: GraduationCap, testId: "nav-course-management" },
  { name: "Faculty", href: "/faculty", icon: Presentation, testId: "nav-faculty" },
  { name: "Payments", href: "/payments", icon: CreditCard, testId: "nav-payments" },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck, testId: "nav-attendance" },
  { name: "Expenses", href: "/expenses", icon: Receipt, testId: "nav-expenses" },
  { name: "Reports", href: "/reports", icon: BarChart3, testId: "nav-reports" },
  { name: "Settings", href: "/settings", icon: Settings, testId: "nav-settings" },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm h-screen sticky top-16 overflow-y-auto">
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
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
              data-testid={item.testId}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
