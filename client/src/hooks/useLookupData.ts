import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';

export interface Course {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  total_fee?: string;
  admission_fee?: string;
  is_active?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  course_id?: string;
  branch_id?: string;
  faculty_id?: string;
  max_students?: number;
  current_students?: number;
  status?: string;
  is_active?: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  is_active?: boolean;
}

export const useLookupData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourses();
      
      // Handle direct array response from public endpoints
      if (Array.isArray(response)) {
        setCourses(response);
      } else if (response.success && response.data) {
        setCourses(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch courses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getBranches();
      
      // Handle direct array response from public endpoints
      if (Array.isArray(response)) {
        setBranches(response);
      } else if (response.success && response.data) {
        setBranches(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch branches');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getBatches();
      
      // Handle direct array response from public endpoints
      if (Array.isArray(response)) {
        setBatches(response);
      } else if (response.success && response.data) {
        setBatches(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch batches');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFaculties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getFaculties();
      
      // Handle paginated response from public endpoints
      if (Array.isArray(response)) {
        setFaculties(response);
      } else if (response.success && response.data) {
        // Handle paginated response: response.data.data contains the actual array
        if (response.data.data && Array.isArray(response.data.data)) {
          setFaculties(response.data.data);
        } else if (Array.isArray(response.data)) {
          setFaculties(response.data);
        } else {
          setFaculties([]);
        }
      } else {
        setError(response.message || 'Failed to fetch faculties');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllLookupData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchCourses(),
        fetchBranches(),
        fetchBatches(),
        fetchFaculties(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchCourses, fetchBranches, fetchBatches, fetchFaculties]);

  // Initial fetch
  useEffect(() => {
    fetchAllLookupData();
  }, [fetchAllLookupData]);

  return {
    courses,
    branches,
    batches,
    faculties,
    loading,
    error,
    fetchCourses,
    fetchBranches,
    fetchBatches,
    fetchFaculties,
    fetchAllLookupData,
    clearError: () => setError(null),
  };
};
