"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Eye, Edit, Trash2, Users, GraduationCap, DollarSign, Loader2 } from "lucide-react";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useStudents, type Student, type CreateStudentData } from "@/hooks/useStudents";
import { useLookupData } from "@/hooks/useLookupData";

export default function Students() {
  const { toast } = useToast();
  const { 
    students, 
    loading, 
    error, 
    pagination,
    fetchStudents, 
    createStudent, 
    updateStudent, 
    deleteStudent 
  } = useStudents();
  const { courses, branches, batches, loading: lookupLoading } = useLookupData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [batchFilter, setBatchFilter] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<CreateStudentData>({
    first_name: "", 
    last_name: "", 
    email: "", 
    phone: "", 
    bmdc_no: "", 
    date_of_birth: "", 
    gender: "male", 
    address: "", 
    course_id: "", 
    branch_id: "", 
    batch_id: "", 
    admission_date: "", 
    total_fee: 0, 
    admission_fee: 0, 
    discount_amount: 0, 
    status: "active", 
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    try {
      console.log('Calling createStudent...');
      const result = await createStudent(formData);
      console.log('createStudent result:', result);
      
      if (result.success) {
        toast({ title: "Success!", description: "Student added successfully" });
        setFormData({
          first_name: "", 
          last_name: "", 
          email: "", 
          phone: "", 
          bmdc_no: "", 
          date_of_birth: "", 
          gender: "male", 
          address: "", 
          course_id: "", 
          branch_id: "", 
          batch_id: "", 
          admission_date: "", 
          total_fee: 0, 
          admission_fee: 0, 
          discount_amount: 0, 
          status: "active", 
          notes: ""
        });
        setIsAddDialogOpen(false);
      } else {
        toast({ title: "Error!", description: result.error || "Failed to add student", variant: "destructive" });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    
    // Helper function to format dates for HTML date inputs
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return '';
      // Convert date to YYYY-MM-DD format for HTML date inputs
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone,
      bmdc_no: student.bmdc_no || "",
      date_of_birth: formatDateForInput(student.date_of_birth),
      gender: student.gender,
      address: student.address,
      course_id: student.course_id.toString(),
      branch_id: student.branch_id.toString(),
      batch_id: student.batch_id.toString(),
      admission_date: formatDateForInput(student.admission_date),
      total_fee: student.total_fee,
      admission_fee: student.admission_fee,
      discount_amount: student.discount_amount,
      status: student.status,
      notes: student.notes
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    console.log('Form submitted for update with data:', formData);
    
    try {
      console.log('Calling updateStudent...');
      const result = await updateStudent(selectedStudent.id, formData);
      console.log('updateStudent result:', result);
      
      if (result.success) {
        toast({ title: "Success!", description: "Student updated successfully" });
        setFormData({
          first_name: "", 
          last_name: "", 
          email: "", 
          phone: "", 
          bmdc_no: "", 
          date_of_birth: "", 
          gender: "male", 
          address: "", 
          course_id: "", 
          branch_id: "", 
          batch_id: "", 
          admission_date: "", 
          total_fee: 0, 
          admission_fee: 0, 
          discount_amount: 0, 
          status: "active", 
          notes: ""
        });
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
      } else {
        toast({ title: "Error!", description: result.error || "Failed to update student", variant: "destructive" });
      }
    } catch (error) {
      console.error('Update submission error:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    console.log('Confirming delete for student:', selectedStudent);
    
    try {
      console.log('Calling deleteStudent...');
      const result = await deleteStudent(selectedStudent.id);
      console.log('deleteStudent result:', result);
      
      if (result.success) {
        toast({ title: "Success!", description: "Student deleted successfully" });
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
      } else {
        toast({ title: "Error!", description: result.error || "Failed to delete student", variant: "destructive" });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Error!", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setCourseFilter(null);
    setBatchFilter(null);
    setBranchFilter(null);
    setPaymentStatusFilter(null);
    setDateRangeFilter({ startDate: "", endDate: "" });
  };

  const filteredStudents = students.filter(student => {
    // Text search filter
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.bmdc_no && student.bmdc_no.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Course filter
    const matchesCourse = !courseFilter || student.course_id === courseFilter;
    
    // Batch filter
    const matchesBatch = !batchFilter || student.batch_id === batchFilter;
    
    // Branch filter
    const matchesBranch = !branchFilter || student.branch_id === branchFilter;
    
    // Payment status filter
    const matchesPaymentStatus = !paymentStatusFilter || student.payment_status === paymentStatusFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
      const admissionDate = new Date(student.admission_date);
      if (dateRangeFilter.startDate) {
        const startDate = new Date(dateRangeFilter.startDate);
        matchesDateRange = matchesDateRange && admissionDate >= startDate;
      }
      if (dateRangeFilter.endDate) {
        const endDate = new Date(dateRangeFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        matchesDateRange = matchesDateRange && admissionDate <= endDate;
      }
    }
    
    return matchesSearch && matchesCourse && matchesBatch && matchesBranch && matchesPaymentStatus && matchesDateRange;
  });

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage students and track progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Students</p>
                    <p className="text-3xl font-bold">{students.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Active Students</p>
                    <p className="text-3xl font-bold">{students.filter(s => s.status === "active").length}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Pending Payments</p>
                    <p className="text-3xl font-bold">{students.filter(s => s.payment_status === "pending").length}</p>
                  </div>
                  <div className="h-8 w-8 text-orange-200 flex items-center justify-center">
                    <span className="text-lg font-bold">৳</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold">৳{students.reduce((sum, s) => sum + s.final_fee, 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Students</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or BMDC number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Add New Student</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))} required />
                          <Input placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))} required />
                          <Input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required />
                          <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} required />
                          <Input placeholder="BMDC Registration No" value={formData.bmdc_no} onChange={(e) => setFormData(prev => ({ ...prev, bmdc_no: e.target.value }))} />
                          <Input placeholder="Date of Birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))} required />
                          <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}>
                            <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="md:col-span-2">
                            <Input placeholder="Address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} required />
                          </div>
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Select value={formData.course_id} onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))} required>
                            <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                            <SelectContent>{courses.map(course => <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <Select value={formData.branch_id} onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))} required>
                            <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                            <SelectContent>{branches.map(branch => <SelectItem key={branch.id} value={branch.id.toString()}>{branch.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <Select value={formData.batch_id} onValueChange={(value) => setFormData(prev => ({ ...prev, batch_id: value }))} required>
                            <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                            <SelectContent>{batches.map(batch => <SelectItem key={batch.id} value={batch.id.toString()}>{batch.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input placeholder="Admission Date" type="date" value={formData.admission_date} onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))} required />
                        </div>
                      </div>

                      {/* Financial Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input placeholder="Total Fee" type="number" value={formData.total_fee} onChange={(e) => setFormData(prev => ({ ...prev, total_fee: parseInt(e.target.value) || 0 }))} required />
                          <Input placeholder="Admission Fee" type="number" value={formData.admission_fee} onChange={(e) => setFormData(prev => ({ ...prev, admission_fee: parseInt(e.target.value) || 0 }))} required />
                          <Input placeholder="Discount Amount" type="number" value={formData.discount_amount} onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseInt(e.target.value) || 0 }))} />
                          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}>
                            <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <Input placeholder="Additional notes about the student" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Student</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Advanced Filters */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 items-end">
                  {/* Course Filter */}
                  <div className="min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <Select value={courseFilter || undefined} onValueChange={(value) => setCourseFilter(value === "all" ? null : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Batch Filter */}
                  <div className="min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                    <Select value={batchFilter || undefined} onValueChange={(value) => setBatchFilter(value === "all" ? null : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Batches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {batches.map(batch => (
                          <SelectItem key={batch.id} value={batch.id.toString()}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Branch Filter */}
                  <div className="min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <Select value={branchFilter || undefined} onValueChange={(value) => setBranchFilter(value === "all" ? null : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Status Filter */}
                  <div className="min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <Select value={paymentStatusFilter || undefined} onValueChange={(value) => setPaymentStatusFilter(value === "all" ? null : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        placeholder="Start Date"
                        value={dateRangeFilter.startDate}
                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        className="text-sm"
                      />
                      <Input
                        type="date"
                        placeholder="End Date"
                        value={dateRangeFilter.endDate}
                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="h-10 px-4"
                  >
                    Clear Filters
                  </Button>
                </div>
                
                {/* Filter Summary */}
                {(courseFilter || batchFilter || branchFilter || paymentStatusFilter || dateRangeFilter.startDate || dateRangeFilter.endDate) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Active filters:</span>
                      {courseFilter && (
                        <Badge variant="secondary" className="text-xs">
                          Course: {courses.find(c => c.id.toString() === courseFilter)?.name}
                        </Badge>
                      )}
                      {batchFilter && (
                        <Badge variant="secondary" className="text-xs">
                          Batch: {batches.find(b => b.id.toString() === batchFilter)?.name}
                        </Badge>
                      )}
                      {branchFilter && (
                        <Badge variant="secondary" className="text-xs">
                          Branch: {branches.find(b => b.id.toString() === branchFilter)?.name}
                        </Badge>
                      )}
                      {paymentStatusFilter && (
                        <Badge variant="secondary" className="text-xs">
                          Payment: {paymentStatusFilter.charAt(0).toUpperCase() + paymentStatusFilter.slice(1)}
                        </Badge>
                      )}
                      {dateRangeFilter.startDate && (
                        <Badge variant="secondary" className="text-xs">
                          From: {new Date(dateRangeFilter.startDate).toLocaleDateString()}
                        </Badge>
                      )}
                      {dateRangeFilter.endDate && (
                        <Badge variant="secondary" className="text-xs">
                          To: {new Date(dateRangeFilter.endDate).toLocaleDateString()}
                        </Badge>
                      )}
                      <span className="ml-2">
                        Showing {filteredStudents.length} of {students.length} students
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Students ({filteredStudents.length})</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>BMDC No</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="text-gray-500">
                          {students.length === 0 ? (
                            <p>No students found. Add your first student to get started!</p>
                          ) : (
                            <div>
                              <p className="text-lg font-medium mb-2">No students match your filters</p>
                              <p className="text-sm">Try adjusting your search criteria or clear all filters</p>
                              <Button 
                                variant="outline" 
                                onClick={clearAllFilters}
                                className="mt-3"
                              >
                                Clear All Filters
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                              <p className="text-sm text-gray-500">ID: {student.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900">{student.email}</p>
                            <p className="text-sm text-gray-500">{student.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-blue-600">{student.bmdc_no || 'N/A'}</span>
                        </TableCell>
                        <TableCell>{courses.find(c => c.id === student.course_id)?.name || 'Unknown'}</TableCell>
                        <TableCell>{batches.find(b => b.id === student.batch_id)?.name || 'Unknown'}</TableCell>
                        <TableCell>{branches.find(b => b.id === student.branch_id)?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className={student.payment_status === 'paid' ? 'bg-green-100 text-green-800' : student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}>
                            {student.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">৳{student.final_fee.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedStudent(student); setIsViewDialogOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => { setSelectedStudent(student); setIsDeleteDialogOpen(true); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* View Dialog - Improved Design */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-2xl font-bold text-gray-900">Student Details</DialogTitle></DialogHeader>
              {selectedStudent && (
                <div className="space-y-6">
                  {/* Student Header with Avatar */}
                  <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                      <p className="text-gray-600 text-lg">Student ID: {selectedStudent.id}</p>
                      {selectedStudent.bmdc_no && (
                        <p className="text-blue-600 font-medium">BMDC: {selectedStudent.bmdc_no}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={`text-sm px-3 py-1 ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedStudent.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="text-gray-900 font-medium">{selectedStudent.email}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="text-gray-900 font-medium">{selectedStudent.phone}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p className="text-gray-900 font-medium">{selectedStudent.date_of_birth}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="text-gray-900 font-medium capitalize">{selectedStudent.gender}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-gray-900 font-medium">{selectedStudent.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
                      Academic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Course</p>
                        <p className="text-lg font-bold text-gray-900">{courses.find(c => c.id === selectedStudent.course_id)?.name}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Branch</p>
                        <p className="text-lg font-bold text-gray-900">{branches.find(b => b.id === selectedStudent.branch_id)?.name}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-2">Batch</p>
                        <p className="text-lg font-bold text-gray-900">{batches.find(b => b.id === selectedStudent.batch_id)?.name}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg md:col-span-3">
                        <p className="text-sm font-medium text-gray-500 mb-2">Admission Date</p>
                        <p className="text-lg font-bold text-gray-900">{selectedStudent.admission_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information - Improved Design */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                      Financial Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-600 mb-2">Total Fee</p>
                        <p className="text-xl font-bold text-blue-900">৳{selectedStudent.total_fee.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-600 mb-2">Admission Fee</p>
                        <p className="text-xl font-bold text-green-900">৳{selectedStudent.admission_fee.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-600 mb-2">Discount</p>
                        <p className="text-xl font-bold text-yellow-900">৳{selectedStudent.discount_amount.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-600 mb-2">Final Fee</p>
                        <p className="text-xl font-bold text-purple-900">৳{selectedStudent.final_fee.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
                        <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                        <Badge className={`${selectedStudent.payment_status === 'paid' ? 'bg-green-100 text-green-800' : selectedStudent.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
                          {selectedStudent.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedStudent.notes && (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-2 h-6 bg-orange-500 rounded-full mr-3"></span>
                        Additional Notes
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">{selectedStudent.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))} required />
                    <Input placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))} required />
                    <Input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                    <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                    <Input placeholder="BMDC Registration No" value={formData.bmdc_no} onChange={(e) => setFormData(prev => ({ ...prev, bmdc_no: e.target.value }))} />
                    <Input placeholder="Date of Birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))} required />
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}>
                      <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="md:col-span-2">
                      <Input placeholder="Address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select value={formData.course_id} onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}>
                      <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                      <SelectContent>{courses.map(course => <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={formData.branch_id} onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}>
                      <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                      <SelectContent>{branches.map(branch => <SelectItem key={branch.id} value={branch.id.toString()}>{branch.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={formData.batch_id} onValueChange={(value) => setFormData(prev => ({ ...prev, batch_id: value }))}>
                      <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                      <SelectContent>{batches.map(batch => <SelectItem key={batch.id} value={batch.id.toString()}>{batch.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Admission Date" type="date" value={formData.admission_date} onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))} required />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Total Fee" type="number" value={formData.total_fee} onChange={(e) => setFormData(prev => ({ ...prev, total_fee: parseInt(e.target.value) || 0 }))} required />
                    <Input placeholder="Admission Fee" type="number" value={formData.admission_fee} onChange={(e) => setFormData(prev => ({ ...prev, admission_fee: parseInt(e.target.value) || 0 }))} required />
                    <Input placeholder="Discount Amount" type="number" value={formData.discount_amount} onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseInt(e.target.value) || 0 }))} />
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}>
                      <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <Input placeholder="Additional notes about the student" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Update Student</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
              <div className="py-4">
                <p className="text-gray-600">Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedStudent?.first_name} {selectedStudent?.last_name}</span>? This action cannot be undone.</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete Student</Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

