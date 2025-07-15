// Type definitions for API responses
export interface HealthResponse {
  message: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export interface AIResponse {
  content?: string;
  response?: string;
  success: boolean;
  message?: string;
}

export interface SearchResponse {
  results: ContentItem[];
  total: number;
  query: string;
}

export interface ApiError {
  error: string;
  code?: number;
  message?: string;
}
