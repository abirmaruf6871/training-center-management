import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  BookOpen,
  UserPlus,
  CreditCard,
  CalendarPlus,
  FileText,
  Bell,
  GraduationCap,
  Stethoscope,
  Microscope,
  Heart,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  CheckCircle,
  Star,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Globe,
  Activity
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please log in again.",
        variant: "destructive",
      });
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats-public"],
    queryFn: async () => {
      console.log('📊 Fetching dashboard stats...');
      const response = await fetch('http://localhost:8000/api/dashboard/stats-public');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      console.log('📊 Dashboard stats received:', data);
      return data;
    },
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log('Dashboard state:', { 
    isAuthenticated, 
    statsLoading, 
    statsError, 
    stats: stats?.data 
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/branches"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please log in again.",
        variant: "destructive",
      });
      return;
    }
  }, [statsError, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount).replace('BDT', '৳');
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const recentAdmissions = [
    { name: "Dr. Fatima Khan", course: "DMU Course", branch: "Dhaka Branch", time: "2 hours ago" },
    { name: "Dr. Rashid Ahmed", course: "CMU Course", branch: "Mymensingh Branch", time: "5 hours ago" },
    { name: "Dr. Nasir Uddin", course: "ARDMS Course", branch: "Dhaka Branch", time: "1 day ago" },
  ];

  const upcomingClasses = [
    {
      title: "DMU Batch 15 - Cardiac Ultrasound",
      faculty: "Prof. Dr. Rahman",
      room: "Room 301",
      time: "Today, 2:00 PM - 4:00 PM",
      icon: Heart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "CMU Batch 8 - Abdominal Scanning",
      faculty: "Dr. Nasreen",
      room: "Lab 2",
      time: "Tomorrow, 10:00 AM - 12:00 PM",
      icon: Microscope,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "ARDMS Prep - Physics Review",
      faculty: "Dr. Karim",
      room: "Virtual Class",
      time: "March 17, 6:00 PM - 8:00 PM",
      icon: Stethoscope,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/5">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6 space-y-8">
          {/* Dashboard Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Dashboard Overview
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                  <span>•</span>
                  <span>Today: <span className="font-medium text-gray-900 dark:text-white">{today}</span></span>
                  <span>•</span>
                  <div className="flex items-center space-x-2">
                    <span>Branch:</span>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48 h-9 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {Array.isArray(branches) && branches.map((branch: any) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Just now</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100" data-testid="text-total-students">
                      {statsLoading ? "..." : (stats as any)?.data?.totalStudents || 0}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">+{statsLoading ? "..." : (stats as any)?.data?.monthlyEnrollments || 0} this month</p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="text-white" size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Monthly Income</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100" data-testid="text-monthly-income">
                      {statsLoading ? "..." : formatCurrency((stats as any)?.data?.monthlyIncome || 0)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">+{(stats as any)?.data?.revenueGrowth || 0}% growth</p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="text-white" size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Pending Dues</p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100" data-testid="text-pending-dues">
                      {statsLoading ? "..." : formatCurrency((stats as any)?.data?.pendingDues || 0)}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">Requires attention</p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="text-white" size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Courses</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100" data-testid="text-active-courses">
                      {statsLoading ? "..." : (stats as any)?.data?.activeCourses || 0}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">{(stats as any)?.data?.courseCompletionRate || 0}% completion rate</p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="text-white" size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>





          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Admissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Admissions</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="link-view-all-admissions">
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAdmissions.map((admission, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <GraduationCap className="text-gray-600" size={16} />
                      </div>
                      <div className="flex-1">
                                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{admission.name}</p>
                                                  <p className="text-xs text-gray-500 dark:text-gray-400">{admission.course} • {admission.branch}</p>
                      </div>
                      <span className="text-xs text-gray-400">{admission.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Classes</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="link-view-schedule">
                    View schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((classItem, index) => {
                    const IconComponent = classItem.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`h-12 w-12 ${classItem.bgColor} rounded-lg flex items-center justify-center`}>
                          <IconComponent className={classItem.iconColor} size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{classItem.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{classItem.faculty} • {classItem.room}</p>
                          <p className="text-xs text-blue-600">{classItem.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center p-4 h-auto space-y-2"
                  data-testid="button-add-student"
                >
                  <UserPlus className="text-blue-600" size={24} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Student</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center p-4 h-auto space-y-2"
                  data-testid="button-collect-fee"
                >
                  <CreditCard className="text-green-600" size={24} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Collect Fee</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center p-4 h-auto space-y-2"
                  data-testid="button-schedule-class"
                >
                  <CalendarPlus className="text-purple-600" size={24} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Class</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center p-4 h-auto space-y-2"
                  data-testid="button-generate-report"
                >
                  <FileText className="text-orange-600" size={24} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate Report</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center p-4 h-auto space-y-2"
                  data-testid="button-send-notice"
                >
                  <Bell className="text-red-600" size={24} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Send Notice</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center p-4 h-auto space-y-2"
                  data-testid="button-add-course"
                >
                  <BookOpen className="text-indigo-600" size={24} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Course</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts and Analytics Section - Moved to Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trend Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">+15.5%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {/* Mock bar chart */}
                  {[65, 78, 85, 72, 88, 92, 95].map((height, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Revenue (৳K)</span>
                  <span className="font-medium text-gray-900 dark:text-white">৳450K this month</span>
                </div>
              </CardContent>
            </Card>

            {/* Student Enrollment Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Student Enrollment</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">156 Total</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {/* Mock pie chart representation */}
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20"></div>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 opacity-30"></div>
                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 opacity-40"></div>
                    <div className="absolute inset-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-50"></div>
                    <div className="absolute inset-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Active: 142</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Graduated: 14</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
