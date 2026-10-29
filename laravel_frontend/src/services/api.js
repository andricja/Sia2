const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('API Base URL:', this.baseURL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If body is an object, stringify it
    const body = options.body && typeof options.body === 'object' 
      ? JSON.stringify(options.body)
      : options.body;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
      ...(body && { body }),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Include validation errors if available
        throw {
          message: data.message || 'API request failed',
          errors: data.errors || null,
          status: response.status
        };
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Medicine endpoints
  async getMedicines(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/medicines?${queryString}` : '/medicines';
    return this.request(endpoint);
  }

  async getMedicine(id) {
    return this.request(`/medicines/${id}`);
  }

  async createMedicine(data) {
    return this.request('/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMedicine(id, data) {
    return this.request(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMedicine(id) {
    return this.request(`/medicines/${id}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(data) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id, data) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
