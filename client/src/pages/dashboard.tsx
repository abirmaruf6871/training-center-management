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
  Heart
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
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
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

  if (isLoading || !isAuthenticated) {
    return null;
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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Today: <span className="font-medium">{today}</span></span>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <span>Branch:</span>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40 h-8">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-total-students">
                      {statsLoading ? "..." : (stats as any)?.totalStudents || 0}
                    </p>
                    <p className="text-sm text-green-600">Active enrollment</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-monthly-income">
                      {statsLoading ? "..." : formatCurrency((stats as any)?.monthlyIncome || 0)}
                    </p>
                    <p className="text-sm text-green-600">This month</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Dues</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-pending-dues">
                          {statsLoading ? "..." : formatCurrency((stats as any)?.pendingDues || 0)}
                        </p>
                    <p className="text-sm text-red-600">Outstanding</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-active-courses">
                          {statsLoading ? "..." : (stats as any)?.activeCourses || 0}
                        </p>
                    <p className="text-sm text-blue-600">Available programs</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-purple-600" size={24} />
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
        </main>
      </div>
    </div>
  );
}
