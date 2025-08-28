import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bmdc_no?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  course_id: number;
  branch_id: number;
  batch_id: number;
  admission_date: string;
  total_fee: number;
  admission_fee: number;
  discount_amount: number;
  final_fee: number;
  payment_status: 'pending' | 'partial' | 'completed';
  status: 'active' | 'inactive';
  notes?: string;
  course?: { id: number; name: string };
  branch?: { id: number; name: string };
  batch?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export interface StudentsResponse {
  success: boolean;
  data: {
    data: Student[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bmdc_no?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  course_id: number;
  branch_id: number;
  batch_id: number;
  admission_date: string;
  total_fee: number;
  admission_fee: number;
  discount_amount?: number;
  status: 'active' | 'inactive';
  notes?: string;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const fetchStudents = useCallback(async (params?: {
    search?: string;
    status?: string;
    course_id?: number;
    branch_id?: number;
    batch_id?: number;
    page?: number;
  }) => {
    try {
      console.log('useStudents: fetchStudents called with params:', params);
      setLoading(true);
      setError(null);
      
      console.log('useStudents: calling apiService.getStudents...');
      const response: StudentsResponse = await apiService.getStudents(params);
      console.log('useStudents: apiService.getStudents response:', response);
      
      if (response.success) {
        setStudents(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } else {
        console.log('useStudents: getStudents failed:', response.message);
        setError(response.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('useStudents: fetchStudents error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (studentData: CreateStudentData) => {
    try {
      console.log('useStudents: createStudent called with:', studentData);
      setLoading(true);
      setError(null);
      
      console.log('useStudents: calling apiService.createStudent...');
      const response = await apiService.createStudent(studentData);
      console.log('useStudents: apiService.createStudent response:', response);
      
      if (response.success) {
        // Refresh the students list
        console.log('useStudents: Student created successfully, refreshing list...');
        await fetchStudents();
        return { success: true, data: response.data };
      } else {
        console.log('useStudents: Student creation failed:', response.message);
        setError(response.message || 'Failed to create student');
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('useStudents: createStudent error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  const updateStudent = useCallback(async (id: string, studentData: Partial<CreateStudentData>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.updateStudent(id, studentData);
      
      if (response.success) {
        // Update the student in the local state
        setStudents(prev => prev.map(student => 
          student.id === id ? { ...student, ...response.data } : student
        ));
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update student');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.deleteStudent(id);
      
      if (response.success) {
        // Remove the student from the local state
        setStudents(prev => prev.filter(student => student.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete student');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudent = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getStudent(id);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to fetch student');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    pagination,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    clearError: () => setError(null),
  };
};
