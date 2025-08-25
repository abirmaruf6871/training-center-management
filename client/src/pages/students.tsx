import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import StudentForm from "@/components/student-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  UserPlus, 
  Search, 
  Eye, 
  CreditCard, 
  Edit,
  CheckCircle,
  CircleAlert,
  Clock
} from "lucide-react";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students", { 
      search: searchTerm, 
      courseId: selectedCourse, 
      branchId: selectedBranch, 
      paymentStatus: selectedPaymentStatus 
    }],
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: branches } = useQuery({
    queryKey: ["/api/branches"],
  });

  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      await apiRequest("POST", "/api/students", studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      setShowAddDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPaymentStatusBadge = (status: string, dueAmount: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Partial ৳{dueAmount}
          </Badge>
        );
      case "pending":
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <CircleAlert className="w-3 h-3 mr-1" />
            Due ৳{dueAmount}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Unknown
          </Badge>
        );
    }
  };

  const getCourseBadge = (courseName: string) => {
    const colors = {
      "DMU": "bg-blue-100 text-blue-800",
      "CMU": "bg-purple-100 text-purple-800", 
      "ARDMS": "bg-green-100 text-green-800"
    };
    
    return (
      <Badge className={`${colors[courseName as keyof typeof colors] || "bg-gray-100 text-gray-800"} hover:${colors[courseName as keyof typeof colors] || "bg-gray-100"}`}>
        {courseName}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-700 hover:bg-blue-800" data-testid="button-add-student">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <StudentForm
                    onSubmit={(data) => createStudentMutation.mutate(data)}
                    isLoading={createStudentMutation.isPending}
                    courses={courses || []}
                    branches={branches || []}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Name, BMDC No, or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger data-testid="select-course">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Courses</SelectItem>
                    {courses?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger data-testid="select-branch">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches</SelectItem>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger data-testid="select-payment-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>BMDC No</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading students...
                          </TableCell>
                        </TableRow>
                      ))
                    ) : students?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No students found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      students?.map((student: any) => (
                        <TableRow key={student.id} className="hover:bg-gray-50" data-testid={`row-student-${student.id}`}>
                          <TableCell className="font-medium">{student.enrollmentId}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {getInitials(student.name)}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{student.bmdcNo || "-"}</TableCell>
                          <TableCell>
                            {student.courseId ? (
                              getCourseBadge(courses?.find((c: any) => c.id === student.courseId)?.name || "")
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {branches?.find((b: any) => b.id === student.branchId)?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(student.paymentStatus, student.dueAmount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-view-${student.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-payment-${student.id}`}
                              >
                                <CreditCard className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-edit-${student.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {students && students.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{students.length}</span> of <span className="font-medium">{students.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>Previous</Button>
                      <Button size="sm" className="bg-blue-600 text-white">1</Button>
                      <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
