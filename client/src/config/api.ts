// API Configuration
export const API_CONFIG = {
  // Change this to match your Laravel backend URL
  BASE_URL: 'http://localhost:8000/api',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      USER: '/auth/user',
    },
    STUDENTS: '/students-public', // Using public endpoint temporarily
    COURSES: '/courses-public', // Using public endpoint temporarily
    BRANCHES: '/branches-public', // Using public endpoint temporarily
    BATCHES: '/batches-public', // Using public endpoint temporarily
    PAYMENTS: '/payments',
    DASHBOARD: '/dashboard/stats',
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry attempts
  MAX_RETRIES: 3,
};

// Legacy export for backward compatibility
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;

