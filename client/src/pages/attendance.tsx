"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, UserCheck, Clock, Filter, Download } from "lucide-react";
import { apiService } from "@/lib/api";

interface AttendanceRecord {
  id: number;
  student_id: number;
  batch_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  student: {
    first_name: string;
    last_name: string;
    email: string;
  };
  batch: {
    name: string;
  };
}

interface Batch {
  id: number;
  name: string;
}

export default function Attendance() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch batches for filtering
  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
    enabled: isAuthenticated,
  });

  // Fetch attendance records
  const { data: attendanceData, isLoading: attendanceLoading, error: attendanceError } = useQuery({
    queryKey: ["/api/attendance", { batch_id: selectedBatch, date: selectedDate, status: selectedStatus }],
    enabled: isAuthenticated,
    queryFn: () => apiService.getAttendance({ 
      batch_id: selectedBatch === "all" ? undefined : selectedBatch, 
      date: selectedDate || undefined, 
      status: selectedStatus === "all" ? undefined : selectedStatus 
    }),
  });

  useEffect(() => {
    if (attendanceError && isUnauthorizedError(attendanceError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please log in again.",
        variant: "destructive",
      });
      return;
    }
  }, [attendanceError, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const attendanceRecords = attendanceData?.data?.data || [];
  const totalRecords = attendanceData?.data?.total || 0;

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      absent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const exportAttendance = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
                <p className="text-sm text-gray-600">Track and manage student attendance across all batches</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={exportAttendance} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRecords}</div>
                <p className="text-xs text-muted-foreground">Attendance records</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
                <p className="text-xs text-muted-foreground">Current date</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batches.length}</div>
                <p className="text-xs text-muted-foreground">Total batches</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div>
                   <Label htmlFor="batch">Batch</Label>
                   <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                     <SelectTrigger>
                       <SelectValue placeholder="All batches" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">All batches</SelectItem>
                       {batches.map((batch) => (
                         <SelectItem key={batch.id} value={batch.id.toString()}>
                           {batch.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                                 <div>
                   <Label htmlFor="status">Status</Label>
                   <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                     <SelectTrigger>
                       <SelectValue placeholder="All statuses" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">All statuses</SelectItem>
                       <SelectItem value="present">Present</SelectItem>
                       <SelectItem value="absent">Absent</SelectItem>
                       <SelectItem value="late">Late</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading attendance records...</p>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No attendance records found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or add some attendance records</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Student</th>
                        <th className="text-left py-3 px-4 font-medium">Batch</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record: AttendanceRecord) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">
                                {record.student.first_name} {record.student.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{record.student.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{record.batch.name}</td>
                          <td className="py-3 px-4">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
