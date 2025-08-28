import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  Building, 
  Clock, 
  DollarSign, 
  BarChart3,
  Home,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Students", href: "/students", icon: Users },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Course Management", href: "/course-management", icon: BookOpen },
    { name: "Branches", href: "/branches", icon: Building },
    { name: "Batches", href: "/batches", icon: Clock },
    { name: "Payments", href: "/payments", icon: DollarSign },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Training Center</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className={`h-4 w-4 mr-3 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400'}`} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>

          {/* Logout section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
