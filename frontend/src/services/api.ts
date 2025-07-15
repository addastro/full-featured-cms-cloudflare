// API configuration for LEVERAGE AI CMS
import { HealthResponse, ContentItem, AIResponse, SearchResponse } from '../types/api';

const API_BASE_URL = 'https://leverage-ai-cms-prod.ceo-a53.workers.dev';

// API client with error handling
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health check
  async getHealth(): Promise<HealthResponse> {
    return this.makeRequest('/api/health');
  }

  // Content management
  async getContent(): Promise<ContentItem[]> {
    return this.makeRequest('/api/content');
  }

  async createContent(content: any): Promise<ContentItem> {
    return this.makeRequest('/api/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async updateContent(id: string, content: any): Promise<ContentItem> {
    return this.makeRequest(`/api/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  }

  async deleteContent(id: string): Promise<void> {
    return this.makeRequest(`/api/content/${id}`, {
      method: 'DELETE',
    });
  }

  // AI integration
  async generateContent(prompt: string): Promise<AIResponse> {
    return this.makeRequest('/api/ai', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate', prompt }),
    });
  }

  // Search functionality
  async search(query: string): Promise<SearchResponse> {
    return this.makeRequest(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

// Export a default instance
export const apiClient = new ApiClient();
