const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Api {
  request(endpoint: string, options?: RequestInit): Promise<any>;
  post(endpoint: string, body: any): Promise<any>;
  postForm(endpoint: string, formData: FormData): Promise<any>;
  get(endpoint: string): Promise<any>;
  delete(endpoint: string): Promise<any>;
}

export const api: Api = {
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "API request failed");
    }

    return response.json();
  },

  async post(endpoint: string, body: any): Promise<any> {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  
  async postForm(endpoint: string, formData: FormData): Promise<any> {
     const token = localStorage.getItem("token");
     const headers: HeadersInit = {};
     if (token) {
        headers["Authorization"] = `Bearer ${token}`;
     }
     
     const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData
     });
     
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "API request failed");
     }
     return response.json();
  },

  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: "GET" });
  },
  
  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: "DELETE" });
  }
};
