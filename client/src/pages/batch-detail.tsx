"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, Eye, Edit, Trash2, GraduationCap, DollarSign, Users, Building2, 
  Calendar, TrendingUp, FileText, Settings, BarChart3, CreditCard, Loader2, X, 
  RefreshCw, MapPin, Clock, UserCheck, BookOpen, Calculator, ArrowLeft
} from "lucide-react";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useLookupData } from "@/hooks/useLookupData";
import { apiService } from "@/lib/api";
import { useLocation, useRoute } from "wouter";

interface Batch {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  branch_id: string;
  faculty_id: string;
  max_students: number;
  current_students: number;
  status: string;
  course_id: string;
  created_at: string;
  updated_at: string;
  branch?: Branch;
  faculty?: Faculty;
  course?: Course;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  total_fee: number;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  admission_date: string;
  payment_status: string;
  total_fee: number;
  final_fee: number;
  discount_amount: number;
  attendance_percentage?: number;
  last_attendance?: string;
}

interface Attendance {
  id: string;
  student_id: string;
  batch_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

interface Exam {
  id: string;
  name: string;
  batch_id: string;
  exam_date: string;
  total_marks: number;
  pass_marks: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function BatchDetail() {
  const { toast } = useToast();
  const { branches, faculties } = useLookupData();
  const [location, setLocation] = useLocation();
  const { id: batchId } = useRoute("/batch-detail/:id") || { id: "placeholder-batch-id" };
  
  const [batch, setBatch] = useState<Batch | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form data for adding students
  const [studentFormData, setStudentFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    total_fee: 0,
    admission_fee: 0,
    discount_amount: 0,
    payment_status: "pending"
  });

  // Form data for attendance
  const [attendanceFormData, setAttendanceFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // Form data for exam
  const [examFormData, setExamFormData] = useState({
    name: "",
    exam_date: "",
    total_marks: 100,
    pass_marks: 40
  });

  // Fetch batch details
  const fetchBatchDetails = async () => {
    if (!batchId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getBatch(batchId);
      if (response.success) {
        setBatch(response.data);
      } else {
        toast({ title: "Error!", description: "Failed to fetch batch details", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch batch students
  const fetchBatchStudents = async () => {
    if (!batchId) return;
    
    try {
      setStudentsLoading(true);
      const response = await apiService.getStudents({ batch_id: batchId });
      if (response.success) {
        const studentsData = response.data?.data || response.data || [];
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch attendance
  const fetchAttendance = async () => {
    if (!batchId) return;
    
    try {
      const response = await apiService.getAttendance({ batch_id: batchId });
      if (response.success) {
        setAttendance(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // Fetch exams
  const fetchExams = async () => {
    if (!batchId) return;
    
    try {
      const response = await apiService.getExams({ batch_id: batchId });
      if (response.success) {
        setExams(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  // Add student to batch
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) return;
    
    try {
      const studentData = {
        ...studentFormData,
        batch_id: batchId,
        course_id: batch?.course_id,
        branch_id: batch?.branch_id,
        admission_date: new Date().toISOString().split('T')[0]
      };
      
      const response = await apiService.createStudent(studentData);
      if (response.success) {
        toast({ title: "Success!", description: "Student added to batch successfully" });
        setIsAddStudentDialogOpen(false);
        setStudentFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          total_fee: 0,
          admission_fee: 0,
          discount_amount: 0,
          payment_status: "pending"
        });
        fetchBatchStudents();
        fetchBatchDetails(); // Refresh batch stats
      } else {
        toast({ title: "Error!", description: response.message || "Failed to add student", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  // Mark attendance
  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!batchId) return;
    
    try {
      const attendanceData = {
        student_id: studentId,
        batch_id: batchId,
        date: selectedDate,
        status,
        notes: attendanceFormData.notes
      };
      
      const response = await apiService.createAttendance(attendanceData);
      if (response.success) {
        toast({ title: "Success!", description: `Attendance marked as ${status}` });
        fetchAttendance();
      } else {
        toast({ title: "Error!", description: "Failed to mark attendance", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  // Create exam
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) return;
    
    try {
      const examData = {
        ...examFormData,
        batch_id: batchId,
        status: 'upcoming'
      };
      
      const response = await apiService.createExam(examData);
      if (response.success) {
        toast({ title: "Success!", description: "Exam created successfully" });
        setIsExamDialogOpen(false);
        setExamFormData({
          name: "",
          exam_date: "",
          total_marks: 100,
          pass_marks: 40
        });
        fetchExams();
      } else {
        toast({ title: "Error!", description: response.message || "Failed to create exam", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  // Calculate batch statistics
  const calculateBatchStats = () => {
    if (!students.length) return { totalIncome: 0, pendingDues: 0, attendanceRate: 0 };
    
    const totalIncome = students.reduce((sum, student) => sum + (student.final_fee || 0), 0);
    const pendingDues = students.reduce((sum, student) => {
      const paidAmount = (student.final_fee || 0) - (student.discount_amount || 0);
      return sum + Math.max(0, (student.total_fee || 0) - paidAmount);
    }, 0);
    
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;
    
    return { totalIncome, pendingDues, attendanceRate };
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '৳0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDurationText = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (months === 0) return `${days} days`;
    if (days === 0) return `${months} months`;
    return `${months} months ${days} days`;
  };

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails();
      fetchBatchStudents();
      fetchAttendance();
      fetchExams();
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="ml-4 text-gray-600">Loading batch details...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Not Found</h2>
              <p className="text-gray-600 mb-6">The batch you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => setLocation('/batches')} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Batches
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const stats = calculateBatchStats();

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                                            <Button
                              onClick={() => setLocation('/batches')}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Batches
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{batch?.name || 'Batch Details'}</h1>
                  <p className="text-sm text-gray-600">Batch Management & Student Overview</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsAddStudentDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
                <Button 
                  onClick={() => setIsAttendanceDialogOpen(true)}
                  variant="outline"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
                <Button 
                  onClick={() => setIsExamDialogOpen(true)}
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
              </div>
            </div>
          </div>

          {/* Batch Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch ? getDurationText(batch.start_date, batch.end_date) : 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {batch ? `${formatDate(batch.start_date)} - ${formatDate(batch.end_date)}` : 'Start - End Date'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch ? `${batch.current_students}/${batch.max_students}` : '0/0'}</div>
                <p className="text-xs text-muted-foreground">
                  {batch ? `${Math.round((batch.current_students / batch.max_students) * 100)}% capacity` : 'Capacity'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Branch</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch?.branch?.name || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {batch?.branch?.address || 'Address not available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faculty</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch?.faculty?.name || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {batch?.faculty?.specialization || 'Specialization not available'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</div>
                <p className="text-xs text-muted-foreground">From all enrolled students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingDues)}</div>
                <p className="text-xs text-muted-foreground">Outstanding payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.attendanceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Overall attendance</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Enrolled Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading students...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                      <p className="text-gray-600 mb-4">Add students to this batch to get started</p>
                      <Button onClick={() => setIsAddStudentDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Student
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Admission Date</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Total Fee</TableHead>
                            <TableHead>Final Fee</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {student.first_name} {student.last_name}
                                </div>
                              </TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.phone}</TableCell>
                              <TableCell>{formatDate(student.admission_date)}</TableCell>
                              <TableCell>
                                <Badge className={
                                  student.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                  student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {student.payment_status.charAt(0).toUpperCase() + student.payment_status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(student.total_fee)}</TableCell>
                              <TableCell className="text-green-600 font-medium">{formatCurrency(student.final_fee)}</TableCell>
                              <TableCell className="text-red-600 font-medium">{formatCurrency(student.discount_amount)}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Attendance Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-48"
                    />
                  </div>
                  
                  {attendance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                      <p className="text-gray-600">Start marking attendance for this batch</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.map((record) => {
                            const student = students.find(s => s.id === record.student_id);
                            return (
                              <TableRow key={record.id}>
                                <TableCell>{formatDate(record.date)}</TableCell>
                                <TableCell>
                                  {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                                    record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{record.notes || '-'}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Batch Exams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No exams scheduled</h3>
                      <p className="text-gray-600">Create exams for this batch</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {exams.map((exam) => (
                        <Card key={exam.id} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-lg">{exam.name}</h4>
                            <Badge className={
                              exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                              exam.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Date:</strong> {formatDate(exam.exam_date)}</p>
                            <p><strong>Total Marks:</strong> {exam.total_marks}</p>
                            <p><strong>Pass Marks:</strong> {exam.pass_marks}</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              View Results
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Course Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Course Name</p>
                        <p className="text-lg font-semibold">{batch?.course?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Duration</p>
                        <p className="text-lg font-semibold">{batch?.course?.duration || 0} months</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Fee</p>
                        <p className="text-lg font-semibold">{formatCurrency(batch?.course?.total_fee || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <Badge className={
                          batch?.status === 'active' ? 'bg-green-100 text-green-800' :
                          batch?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {batch?.status ? batch.status.charAt(0).toUpperCase() + batch.status.slice(1) : 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Students</span>
                        <span className="font-semibold">{batch?.current_students || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Income</span>
                        <span className="font-semibold text-green-600">{formatCurrency(stats.totalIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Pending Dues</span>
                        <span className="font-semibold text-orange-600">{formatCurrency(stats.pendingDues)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Net Revenue</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(stats.totalIncome - stats.pendingDues)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Student to Batch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <Input
                  value={studentFormData.first_name}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <Input
                  value={studentFormData.last_name}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <Input
                  type="email"
                  value={studentFormData.email}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <Input
                  value={studentFormData.phone}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Fee *</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={studentFormData.total_fee}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, total_fee: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Fee *</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={studentFormData.admission_fee}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, admission_fee: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={studentFormData.discount_amount}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, discount_amount: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status *</label>
              <Select
                value={studentFormData.payment_status}
                onValueChange={(value) => setStudentFormData(prev => ({ ...prev, payment_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Student</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance - {formatDate(selectedDate)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
              <Input
                placeholder="General notes for this date"
                value={attendanceFormData.notes}
                onChange={(e) => setAttendanceFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="flex-1"
              />
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No students in this batch to mark attendance for.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const existingAttendance = attendance.find(
                    a => a.student_id === student.id && a.date === selectedDate
                  );
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{student.first_name} {student.last_name}</h4>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {existingAttendance ? (
                          <Badge className={
                            existingAttendance.status === 'present' ? 'bg-green-100 text-green-800' :
                            existingAttendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {existingAttendance.status.charAt(0).toUpperCase() + existingAttendance.status.slice(1)}
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(student.id, 'present')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(student.id, 'late')}
                              variant="outline"
                              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(student.id, 'absent')}
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              Absent
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Exam Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name *</label>
              <Input
                value={examFormData.name}
                onChange={(e) => setExamFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mid-Term Exam, Final Exam, Quiz 1"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date *</label>
                <Input
                  type="date"
                  value={examFormData.exam_date}
                  onChange={(e) => setExamFormData(prev => ({ ...prev, exam_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks *</label>
                <Input
                  type="number"
                  min="1"
                  value={examFormData.total_marks}
                  onChange={(e) => setExamFormData(prev => ({ ...prev, total_marks: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pass Marks *</label>
              <Input
                type="number"
                min="1"
                max={examFormData.total_marks}
                value={examFormData.pass_marks}
                onChange={(e) => setExamFormData(prev => ({ ...prev, pass_marks: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsExamDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Exam</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
