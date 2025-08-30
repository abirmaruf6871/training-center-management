// FRESH API SERVICE - NO CACHING ISSUES
class ApiService {
  private baseURL = 'http://localhost:8000/api';

  constructor() {
    console.log('🚀 FRESH ApiService created with baseURL:', this.baseURL);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🔍 FRESH ApiService making request to:', url);
    
    // Get authentication token
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      console.log('✅ Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Success response:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Generic request method for custom endpoints
  async customRequest(method: string, endpoint: string, data?: any) {
    const options: RequestInit = {
      method: method.toUpperCase(),
    };
    
    if (data) {
      if (method.toUpperCase() === 'GET') {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        endpoint = `${endpoint}?${params.toString()}`;
      } else {
        options.body = JSON.stringify(data);
      }
    }
    
    return this.request(endpoint, options);
  }

  // Course methods
  async getCourses() {
    console.log('📚 Getting courses from:', `${this.baseURL}/courses-public`);
    return this.request('/courses-public');
  }

  // Branch methods
  async getBranches() {
    console.log('🏢 Getting branches from:', `${this.baseURL}/branches-public`);
    return this.request('/branches-public');
  }

  async getBranch(id: string) {
    console.log('🏢 Getting branch from:', `${this.baseURL}/branches-public/${id}`);
    return this.request(`/branches-public/${id}`);
  }

  async createBranch(branchData: any) {
    console.log('🏢 Creating branch at:', `${this.baseURL}/branches`);
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }

  async updateBranch(id: string, branchData: any) {
    console.log('🏢 Updating branch at:', `${this.baseURL}/branches/${id}`);
    return this.request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    });
  }

  async deleteBranch(id: string) {
    console.log('🏢 Deleting branch at:', `${this.baseURL}/branches/${id}`);
    return this.request(`/branches/${id}`, {
      method: 'DELETE',
    });
  }

  async getBranchFinancialReport(id: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    console.log('🏢 Getting branch financial report from:', `${this.baseURL}/branches/${id}/financial-report?${params}`);
    return this.request(`/branches/${id}/financial-report?${params}`);
  }

  async getConsolidatedReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    console.log('🏢 Getting consolidated report from:', `${this.baseURL}/branches/consolidated-report?${params}`);
    return this.request(`/branches/consolidated-report?${params}`);
  }

  async getBranchStatistics(id: string) {
    console.log('🏢 Getting branch statistics from:', `${this.baseURL}/branches/${id}/statistics`);
    return this.request(`/branches/${id}/statistics`);
  }

  async toggleBranchStatus(id: string) {
    console.log('🏢 Toggling branch status at:', `${this.baseURL}/branches/${id}/toggle-status`);
    return this.request(`/branches/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Faculty methods
  async getFaculties() {
    console.log('👨‍🏫 Getting faculties from:', `${this.baseURL}/faculties-public`);
    return this.request('/faculties-public');
  }

  // Batch methods
  async getBatches() {
    console.log('📅 Getting batches from:', `${this.baseURL}/batches-public`);
    return this.request('/batches-public');
  }

  async getBatch(id: string) {
    console.log('📅 Getting batch at:', `${this.baseURL}/batches-public/${id}`);
    return this.request(`/batches-public/${id}`);
  }

  async createBatch(batchData: any) {
    console.log('📅 Creating batch at:', `${this.baseURL}/batches-public`);
    return this.request('/batches-public', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  async updateBatch(id: string, batchData: any) {
    console.log('✏️ Updating batch at:', `${this.baseURL}/batches-public/${id}`);
    return this.request(`/batches-public/${id}`, {
      method: 'PUT',
      body: JSON.stringify(batchData),
    });
  }

  async deleteBatch(id: string) {
    console.log('🗑️ Deleting batch at:', `${this.baseURL}/batches-public/${id}`);
    return this.request(`/batches-public/${id}`, {
      method: 'DELETE',
    });
  }

  // Student methods
  async getStudents(params?: any) {
    console.log('👥 Getting students from:', `${this.baseURL}/students-public`);
    console.log('👥 Parameters:', params);
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/students-public${queryString ? `?${queryString}` : ''}`;
    console.log('👥 Final endpoint:', endpoint);
    
    return this.request(endpoint);
  }

  async createStudent(studentData: any) {
    console.log('➕ Creating student at:', `${this.baseURL}/students-public`);
    return this.request('/students-public', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: string, studentData: any) {
    console.log('✏️ Updating student at:', `${this.baseURL}/students-public/${id}`);
    return this.request(`/students-public/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id: string) {
    console.log('🗑️ Deleting student at:', `${this.baseURL}/students-public/${id}`);
    return this.request(`/students-public/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudent(id: string) {
    console.log('👤 Getting student at:', `${this.baseURL}/students-public/${id}`);
    return this.request(`/students-public/${id}`);
  }

  // Course methods
  async createCourse(courseData: any) {
    console.log('📚 Creating course at:', `${this.baseURL}/courses-public`);
    return this.request('/courses-public', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async getCourse(id: string) {
    console.log('📚 Getting course at:', `${this.baseURL}/courses-public/${id}`);
    return this.request(`/courses-public/${id}`);
  }

  async updateCourse(id: string, courseData: any) {
    console.log('✏️ Updating course at:', `${this.baseURL}/courses-public/${id}`);
    return this.request(`/courses-public/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string) {
    console.log('🗑️ Deleting course at:', `${this.baseURL}/courses-public/${id}`);
    return this.request(`/courses-public/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth methods
  async login(credentials: { username: string; password: string }) {
    console.log('🔐 Login at:', `${this.baseURL}/auth/login`);
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async getUser() {
    return this.request('/auth/user');
  }

  // Attendance methods
  async getAttendance(params?: any) {
    console.log('📊 Getting attendance from:', `${this.baseURL}/attendance`);
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/attendance${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async createAttendance(attendanceData: any) {
    console.log('📊 Creating attendance at:', `${this.baseURL}/attendance`);
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  // Exam methods
  async getExams(params?: any) {
    console.log('📝 Getting exams from:', `${this.baseURL}/exams-public`);
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/exams-public${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async createExam(examData: any) {
    console.log('📝 Creating exam at:', `${this.baseURL}/exams-public`);
    return this.request('/exams-public', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();
export default apiService;
