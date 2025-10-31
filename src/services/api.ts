import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Market, Selection, ThreadConfig, Option, SearchResponse, MarketIdeasResponse, RedditScrapeResponse, PainPointsAnalysisResponse, TrendingTopicsResponse, TrendingTopic, LoginRequest, SignupRequest, AuthResponse, User, ChangePasswordRequest, CreateWebsiteRequest, CreateWebsiteResponse, ForgotPasswordRequest, ResetPasswordRequest } from '@/types';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dbaas-api.apexneural.cloud/dbas/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate axios instance for backend search API
const searchApi = axios.create({
  baseURL: import.meta.env.VITE_SEARCH_API_URL || 'https://dbaas-api.apexneural.cloud/dbas/api',
  timeout: 180000, // 180 seconds (3 minutes) for AI generation, scraping, and analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth tokens, logging, etc.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = (error.response.data as { message?: string })?.message || error.message;
      
      switch (status) {
        case 401:
          console.error('Unauthorized - redirecting to login');
          // Clear auth token
          localStorage.removeItem('auth_token');
          // Redirect to login or dispatch auth action
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found:', message);
          break;
        case 500:
          console.error('Server error:', message);
          break;
        default:
          console.error(`API Error (${status}):`, message);
      }
      
      return Promise.reject({
        status,
        message,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response received');
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        data: null,
      });
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message,
        data: null,
      });
    }
  }
);

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw error.response?.data || error.message;
  }
  throw error;
};

export const apiService = {
  // Auth endpoints
  checkEmail: async (email: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/check-email', { email });
      return response.data.exists;
    } catch (error) {
      return handleApiError(error);
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      // Only send email as that's what backend expects
      await api.post('/auth/forgot-password', {
        email: data.email
      });
    } catch (error) {
      return handleApiError(error);
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      await api.post('/auth/reset-password', data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Market endpoints
  getMarkets: async (): Promise<Market[]> => {
    try {
      const { data } = await api.get<Market[]>('/markets');
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchMarkets: async (query: string): Promise<Market[]> => {
    try {
      // Sanitize query input
      const sanitizedQuery = encodeURIComponent(query.trim());
      const { data } = await api.get<Market[]>(`/search?query=${sanitizedQuery}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMarketOptions: async (marketId: string): Promise<Selection[]> => {
    try {
      const { data } = await api.get<Selection[]>(`/market/${marketId}/options`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Selection endpoints
  getSelections: async (marketId: string): Promise<Selection[]> => {
    try {
      const { data } = await api.get<Selection[]>(`/selections?marketId=${marketId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  submitSelections: async (marketId: string, selectedIds: string[]): Promise<void> => {
    try {
      await api.post('/selections', { marketId, selectedIds });
    } catch (error) {
      handleApiError(error);
    }
  },

  // Thread endpoints
  getThreads: async (): Promise<unknown> => {
    try {
      const { data } = await api.get('/threads');
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  submitThreadConfig: async (config: ThreadConfig[]): Promise<void> => {
    try {
      await api.post('/threads/configure', { config });
    } catch (error) {
      handleApiError(error);
    }
  },

  // Options endpoints
  getOptions: async (configId?: string): Promise<Option[]> => {
    try {
      const { data } = await api.get<Option[]>(`/options${configId ? `?configId=${configId}` : ''}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  submitOption: async (submitData: {
    marketId: string;
    selectedCards: string[];
    threadConfig: ThreadConfig[];
    selectedOption: string;
  }): Promise<void> => {
    try {
      await api.post('/options/select', submitData);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Search/Generate endpoint for market ideas
  searchMarketIdeas: async (topic: string): Promise<MarketIdeasResponse> => {
    try {
      // Validate and sanitize input
      if (!topic || typeof topic !== 'string') {
        throw new Error('Invalid search topic');
      }

      const sanitizedTopic = topic.trim();
      if (sanitizedTopic.length === 0) {
        throw new Error('Search topic cannot be empty');
      }

      if (sanitizedTopic.length > 500) {
        throw new Error('Search topic is too long (max 500 characters)');
      }

      // Log the request in development
      if (import.meta.env.DEV) {
        console.log('🔍 Searching for market ideas:', sanitizedTopic);
      }

      // Call the backend market ideas generation endpoint
      const { data } = await searchApi.post<SearchResponse>('/market-ideas/generate/', {
        topic: sanitizedTopic,
        model: "anthropic/claude-3.5-sonnet",
        temperature: 0.7
      });

      // Check response status
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate market ideas');
      }

      // Extract the text data from the response
      const textData = data.data?.data?.text;
      
      if (!textData) {
        throw new Error('No market ideas data received from backend');
      }

      // Debug: Log the actual backend response structure
      if (import.meta.env.DEV) {
        console.log('🔍 Backend response:', data);
      }

      // Parse the JSON string from the text field
      let parsedData: MarketIdeasResponse;
      try {
        parsedData = JSON.parse(textData);
      } catch (parseError) {
        console.error('Failed to parse market ideas JSON:', parseError);
        throw new Error('Invalid market ideas format received from backend');
      }
      
      // Log success in development
      if (import.meta.env.DEV) {
        console.log('✅ Market ideas received:', parsedData);
      }

      return parsedData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        console.error('Search API error:', message);
        throw new Error(message);
      }
      throw error;
    }
  },

  // Reddit scraping endpoint
  scrapeRedditThreads: async (urls: string[]): Promise<any> => {
    try {
      // Validate input
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new Error('No URLs provided for scraping');
      }

      // Log the request in development
      if (import.meta.env.DEV) {
        console.log('🕷️ Scraping Reddit threads:', urls);
      }

      // Call the backend scrape endpoint
      const { data } = await searchApi.post<RedditScrapeResponse>('/reddit/scrape/', {
        urls: urls
      });

      // Check response status
      if (!data.success) {
        throw new Error(data.message || 'Failed to scrape Reddit threads');
      }

      // Log success in development
      if (import.meta.env.DEV) {
        console.log('✅ Reddit scrape completed:', data);
      }

      return data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        console.error('Reddit scrape error:', message);
        throw new Error(message);
      }
      throw error;
    }
  },

  // Pain points analysis endpoint
  analyzePainPoints: async (scrapedData: any): Promise<any> => {
    try {
      // Validate input
      if (!scrapedData) {
        throw new Error('No data provided for analysis');
      }

      // Log the request in development
      if (import.meta.env.DEV) {
        console.log('🔬 Analyzing pain points from scraped data');
      }

      // Create FormData and convert scraped data to JSON file
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(scrapedData)], { type: 'application/json' });
      formData.append('files', jsonBlob, 'scraped_data.json');

      // Call the backend analysis endpoint with multipart/form-data
      const { data } = await searchApi.post<PainPointsAnalysisResponse>(
        '/pain-points/complete-analysis-file/', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Check response status
      if (!data.success) {
        throw new Error(data.message || 'Failed to analyze pain points');
      }

      // Log success in development
      if (import.meta.env.DEV) {
        console.log('✅ Pain points analysis completed:', data);
      }

      return data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        console.error('Pain points analysis error:', message);
        throw new Error(message);
      }
      throw error;
    }
  },

  // Get trending topics
  getTrendingTopics: async (): Promise<TrendingTopic[]> => {
    try {
      console.log('🔍 Fetching trending topics...');
      const { data } = await searchApi.get<TrendingTopicsResponse>('/trending/top-trending');
      
      // Debug: Log the full response to understand the structure
      console.log('🔍 Full API response:', JSON.stringify(data, null, 2));
      
      // Check if response exists
      if (!data) {
        throw new Error('No response received from trending topics API');
      }
      
      // Check if the API call was successful
      if (data.status !== 'success' || !data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response structure from trending topics API');
      }
      
      // Transform backend data to frontend format
      const transformedTopics: TrendingTopic[] = data.data.map((backendTopic) => {
        // Determine category based on topic content (simple keyword matching)
        let category: 'Health' | 'Wealth' | 'Relationships' = 'Health'; // default
        
        const topicLower = backendTopic.topic.toLowerCase();
        const descriptionLower = backendTopic.description.toLowerCase();
        
        if (topicLower.includes('health') || topicLower.includes('medical') || 
            topicLower.includes('fitness') || topicLower.includes('wellness') ||
            descriptionLower.includes('health') || descriptionLower.includes('medical')) {
          category = 'Health';
        } else if (topicLower.includes('money') || topicLower.includes('finance') || 
                   topicLower.includes('investment') || topicLower.includes('business') ||
                   descriptionLower.includes('finance') || descriptionLower.includes('business')) {
          category = 'Wealth';
        } else if (topicLower.includes('relationship') || topicLower.includes('dating') || 
                   topicLower.includes('social') || topicLower.includes('communication') ||
                   descriptionLower.includes('relationship') || descriptionLower.includes('social')) {
          category = 'Relationships';
        }
        
        return {
          id: backendTopic.id.toString(),
          category: category,
          trend: backendTopic.growth,
          volume: backendTopic.volume,
          title: backendTopic.topic
        };
      });
      
      console.log('✅ Trending topics transformed:', transformedTopics);
      return transformedTopics;
    } catch (error) {
      console.error('❌ Trending topics error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        throw new Error(`Failed to fetch trending topics: ${errorMessage}`);
      }
      throw new Error('Failed to fetch trending topics');
    }
  },

  // Authentication
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('🔐 Logging in user...');
      const { data } = await searchApi.post<AuthResponse>('/auth/login', credentials);
      console.log('✅ Login successful');
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Login failed: ${errorMessage}`);
      }
      throw new Error('Login failed');
    }
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    try {
      console.log('✨ Creating new account...');
      const { data } = await searchApi.post<AuthResponse>('/auth/signup', userData);
      console.log('✅ Signup successful');
      return data;
    } catch (error) {
      console.error('❌ Signup error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Signup failed: ${errorMessage}`);
      }
      throw new Error('Signup failed');
    }
  },

  getUserProfile: async (userId: number): Promise<User> => {
    try {
      console.log(`👤 Fetching user profile for ID: ${userId}...`);
      const { data } = await searchApi.get<{ success: boolean; data: User }>(`/auth/user/${userId}`);
      console.log('✅ User profile fetched');
      return data.data;
    } catch (error) {
      console.error('❌ Get user profile error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch user profile: ${errorMessage}`);
      }
      throw new Error('Failed to fetch user profile');
    }
  },

  changePassword: async (userId: number, passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🔒 Changing password for user ID: ${userId}...`);
      const { data } = await searchApi.post<{ success: boolean; message: string }>(`/auth/change-password/${userId}`, passwordData);
      console.log('✅ Password changed successfully');
      return data;
    } catch (error) {
      console.error('❌ Change password error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to change password: ${errorMessage}`);
      }
      throw new Error('Failed to change password');
    }
  },

  // Website Creation
  createWebsite: async (websiteData: CreateWebsiteRequest): Promise<CreateWebsiteResponse> => {
    try {
      console.log('🌐 Creating website...');
      console.log('Selected solution:', websiteData.selected_solution.name);
      console.log('Chat messages:', websiteData.chat_messages.length);
      
      const { data } = await searchApi.post<CreateWebsiteResponse>('/create_website', websiteData);
      console.log('✅ Website created successfully');
      return data;
    } catch (error) {
      console.error('❌ Website creation error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to create website: ${errorMessage}`);
      }
      throw new Error('Failed to create website');
    }
  },
};
