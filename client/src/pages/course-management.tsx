import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { isUnauthorizedError } from '../lib/authUtils';
import TopNav from '../components/layout/topnav';
import Sidebar from '../components/layout/sidebar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  GraduationCap,
  Building2
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  totalFee: number;
  admissionFee: number;
  installmentCount: number;
  batchSizeLimit: number;
  branchId: string;
  discountPercentage: number;
  isActive: boolean;
  studentCount?: number;
  totalIncome?: number;
  pendingDues?: number;
  installments?: any[];
  scholarships?: any[];
  branch?: any;
}

interface Branch {
  id: string;
  name: string;
}

const CourseManagement: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 12,
    totalFee: '',
    admissionFee: '',
    installmentCount: 1,
    batchSizeLimit: 30,
    branchId: '',
    discountPercentage: 0
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await fetch('/api/branches');
      if (!response.ok) throw new Error('Failed to fetch branches');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (coursesError && isUnauthorizedError(coursesError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please log in again.",
        variant: "destructive",
      });
      return;
    }
  }, [coursesError, toast]);

  // Create course mutation
  const createCourse = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Course created successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update course mutation
  const updateCourse = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Course updated successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete course mutation
  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Success",
        description: "Course deleted successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 12,
      totalFee: '',
      admissionFee: '',
      installmentCount: 1,
      batchSizeLimit: 30,
      branchId: '',
      discountPercentage: 0
    });
  };

  const handleCreate = () => {
    createCourse.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedCourse) {
      updateCourse.mutate({ id: selectedCourse.id, data: formData });
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      duration: course.duration,
      totalFee: course.totalFee.toString(),
      admissionFee: course.admissionFee.toString(),
      installmentCount: course.installmentCount,
      batchSizeLimit: course.batchSizeLimit,
      branchId: course.branchId,
      discountPercentage: course.discountPercentage
    });
    setIsEditModalOpen(true);
  };

  const handleView = (course: Course) => {
    setSelectedCourse(course);
    setIsViewModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT'
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

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Management</h1>
                <p className="text-sm text-gray-600">Manage your academy courses, fees, and student enrollment</p>
              </div>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add New Course
                </button>
              )}
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
                    {courses.reduce((sum: number, course: Course) => sum + (course.studentCount || 0), 0)}
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
                    {formatCurrency(courses.reduce((sum: number, course: Course) => sum + (course.totalIncome || 0), 0))}
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
                    {formatCurrency(courses.reduce((sum: number, course: Course) => sum + (course.pendingDues || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
              {/* Course Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.isActive ? (
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
              </div>

              {/* Course Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{getDurationText(course.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{course.batchSizeLimit} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{course.branch?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>{course.installmentCount} installments</span>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Fee:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(course.totalFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Admission Fee:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(course.admissionFee)}</span>
                  </div>
                  {course.discountPercentage > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-green-600">{course.discountPercentage}%</span>
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
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <>
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                                              {user?.role === 'admin' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                                deleteCourse.mutate(course.id);
                              }
                            }}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <CourseModal
          title="Create New Course"
          formData={formData}
          setFormData={setFormData}
          branches={branches}
          onSubmit={handleCreate}
          onClose={() => setIsCreateModalOpen(false)}
          isLoading={createCourse.isPending}
        />
      )}

      {/* Edit Course Modal */}
      {isEditModalOpen && selectedCourse && (
        <CourseModal
          title="Edit Course"
          formData={formData}
          setFormData={setFormData}
          branches={branches}
          onSubmit={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
          isLoading={updateCourse.isPending}
        />
      )}

      {/* View Course Modal */}
      {isViewModalOpen && selectedCourse && (
        <ViewCourseModal
          course={selectedCourse}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

// Course Modal Component
interface CourseModalProps {
  title: string;
  formData: any;
  setFormData: (data: any) => void;
  branches: Branch[];
  onSubmit: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const CourseModal: React.FC<CourseModalProps> = ({
  title,
  formData,
  setFormData,
  branches,
  onSubmit,
  onClose,
  isLoading
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., CMU Course"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Fee (৳)</label>
              <input
                type="number"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="150000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admission Fee (৳)</label>
              <input
                type="number"
                value={formData.admissionFee}
                onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Installment Count</label>
              <input
                type="number"
                value={formData.installmentCount}
                onChange={(e) => setFormData({ ...formData, installmentCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size Limit</label>
              <input
                type="number"
                value={formData.batchSizeLimit}
                onChange={(e) => setFormData({ ...formData, batchSizeLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Course description..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>
    </div>
  );
};

// View Course Modal Component
interface ViewCourseModalProps {
  course: Course;
  onClose: () => void;
}

const ViewCourseModal: React.FC<ViewCourseModalProps> = ({ course, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{course.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Course Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{course.duration} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch Size:</span>
                  <span className="font-medium">{course.batchSizeLimit} students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-medium">{course.branch?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fee:</span>
                  <span className="font-medium text-lg">{formatCurrency(course.totalFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admission Fee:</span>
                  <span className="font-medium">{formatCurrency(course.admissionFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Installments:</span>
                  <span className="font-medium">{course.installmentCount}</span>
                </div>
                {course.discountPercentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">{course.discountPercentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{course.studentCount || 0}</div>
              <div className="text-blue-600 font-medium">Enrolled Students</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(course.totalIncome || 0)}</div>
              <div className="text-green-600 font-medium">Total Income</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{formatCurrency(course.pendingDues || 0)}</div>
              <div className="text-orange-600 font-medium">Pending Dues</div>
            </div>
          </div>

          {/* Installments */}
          {course.installments && course.installments.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Installment Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {course.installments.map((inst: any) => (
                  <div key={inst.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{inst.installmentNumber}</div>
                      <div className="text-sm text-gray-600 mb-2">Installment</div>
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(inst.amount)}</div>
                      <div className="text-xs text-gray-500 mt-1">Due: {new Date(inst.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scholarships */}
          {course.scholarships && course.scholarships.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Scholarships</h3>
              <div className="space-y-3">
                {course.scholarships.map((scholarship: any) => (
                  <div key={scholarship.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{scholarship.name}</div>
                        <div className="text-sm text-gray-600">{scholarship.description}</div>
                        {scholarship.eligibilityCriteria && (
                          <div className="text-xs text-gray-500 mt-1">Eligibility: {scholarship.eligibilityCriteria}</div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-green-600">{scholarship.discountPercentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700">{course.description}</p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
