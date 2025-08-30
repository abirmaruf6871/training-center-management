"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Eye, Edit, Trash2, GraduationCap, DollarSign, Users, Building2, Calendar, TrendingUp, FileText, Settings, BarChart3, CreditCard, Loader2, X, RefreshCw } from "lucide-react";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useLookupData } from "@/hooks/useLookupData";
import { apiService } from "@/lib/api";

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  total_fee: number;
  admission_fee: number;
  installment_count: number;
  batch_size_limit: number;
  branch_id: string;
  discount_percentage: number;
  is_active: boolean;
  studentCount?: number;
  totalIncome?: number;
  pendingDues?: number;
  installments?: any[];
  scholarships?: any[];
  branch?: any;
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
  course_id?: string;
}

export default function CourseManagement() {
  const { toast } = useToast();
  const { branches } = useLookupData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
     const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
   const [loading, setLoading] = useState(false);
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
   const [studentsLoading, setStudentsLoading] = useState(false);
   const [studentsCache, setStudentsCache] = useState<Record<string, Student[]>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 12,
    total_fee: 0,
    admission_fee: 0,
    installment_count: 1,
    batch_size_limit: 30,
    branch_id: "",
    discount_percentage: 0,
    is_active: true
  });

  // Fetch courses with real-time statistics
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourses();
      if (response.success) {
        const coursesData = response.data || [];
        
                 // Fetch real-time statistics for each course
         const coursesWithStats = await Promise.all(
           coursesData.map(async (course: Course) => {
             try {
               console.log(`🔍 Fetching students for course: ${course.name} (ID: ${course.id})`);
               
                                               // Get enrolled students for this course
                console.log(`🔍 Fetching students for course ID: ${course.id}`);
                console.log(`🔍 Course name: ${course.name}`);
                console.log(`🔍 API call parameters: { course_id: "${course.id}" }`);
                const studentsResponse = await apiService.getStudents({ course_id: course.id });
                console.log(`📊 Students response for ${course.name}:`, studentsResponse);
                
                const students = studentsResponse.success ? (studentsResponse.data?.data || studentsResponse.data || []) : [];
                console.log(`👥 Students found for ${course.name}:`, students.length, students);
                
                // Debug: Check each student's course_id
                if (students.length > 0) {
                  students.forEach((student: Student, index: number) => {
                    console.log(`Student ${index + 1}: ${student.first_name} ${student.last_name} - Course ID: ${student.course_id}`);
                  });
                }
                
                                 // Calculate real-time statistics
                 const studentCount = students.length;
                 const totalIncome = students.reduce((sum: number, student: Student) => {
                   const fee = parseFloat(student.final_fee?.toString() || '0');
                   return sum + (isNaN(fee) ? 0 : fee);
                 }, 0);
                 const pendingDues = students.reduce((sum: number, student: Student) => {
                   const totalFee = parseFloat(student.total_fee?.toString() || '0');
                   const finalFee = parseFloat(student.final_fee?.toString() || '0');
                   const discountAmount = parseFloat(student.discount_amount?.toString() || '0');
                   
                   if (isNaN(totalFee) || isNaN(finalFee) || isNaN(discountAmount)) {
                     return sum;
                   }
                   
                   const paidAmount = finalFee - discountAmount;
                   return sum + Math.max(0, totalFee - paidAmount);
                 }, 0);
                
                                 console.log(`📈 Stats for ${course.name}:`, { studentCount, totalIncome, pendingDues });
                 console.log(`💰 Income calculation details for ${course.name}:`, students.map((s: Student) => ({
                   final_fee: s.final_fee,
                   final_fee_type: typeof s.final_fee,
                   parsed: parseFloat(s.final_fee?.toString() || '0')
                 })));
               
               return {
                 ...course,
                 studentCount,
                 totalIncome,
                 pendingDues
               };
             } catch (err) {
               console.error(`❌ Error fetching stats for course ${course.id}:`, err);
               return {
                 ...course,
                 studentCount: 0,
                 totalIncome: 0,
                 pendingDues: 0
               };
             }
           })
         );
        
        setCourses(coursesWithStats);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled students for a course
  const fetchEnrolledStudents = async (courseId: string) => {
    try {
      const response = await apiService.getStudents({ course_id: courseId });
             if (response.success) {
         setEnrolledStudents(response.data?.data || response.data || []);
       }
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setEnrolledStudents([]);
    }
  };

     // Refresh course statistics (call this after adding/removing students)
   const refreshCourseStats = async () => {
     console.log('Refreshing course statistics...');
     // Clear cache when refreshing stats
     setStudentsCache({});
     await fetchCourses();
     console.log('Course statistics refreshed!');
   };

  // Debug function to check all students in database
  const debugAllStudents = async () => {
    try {
      console.log('🔍 Debugging: Fetching all students...');
      const response = await apiService.getStudents({});
      console.log('📊 All students response:', response);
      
             if (response.success && response.data) {
         const students = response.data?.data || response.data;
         console.log('👥 Total students found:', students.length);
         students.forEach((student: Student, index: number) => {
          console.log(`Student ${index + 1}:`, {
            name: `${student.first_name} ${student.last_name}`,
            course_id: student.course_id || 'No course_id field',
            email: student.email
          });
        });
      }
    } catch (err) {
      console.error('❌ Error debugging students:', err);
    }
  };



  // Create course
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createCourse(formData);
             if (response.success) {
         toast({ title: "Success!", description: "Course added successfully" });
         setIsAddDialogOpen(false);
         setFormData({
           name: "",
           description: "",
           duration: 12,
           total_fee: 0,
           admission_fee: 0,
           installment_count: 1,
           batch_size_limit: 30,
           branch_id: "",
           discount_percentage: 0,
           is_active: true
         });
         // Clear cache when adding new course
         setStudentsCache({});
         fetchCourses();
       } else {
        toast({ title: "Error!", description: response.message || "Failed to add course", variant: "destructive" });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

     // Handle view course - Optimized for performance
   const handleView = async (course: Course) => {
     console.log('handleView called with course:', course);
     setSelectedCourse(course);
     
     // Check if we have cached data
     if (studentsCache[course.id]) {
       console.log('Using cached students data for course:', course.id);
       setEnrolledStudents(studentsCache[course.id]);
       setIsViewDialogOpen(true);
       return;
     }
     
     // Show modal immediately with loading state
     setIsViewDialogOpen(true);
     setStudentsLoading(true);
     
     try {
       const response = await apiService.getStudents({ course_id: course.id });
       console.log('API Response:', response);
       
       if (response.success) {
         const students = response.data?.data || response.data || [];
         console.log('Setting enrolled students:', students);
         setEnrolledStudents(students);
         
         // Cache the results for future use
         setStudentsCache(prev => ({
           ...prev,
           [course.id]: students
         }));
       } else {
         console.log('API call failed, setting empty array');
         setEnrolledStudents([]);
       }
     } catch (err) {
       console.error('Error fetching enrolled students:', err);
       setEnrolledStudents([]);
     } finally {
       setStudentsLoading(false);
     }
   };

  // Edit course
  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      duration: course.duration,
      total_fee: course.total_fee,
      admission_fee: course.admission_fee,
      installment_count: course.installment_count,
      batch_size_limit: course.batch_size_limit,
      branch_id: course.branch_id,
      discount_percentage: course.discount_percentage,
      is_active: course.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Update course
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    try {
      const response = await apiService.updateCourse(selectedCourse.id, formData);
             if (response.success) {
         toast({ title: "Success!", description: "Course updated successfully" });
         setIsEditDialogOpen(false);
         setSelectedCourse(null);
         // Clear cache when updating course
         setStudentsCache({});
         fetchCourses();
       } else {
        toast({ title: "Error!", description: response.message || "Failed to update course", variant: "destructive" });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  // Delete course
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    try {
      const response = await apiService.deleteCourse(id);
             if (response.success) {
         toast({ title: "Success!", description: "Course deleted successfully" });
         // Clear cache when deleting course
         setStudentsCache({});
         fetchCourses();
       } else {
        toast({ title: "Error!", description: response.message || "Failed to delete course", variant: "destructive" });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && course.is_active) ||
                         (statusFilter === "inactive" && !course.is_active);
    
    return matchesSearch && matchesStatus;
  });

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

  const getDurationText = (months: number) => {
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

     useEffect(() => {
     fetchCourses();
   }, []);

   // Debounced search for better performance
   useEffect(() => {
     const timer = setTimeout(() => {
       // Search logic is already handled by filteredCourses
     }, 300);
     
     return () => clearTimeout(timer);
   }, [searchTerm]);

  // Debug enrolledStudents state changes
  useEffect(() => {
    console.log('enrolledStudents state changed:', enrolledStudents);
    console.log('enrolledStudents type:', typeof enrolledStudents);
    console.log('enrolledStudents is array:', Array.isArray(enrolledStudents));
  }, [enrolledStudents]);

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your academy courses, fees, and student enrollment</p>
              </div>
                             <div className="flex gap-3">
                 <Button 
                   onClick={debugAllStudents}
                   variant="outline"
                   className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                 >
                   <Search className="h-4 w-4" />
                   Debug Students
                 </Button>
                 <Button 
                   onClick={refreshCourseStats}
                   variant="outline"
                   className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                 >
                   <RefreshCw className="h-4 w-4" />
                   Refresh Stats
                 </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md">
                      <Plus className="h-4 w-4" />
                      Add New Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Add New Course</DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Fill in the details below to create a new course for your academy</p>
                                         <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                       <p className="text-xs text-blue-800 dark:text-blue-200">
                         <strong>Note:</strong> Fields marked with * are required. All monetary values should be in BDT (Bangladeshi Taka). You can enter any amount from 1 BDT onwards.
                       </p>
                       
                     </div>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Name *</label>
                          <Input 
                            placeholder="e.g., Basic Medical Training, Ultrasound Course, ECG Training" 
                            value={formData.name} 
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (months) *</label>
                          <Input 
                            placeholder="e.g., 6, 12, 24" 
                            type="number" 
                            min="1"
                            value={formData.duration} 
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))} 
                            required 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Description *</label>
                          <Input 
                            placeholder="e.g., Comprehensive training covering medical fundamentals, practical skills, and hands-on experience in a clinical setting. Students will learn patient care, medical procedures, and professional ethics." 
                            value={formData.description} 
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Financial Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Course Fee (BDT) *</label>
                          <Input 
                            placeholder="e.g., 50000, 75000, 100000" 
                            type="number" 
                            min="1"
                            step="1"
                            value={formData.total_fee} 
                            onChange={(e) => setFormData(prev => ({ ...prev, total_fee: parseInt(e.target.value) || 0 }))} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admission Fee (BDT) *</label>
                                                    <Input 
                            placeholder="e.g., 10000, 15000, 20000" 
                            type="number" 
                            min="1"
                            step="1"
                            value={formData.admission_fee} 
                            onChange={(e) => setFormData(prev => ({ ...prev, admission_fee: parseInt(e.target.value) || 0 }))} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Installments *</label>
                          <Input 
                            placeholder="e.g., 3, 6, 12" 
                            type="number" 
                            min="1"
                            value={formData.installment_count} 
                            onChange={(e) => setFormData(prev => ({ ...prev, installment_count: parseInt(e.target.value) || 0 }))} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount Percentage (%)</label>
                          <Input 
                            placeholder="e.g., 10, 15, 20" 
                            type="number" 
                            min="0"
                            value={formData.discount_percentage} 
                            onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Course Settings */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-purple-600" />
                        Course Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum Batch Size *</label>
                          <Input 
                            placeholder="e.g., 20, 30, 50" 
                            type="number" 
                            min="1"
                            value={formData.batch_size_limit} 
                            onChange={(e) => setFormData(prev => ({ ...prev, batch_size_limit: parseInt(e.target.value) || 0 }))} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch Location *</label>
                          <Select value={formData.branch_id} onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))} required>
                            <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                            <SelectContent>
                              {branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Status *</label>
                          <Select value={formData.is_active ? "active" : "inactive"} onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === "active" }))}>
                            <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        className="px-6 py-2"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                                     <p className="text-2xl font-bold text-gray-900">
                     {courses.reduce((sum: number, course: Course) => {
                       const count = course.studentCount || 0;
                       return sum + (isNaN(count) ? 0 : count);
                     }, 0)}
                   </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                                     <p className="text-2xl font-bold text-gray-900">
                     {formatCurrency(courses.reduce((sum: number, course: Course) => {
                       const income = course.totalIncome || 0;
                       return sum + (isNaN(income) ? 0 : income);
                     }, 0))}
                   </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Dues</p>
                                     <p className="text-2xl font-bold text-gray-900">
                     {formatCurrency(courses.reduce((sum: number, course: Course) => {
                       const dues = course.pendingDues || 0;
                       return sum + (isNaN(dues) ? 0 : dues);
                     }, 0))}
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Courses</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Filter</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    variant="outline"
                    className="w-40"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Summary */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCourses.length} of {courses.length} courses
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== "all" && ` (${statusFilter} only)`}
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course: Course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden">
                {/* Course Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {course.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{getDurationText(course.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{course.batch_size_limit} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Building2 className="h-4 w-4" />
                        <span>{branches.find(b => b.id === course.branch_id)?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CreditCard className="h-4 w-4" />
                        <span>{course.installment_count} installments</span>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Fee:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(course.total_fee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Admission Fee:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(course.admission_fee)}</span>
                      </div>
                      {course.discount_percentage > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-semibold text-green-600">{course.discount_percentage}%</span>
                        </div>
                      )}
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-blue-600">{course.studentCount || 0}</p>
                        <p className="text-xs text-blue-600">Students</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(course.totalIncome || 0)}</p>
                        <p className="text-xs text-green-600">Income</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(course.pendingDues || 0)}</p>
                        <p className="text-xs text-orange-600">Pending</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                             <button
                         onClick={() => handleView(course)}
                         className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                         title={studentsCache[course.id] ? "View (cached)" : "View"}
                       >
                         <Eye className="h-4 w-4" />
                         View
                         {studentsCache[course.id] && (
                           <span className="text-xs text-green-600">⚡</span>
                         )}
                       </button>
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                            handleDelete(course.id);
                          }
                        }}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <Card className="mt-6">
              <CardContent className="p-12 text-center">
                <div className="text-gray-500">
                  {courses.length === 0 ? (
                    <div>
                      <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                      <p className="text-gray-600 mb-4">Get started by adding your first course to the academy</p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Course
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses match your search</h3>
                      <p className="text-gray-600">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* View Course Modal */}
          {isViewDialogOpen && selectedCourse && (
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-gray-900">{selectedCourse.name}</DialogTitle>
                                         <button
                       onClick={() => {
                         setIsViewDialogOpen(false);
                         // Clear enrolled students when closing modal to free memory
                         setEnrolledStudents([]);
                       }}
                       className="text-gray-400 hover:text-gray-600"
                     >
                       <X className="h-6 w-6" />
                     </button>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Course Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium text-right max-w-xs">{selectedCourse.description}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{getDurationText(selectedCourse.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batch Size Limit:</span>
                          <span className="font-medium">{selectedCourse.batch_size_limit} students</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Branch:</span>
                          <span className="font-medium">{branches.find(b => b.id === selectedCourse.branch_id)?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={selectedCourse.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedCourse.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Fee:</span>
                          <span className="font-medium text-lg">{formatCurrency(selectedCourse.total_fee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Admission Fee:</span>
                          <span className="font-medium">{formatCurrency(selectedCourse.admission_fee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Installments:</span>
                          <span className="font-medium">{selectedCourse.installment_count}</span>
                        </div>
                        {selectedCourse.discount_percentage > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-green-600">{selectedCourse.discount_percentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                                     {/* Statistics */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="bg-blue-50 rounded-xl p-6 text-center">
                       <div className="text-3xl font-bold text-blue-600 mb-2">
                         {studentsLoading ? (
                           <div className="h-8 bg-blue-200 rounded animate-pulse"></div>
                         ) : (
                           selectedCourse.studentCount || 0
                         )}
                       </div>
                       <div className="text-blue-600 font-medium">Enrolled Students</div>
                     </div>
                     <div className="bg-green-50 rounded-xl p-6 text-center">
                       <div className="text-3xl font-bold text-green-600 mb-2">
                         {studentsLoading ? (
                           <div className="h-8 bg-green-200 rounded animate-pulse"></div>
                         ) : (
                           formatCurrency(selectedCourse.totalIncome || 0)
                         )}
                       </div>
                       <div className="text-green-600 font-medium">Total Income</div>
                     </div>
                     <div className="bg-orange-50 rounded-xl p-6 text-center">
                       <div className="text-3xl font-bold text-orange-600 mb-2">
                         {studentsLoading ? (
                           <div className="h-8 bg-orange-200 rounded animate-pulse"></div>
                         ) : (
                           formatCurrency(selectedCourse.pendingDues || 0)
                         )}
                       </div>
                       <div className="text-orange-600 font-medium">Pending Dues</div>
                     </div>
                   </div>

                                     {/* Enrolled Students List */}
                   <div className="bg-gray-50 rounded-xl p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <span>Enrolled Students</span>
                       {studentsLoading ? (
                         <div className="flex items-center gap-2 animate-in fade-in duration-200">
                           <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                           <span className="text-sm text-gray-500">Loading...</span>
                         </div>
                       ) : (
                         <Badge variant="secondary" className="text-xs animate-in fade-in duration-200">
                           {(enrolledStudents || []).length} students
                         </Badge>
                       )}
                     </h3>
                     
                     <div className="transition-all duration-300 ease-in-out">
                       {studentsLoading ? (
                       <div className="space-y-4">
                         {/* Skeleton loading for table */}
                         <div className="animate-pulse">
                           <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                           <div className="space-y-3">
                             {[1, 2, 3].map((i) => (
                               <div key={i} className="flex space-x-4">
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                               </div>
                             ))}
                           </div>
                         </div>
                         <div className="text-center py-4">
                           <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
                           <p className="text-sm text-gray-500">Loading enrolled students...</p>
                         </div>
                       </div>
                     ) : (enrolledStudents || []).length === 0 ? (
                       <div className="text-center py-8 text-gray-500">
                         <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                         <p className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</p>
                         <p className="text-gray-600">Students will appear here once they enroll in this course</p>
                       </div>
                     ) : (
                                             <div className="overflow-x-auto animate-in fade-in duration-300">
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
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {(() => {
                               const students = enrolledStudents || [];
                               console.log('Before map - students:', students);
                               console.log('Students type:', typeof students);
                               console.log('Students is array:', Array.isArray(students));
                               if (!Array.isArray(students)) {
                                 console.error('Students is not an array, setting to empty array');
                                 return [];
                               }
                               return students.map((student, index) => (
                                 <TableRow 
                                   key={student.id}
                                   className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                   style={{ animationDelay: `${index * 50}ms` }}
                                 >
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
                                 </TableRow>
                               ));
                             })()}
                           </TableBody>
                         </Table>
                       </div>
                     )}
                   </div>
                 </div>
                 </div>
               </DialogContent>
             </Dialog>
           )}

          {/* Edit Course Modal */}
          {isEditDialogOpen && selectedCourse && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">Edit Course</DialogTitle>
                  <p className="text-sm text-gray-600 mt-2">Update the course information below</p>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> Fields marked with * are required. All monetary values should be in BDT (Bangladeshi Taka). You can enter any amount from 1 BDT onwards.
                    </p>
                  </div>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                        <Input 
                          placeholder="e.g., Basic Medical Training, Ultrasound Course, ECG Training" 
                          value={formData.name} 
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months) *</label>
                        <Input 
                          placeholder="e.g., 6, 12, 24" 
                          type="number" 
                          min="1"
                          value={formData.duration} 
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))} 
                          required 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Description *</label>
                        <Input 
                          placeholder="e.g., Comprehensive training covering medical fundamentals, practical skills, and hands-on experience in a clinical setting. Students will learn patient care, medical procedures, and professional ethics." 
                          value={formData.description} 
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Course Fee (BDT) *</label>
                        <Input 
                          placeholder="e.g., 50000, 75000, 100000" 
                          type="number" 
                          min="1"
                          step="1"
                          value={formData.total_fee} 
                          onChange={(e) => setFormData(prev => ({ ...prev, total_fee: parseInt(e.target.value) || 0 }))} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admission Fee (BDT) *</label>
                        <Input 
                          placeholder="e.g., 10000, 15000, 20000" 
                          type="number" 
                          min="1"
                          step="1"
                          value={formData.admission_fee} 
                          onChange={(e) => setFormData(prev => ({ ...prev, admission_fee: parseInt(e.target.value) || 0 }))} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Installments *</label>
                        <Input 
                          placeholder="e.g., 3, 6, 12" 
                          type="number" 
                          min="1"
                          value={formData.installment_count} 
                          onChange={(e) => setFormData(prev => ({ ...prev, installment_count: parseInt(e.target.value) || 0 }))} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage (%)</label>
                        <Input 
                          placeholder="e.g., 10, 15, 20" 
                          type="number" 
                          min="0"
                          value={formData.discount_percentage} 
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Course Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      Course Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Batch Size *</label>
                        <Input 
                          placeholder="e.g., 20, 30, 50" 
                          type="number" 
                          min="1"
                          value={formData.batch_size_limit} 
                          onChange={(e) => setFormData(prev => ({ ...prev, batch_size_limit: parseInt(e.target.value) || 0 }))} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch Location *</label>
                                                  <Select value={formData.branch_id} onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))} required>
                            <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                            <SelectContent>
                              {branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Status *</label>
                                                  <Select value={formData.is_active ? "active" : "inactive"} onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === "active" }))}>
                            <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="px-6 py-2"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="px-6 py-2 bg-green-600 hover:bg-green-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Course
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
}
