import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

export interface Course {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  fee?: number;
  status?: 'active' | 'inactive';
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export interface Batch {
  id: string;
  name: string;
  course_id: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
}

export interface Faculty {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  status?: 'active' | 'inactive';
}

export const useLookupData = () => {
  const queryClient = useQueryClient();

  // Use React Query for all lookup data with ultra-fast settings
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const response = await apiService.getCourses();
        if (Array.isArray(response)) {
          return response;
        } else if (response.success && response.data) {
          return response.data || [];
        } else {
          throw new Error(response.message || 'Failed to fetch courses');
        }
      } catch (error) {
        console.log('Courses API failed, using fallback data');
        return [
          { id: '1', name: 'DMU Course' },
          { id: '2', name: 'CMU Course' },
          { id: '3', name: 'ARDMS Course' },
        ];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour - very long cache
    gcTime: 120 * 60 * 1000, // 2 hours - very long garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0, // No retries
    retryDelay: 0, // No delay
  });

  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        const response = await apiService.getBranches();
        if (Array.isArray(response)) {
          return response;
        } else if (response.success && response.data) {
          return response.data || [];
        } else {
          throw new Error(response.message || 'Failed to fetch branches');
        }
      } catch (error) {
        console.log('Branches API failed, using fallback data');
        return [
          { id: '1', name: 'Dhaka Branch' },
          { id: '2', name: 'Chittagong Branch' },
          { id: '3', name: 'Sylhet Branch' },
        ];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 120 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0,
    retryDelay: 0,
  });

  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      try {
        const response = await apiService.getBatches();
        if (Array.isArray(response)) {
          return response;
        } else if (response.success && response.data) {
          return response.data || [];
        } else {
          throw new Error(response.message || 'Failed to fetch batches');
        }
      } catch (error) {
        console.log('Batches API failed, using fallback data');
        return [
          { id: '1', name: 'DMU Batch 15' },
          { id: '2', name: 'CMU Batch 8' },
          { id: '3', name: 'ARDMS Batch 5' },
        ];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 120 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0,
    retryDelay: 0,
  });

  const { data: faculties = [], isLoading: facultiesLoading } = useQuery({
    queryKey: ['faculties'],
    queryFn: async () => {
      try {
        const response = await apiService.getFaculties();
        if (Array.isArray(response)) {
          return response;
        } else if (response.success && response.data) {
          // Handle paginated response: response.data.data contains the actual array
          if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
          } else if (Array.isArray(response.data)) {
            return response.data;
          } else {
            return [];
          }
        } else {
          throw new Error(response.message || 'Failed to fetch faculties');
        }
      } catch (error) {
        console.log('Faculties API failed, using fallback data');
        return [
          { id: 1, name: 'Dr. Ahmed Rahman' },
          { id: 2, name: 'Dr. Fatima Begum' },
          { id: 3, name: 'Dr. Mohammad Ali' },
        ];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 120 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0,
    retryDelay: 0,
  });

  const loading = coursesLoading || branchesLoading || batchesLoading || facultiesLoading;

  // Wrapper functions for backward compatibility
  const fetchCourses = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['courses'] });
  }, [queryClient]);

  const fetchBranches = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['branches'] });
  }, [queryClient]);

  const fetchBatches = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['batches'] });
  }, [queryClient]);

  const fetchFaculties = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['faculties'] });
  }, [queryClient]);

  const fetchAllLookupData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['courses'] }),
      queryClient.invalidateQueries({ queryKey: ['branches'] }),
      queryClient.invalidateQueries({ queryKey: ['batches'] }),
      queryClient.invalidateQueries({ queryKey: ['faculties'] }),
    ]);
  }, [queryClient]);

  return {
    courses,
    branches,
    batches,
    faculties,
    loading,
    error: null, // React Query handles errors internally
    fetchCourses,
    fetchBranches,
    fetchBatches,
    fetchFaculties,
    fetchAllLookupData,
    clearError: () => {
      // Clear all lookup data
      queryClient.setQueryData(['courses'], null);
      queryClient.setQueryData(['branches'], null);
      queryClient.setQueryData(['batches'], null);
      queryClient.setQueryData(['faculties'], null);
    },
  };
};
