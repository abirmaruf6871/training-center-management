import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLookupData, Batch, Branch, Course, Faculty } from '@/hooks/useLookupData';
import Sidebar from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Eye, Edit, Trash2, Users, Calendar, MapPin, GraduationCap, Loader2, BookOpen, X } from 'lucide-react';

export default function Batches() {
  const { toast } = useToast();
  const { branches, courses, faculties, loading: lookupLoading, error: lookupError } = useLookupData();
  const [, setLocation] = useLocation();
  
  // Debug logging for faculties
  useEffect(() => {
    console.log('🔍 Faculties state:', faculties);
    console.log('🔍 Faculties type:', typeof faculties);
    console.log('🔍 Faculties isArray:', Array.isArray(faculties));
    console.log('🔍 Faculties length:', faculties?.length);
  }, [faculties]);
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Create batch modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    course_id: undefined as string | undefined,
    branch_id: undefined as string | undefined,
    faculty_id: undefined as string | undefined,
    max_students: '',
    status: 'upcoming'
  });

  // Fetch batches
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBatches();
      
      // Ensure we always set an array
      if (Array.isArray(response)) {
        setBatches(response);
      } else if (response && response.success && Array.isArray(response.data)) {
        setBatches(response.data);
      } else if (response && response.success && response.data) {
        setBatches(Array.isArray(response.data) ? response.data : []);
      } else {
        setBatches([]);
        if (response && response.message) {
          toast({
            title: "Error",
            description: response.message || 'Failed to fetch batches',
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Filter batches based on search and filters
  const filteredBatches = Array.isArray(batches) ? batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || !selectedBranch || batch.branch_id === selectedBranch;
    const matchesCourse = selectedCourse === 'all' || !selectedCourse || batch.course_id === selectedCourse;
    const matchesStatus = selectedStatus === 'all' || !selectedStatus || (batch.status && batch.status === selectedStatus);
    
    return matchesSearch && matchesBranch && matchesCourse && matchesStatus;
  }) : [];

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
    
    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}${days > 0 ? ` ${days} days` : ''}`;
    }
    return `${days} days`;
  };

  const handleViewBatch = (batchId: string) => {
    setLocation(`/batch-detail/${batchId}`);
  };

  const handleCreateBatch = () => {
    setShowCreateModal(true);
  };

  const handleCreateInputChange = (field: string, value: string) => {
    console.log(`Setting ${field} to:`, value); // Debug log
    setCreateFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('Updated form data:', newData); // Debug log
      return newData;
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
         // Debug logging
     console.log('Form submission attempt:', createFormData);
     console.log('Validation check:', {
       name: !!createFormData.name,
       course_id: !!createFormData.course_id,
       branch_id: !!createFormData.branch_id,
       faculty_id: !!createFormData.faculty_id
     });
     console.log('Raw values:', {
       name: createFormData.name,
       course_id: createFormData.course_id,
       branch_id: createFormData.branch_id,
       faculty_id: createFormData.faculty_id
     });
    
    if (!createFormData.name || !createFormData.course_id || !createFormData.branch_id || !createFormData.faculty_id) {
      console.log('Validation failed - missing fields');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreateLoading(true);
      const response = await apiService.createBatch({
        ...createFormData,
        max_students: parseInt(createFormData.max_students) || 30,
        current_students: 0,
        is_active: true
      });

      if (response && response.success) {
        toast({
          title: "Success",
          description: "Batch created successfully!",
        });
        setShowCreateModal(false);
                 // Reset form
         setCreateFormData({
           name: '',
           description: '',
           start_date: '',
           end_date: '',
           course_id: undefined,
           branch_id: undefined,
           faculty_id: undefined,
           max_students: '',
           status: 'upcoming'
         });
        // Refresh batches list
        fetchBatches();
      } else {
        toast({
          title: "Error",
          description: response?.message || 'Failed to create batch',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      course_id: undefined,
      branch_id: undefined,
      faculty_id: undefined,
      max_students: '',
      status: 'upcoming'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading batches...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Batch Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage all batches and their details</p>
            </div>
            <Button onClick={handleCreateBatch} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(batches) ? batches.length : 0}</div>
              <p className="text-xs text-muted-foreground">All batches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(batches) ? batches.filter(b => b.status === 'active').length : 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(batches) ? batches.reduce((sum, batch) => sum + (batch.current_students || 0), 0) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Enrolled across all batches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Batches</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Array.isArray(batches) ? batches.filter(b => b.status === 'completed').length : 0}
              </div>
              <p className="text-xs text-muted-foreground">Finished batches</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                                   <Select value={selectedBranch || "all"} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="All branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All branches</SelectItem>
                      {Array.isArray(branches) && branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                                   <Select value={selectedCourse || "all"} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="All courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All courses</SelectItem>
                      {Array.isArray(courses) && courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                   <Select value={selectedStatus || "all"} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Batches ({filteredBatches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
                                 <p className="text-gray-600 mb-4">
                   {searchTerm || (selectedBranch && selectedBranch !== 'all') || (selectedCourse && selectedCourse !== 'all') || (selectedStatus && selectedStatus !== 'all')
                     ? 'Try adjusting your filters' 
                     : 'Create your first batch to get started'}
                 </p>
                 {!searchTerm && (!selectedBranch || selectedBranch === 'all') && (!selectedCourse || selectedCourse === 'all') && (!selectedStatus || selectedStatus === 'all') && (
                  <Button onClick={handleCreateBatch}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Batch
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => {
                      const course = courses.find(c => c.id === batch.course_id);
                      const branch = branches.find(b => b.id === batch.branch_id);
                      const faculty = faculties.find(f => f.id === batch.faculty_id);
                      
                      return (
                        <TableRow key={batch.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{batch.name}</div>
                              {batch.description && (
                                <div className="text-sm text-gray-500">{batch.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                              {course?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {branch?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-gray-400" />
                              {faculty?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {getDurationText(batch.start_date, batch.end_date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(batch.start_date)} - {formatDate(batch.end_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{batch.current_students || 0}</span>
                              <span className="text-gray-500">/ {batch.max_students || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              batch.status === 'active' ? 'bg-green-100 text-green-800' :
                              batch.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              batch.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {batch.status ? batch.status.charAt(0).toUpperCase() + batch.status.slice(1) : 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBatch(batch.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Batch Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Create New Batch</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
                     <form onSubmit={handleCreateSubmit} className="space-y-6">
             {/* Debug Info - Remove this after fixing */}
             <div className="bg-gray-100 p-4 rounded text-xs">
               <div className="font-semibold mb-2">Debug Info (Current Form Values):</div>
               <div className="grid grid-cols-2 gap-2">
                 <div>Name: "{createFormData.name}"</div>
                 <div>Course ID: "{createFormData.course_id}"</div>
                 <div>Branch ID: "{createFormData.branch_id}"</div>
                 <div>Faculty ID: "{createFormData.faculty_id}"</div>
                 <div>Start Date: "{createFormData.start_date}"</div>
                 <div>End Date: "{createFormData.end_date}"</div>
               </div>
               {lookupLoading && (
                 <div className="mt-2 text-blue-600">
                   🔄 Loading lookup data (courses, branches, faculties)...
                 </div>
               )}
               {lookupError && (
                 <div className="mt-2 text-red-600">
                   ❌ Lookup error: {lookupError}
                 </div>
               )}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Name *
                  </label>
                  <Input
                    placeholder="Enter batch name"
                    value={createFormData.name}
                    onChange={(e) => handleCreateInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="Enter batch description"
                    value={createFormData.description}
                    onChange={(e) => handleCreateInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={createFormData.start_date}
                    onChange={(e) => handleCreateInputChange('start_date', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={createFormData.end_date}
                    onChange={(e) => handleCreateInputChange('end_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Course and Branch Selection */}
              <div className="space-y-4">
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Course *
                   </label>
                                       <Select 
                      value={createFormData.course_id || undefined} 
                      onValueChange={(value) => handleCreateInputChange('course_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(courses) && courses.length > 0 ? (
                          courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            {lookupLoading ? 'Loading courses...' : 'No courses available'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                 </div>

                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Branch *
                   </label>
                                       <Select 
                      value={createFormData.branch_id || undefined} 
                      onValueChange={(value) => handleCreateInputChange('branch_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(branches) && branches.length > 0 ? (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            {lookupLoading ? 'Loading branches...' : 'No branches available'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                 </div>

                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Faculty *
                   </label>
                                       <Select 
                      value={createFormData.faculty_id || undefined} 
                      onValueChange={(value) => handleCreateInputChange('faculty_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(faculties) && faculties.length > 0 ? (
                          faculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            {lookupLoading ? 'Loading faculties...' : 'No faculties available'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                 </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Students
                  </label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={createFormData.max_students}
                    onChange={(e) => handleCreateInputChange('max_students', e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select 
                    value={createFormData.status} 
                    onValueChange={(value) => handleCreateInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                disabled={createLoading}
              >
                Cancel
              </Button>
                             <Button
                 type="submit"
                 disabled={createLoading || lookupLoading}
                 className="bg-blue-600 hover:bg-blue-700 text-white"
               >
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Batch
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
