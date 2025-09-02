// API Client utility for authenticated requests
export const apiClient = {
  async fetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  },

  async get(url: string) {
    return this.fetch(url, { method: 'GET' });
  },

  async post(url: string, data?: any) {
    return this.fetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put(url: string, data?: any) {
    return this.fetch(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete(url: string) {
    return this.fetch(url, { method: 'DELETE' });
  },
};




