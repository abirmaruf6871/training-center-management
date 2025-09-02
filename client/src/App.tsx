import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import Students from "@/pages/students";
import Courses from "@/pages/courses";
import CourseManagement from "@/pages/course-management";
import Batches from "@/pages/batches";
import BranchManagement from "@/pages/branch-management";
import BatchDetail from "@/pages/batch-detail";
import Payments from "@/pages/payments";
import Attendance from "@/pages/attendance";
import QuizManagement from "@/pages/quiz-management";
import ReportsAnalytics from "@/pages/reports-analytics";
import NotificationsAutomation from "@/pages/notifications-automation";
import AdminSettings from "@/pages/admin-settings";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('Router state:', { isAuthenticated, isLoading, user });

  // Temporary: Show loading state only for 2 seconds max, then proceed
  const [showLoading, setShowLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (showLoading && isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/" component={Home} />
      
      {/* Protected routes - only for authenticated users */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/students" component={Students} />
          <Route path="/courses" component={Courses} />
          <Route path="/course-management" component={CourseManagement} />
          <Route path="/batches" component={Batches} />
          <Route path="/branch-management" component={BranchManagement} />
          <Route path="/batch-detail/:id" component={BatchDetail} />
          <Route path="/payments" component={Payments} />
          <Route path="/attendance" component={Attendance} />
          <Route path="/quiz-management" component={QuizManagement} />
          <Route path="/reports-analytics" component={ReportsAnalytics} />
          <Route path="/notifications-automation" component={NotificationsAutomation} />
          <Route path="/admin-settings" component={AdminSettings} />
        </>
      )}
      
      {/* Landing page for non-authenticated users trying to access protected routes */}
      {!isAuthenticated && (
        <Route path="/:path*" component={Landing} />
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
