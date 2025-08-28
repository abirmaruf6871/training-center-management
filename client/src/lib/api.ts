// FRESH API SERVICE - NO CACHING ISSUES
class ApiService {
  private baseURL = 'http://localhost:8000/api';

  constructor() {
    console.log('🚀 FRESH ApiService created with baseURL:', this.baseURL);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🔍 FRESH ApiService making request to:', url);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

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

  // Batch methods
  async getBatches() {
    console.log('📅 Getting batches from:', `${this.baseURL}/batches-public`);
    return this.request('/batches-public');
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

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();
export default apiService;
