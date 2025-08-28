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
  start_date?: string;
  end_date?: string;
  course_id?: string;
  is_active?: boolean;
}

export const useLookupData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
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

  const fetchAllLookupData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchCourses(),
        fetchBranches(),
        fetchBatches(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchCourses, fetchBranches, fetchBatches]);

  // Initial fetch
  useEffect(() => {
    fetchAllLookupData();
  }, [fetchAllLookupData]);

  return {
    courses,
    branches,
    batches,
    loading,
    error,
    fetchCourses,
    fetchBranches,
    fetchBatches,
    fetchAllLookupData,
    clearError: () => setError(null),
  };
};
