import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Courses from "@/pages/courses";
import CourseManagement from "@/pages/course-management";
import Batches from "@/pages/batches";
import BranchManagement from "@/pages/branch-management";
import BatchDetail from "@/pages/batch-detail";
import Payments from "@/pages/payments";
import Attendance from "@/pages/attendance";
import ReportsAnalytics from "@/pages/reports-analytics";
import NotificationsAutomation from "@/pages/notifications-automation";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log('Router state:', { isAuthenticated, isLoading, user });

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/students" component={Students} />
          <Route path="/courses" component={Courses} />
          <Route path="/course-management" component={CourseManagement} />
                  <Route path="/batches" component={Batches} />
        <Route path="/branch-management" component={BranchManagement} />
        <Route path="/batch-detail/:id" component={BatchDetail} />
          <Route path="/payments" component={Payments} />
          <Route path="/attendance" component={Attendance} />
          <Route path="/reports-analytics" component={ReportsAnalytics} />
          <Route path="/notifications-automation" component={NotificationsAutomation} />
        </>
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
