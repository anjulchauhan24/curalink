import axios, { AxiosInstance, AxiosError, CancelTokenSource } from 'axios';
import type {
  AuthResponse,
  User,
  PatientProfile,
  PatientProfileCreate,
  ResearcherProfile,
  ResearcherProfileCreate,
  ClinicalTrial,
  Publication,
  HealthExpert,
  Favorite,
  FavoriteCreate,
  Forum,
  ForumPost,
  ForumReply,
  MeetingRequest,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token Management
class TokenManager {
  private static readonly TOKEN_KEY = 'authToken';
  
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }
  
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  
  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
}

// API Client
class APIClient {
  private client: AxiosInstance;
  private cancelTokens: Map<string, CancelTokenSource> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          TokenManager.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      this.client.interceptors.request.use((config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });

      this.client.interceptors.response.use(
        (response) => {
          console.log(`[API Response] ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          console.error(`[API Error] ${error.config?.url}`, error.message);
          return Promise.reject(error);
        }
      );
    }
  }

  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const message = 
          error.response.data?.detail || 
          error.response.data?.message || 
          `Request failed with status ${error.response.status}`;
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response received
        throw new Error('No response from server. Please check your connection.');
      }
    }
    
    if (axios.isCancel(error)) {
      throw new Error('Request was cancelled');
    }
    
    // Something else happened
    throw new Error(error?.message || 'An unexpected error occurred');
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  private cancelRequest(key: string): void {
    const source = this.cancelTokens.get(key);
    if (source) {
      source.cancel('Request cancelled by user');
      this.cancelTokens.delete(key);
    }
  }

  private getCancelToken(key: string): CancelTokenSource {
    this.cancelRequest(key);
    const source = axios.CancelToken.source();
    this.cancelTokens.set(key, source);
    return source;
  }

  // ==================== Auth Endpoints ====================

  async register(email: string, password: string, userType: string): Promise<AuthResponse> {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      this.validatePassword(password);

      const response = await this.client.post<AuthResponse>('/api/auth/register', {
        email,
        password,
        user_type: userType,
      });
      
      TokenManager.setToken(response.data.access_token);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await this.client.post<AuthResponse>('/api/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      TokenManager.setToken(response.data.access_token);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      TokenManager.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<User>('/api/auth/me');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Patient Endpoints ====================

  async createPatientProfile(data: PatientProfileCreate): Promise<PatientProfile> {
    try {
      const response = await this.client.post<PatientProfile>('/api/patients/profile', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPatientProfile(): Promise<PatientProfile> {
    try {
      const response = await this.client.get<PatientProfile>('/api/patients/profile');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updatePatientProfile(data: Partial<PatientProfileCreate>): Promise<PatientProfile> {
    try {
      const response = await this.client.put<PatientProfile>('/api/patients/profile', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Researcher Endpoints ====================

  async createResearcherProfile(data: ResearcherProfileCreate): Promise<ResearcherProfile> {
    try {
      const response = await this.client.post<ResearcherProfile>('/api/researchers/profile', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getResearcherProfile(): Promise<ResearcherProfile> {
    try {
      const response = await this.client.get<ResearcherProfile>('/api/researchers/profile');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateResearcherProfile(data: Partial<ResearcherProfileCreate>): Promise<ResearcherProfile> {
    try {
      const response = await this.client.put<ResearcherProfile>('/api/researchers/profile', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchResearchers(
    specialty?: string,
    skip: number = 0,
    limit: number = 20,
    cancelKey: string = 'searchResearchers'
  ): Promise<ResearcherProfile[]> {
    try {
      const source = this.getCancelToken(cancelKey);
      
      const response = await this.client.get<ResearcherProfile[]>('/api/researchers', {
        params: { specialty, skip, limit },
        cancelToken: source.token,
      });
      
      this.cancelTokens.delete(cancelKey);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Clinical Trials Endpoints ====================

  async searchClinicalTrials(
    keywords?: string,
    status?: string,
    location?: string,
    skip: number = 0,
    limit: number = 20,
    cancelKey: string = 'searchTrials'
  ): Promise<ClinicalTrial[]> {
    try {
      const source = this.getCancelToken(cancelKey);
      
      const response = await this.client.get<ClinicalTrial[]>('/api/trials', {
        params: { keywords, status, location, skip, limit },
        cancelToken: source.token,
      });
      
      this.cancelTokens.delete(cancelKey);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getClinicalTrial(trialId: string): Promise<ClinicalTrial> {
    try {
      const response = await this.client.get<ClinicalTrial>(`/api/trials/${trialId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createClinicalTrial(data: Partial<ClinicalTrial>): Promise<ClinicalTrial> {
    try {
      const response = await this.client.post<ClinicalTrial>('/api/trials', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateClinicalTrial(trialId: string, data: Partial<ClinicalTrial>): Promise<ClinicalTrial> {
    try {
      const response = await this.client.put<ClinicalTrial>(`/api/trials/${trialId}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteClinicalTrial(trialId: string): Promise<void> {
    try {
      await this.client.delete(`/api/trials/${trialId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Publications Endpoints ====================

  async searchPublications(
    keywords?: string,
    skip: number = 0,
    limit: number = 20,
    cancelKey: string = 'searchPublications'
  ): Promise<Publication[]> {
    try {
      const source = this.getCancelToken(cancelKey);
      
      const response = await this.client.get<Publication[]>('/api/publications', {
        params: { keywords, skip, limit },
        cancelToken: source.token,
      });
      
      this.cancelTokens.delete(cancelKey);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPublication(publicationId: string): Promise<Publication> {
    try {
      const response = await this.client.get<Publication>(`/api/publications/${publicationId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createPublication(data: Partial<Publication>): Promise<Publication> {
    try {
      const response = await this.client.post<Publication>('/api/publications', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Health Experts Endpoints ====================

  async searchHealthExperts(
    specialty?: string,
    location?: string,
    skip: number = 0,
    limit: number = 20,
    cancelKey: string = 'searchExperts'
  ): Promise<HealthExpert[]> {
    try {
      const source = this.getCancelToken(cancelKey);
      
      const response = await this.client.get<HealthExpert[]>('/api/experts', {
        params: { specialty, location, skip, limit },
        cancelToken: source.token,
      });
      
      this.cancelTokens.delete(cancelKey);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getHealthExpert(expertId: number): Promise<HealthExpert> {
    try {
      const response = await this.client.get<HealthExpert>(`/api/experts/${expertId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Favorites Endpoints ====================

  async addFavorite(data: FavoriteCreate): Promise<Favorite> {
    try {
      const response = await this.client.post<Favorite>('/api/favorites', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFavorites(favoriteType?: string): Promise<Favorite[]> {
    try {
      const response = await this.client.get<Favorite[]>('/api/favorites', {
        params: { favorite_type: favoriteType },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeFavorite(favoriteId: number): Promise<void> {
    try {
      await this.client.delete(`/api/favorites/${favoriteId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async isFavorite(itemId: string, itemType: string): Promise<boolean> {
  try {
    const favorites = await this.getFavorites(itemType);
    return favorites.some(fav => fav.favorite_id === itemId);
  } catch (error) {
    return false;
  }
}

  // ==================== Forums Endpoints ====================

  async getForums(skip: number = 0, limit: number = 20): Promise<Forum[]> {
    try {
      const response = await this.client.get<Forum[]>('/api/forums', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getForum(forumId: number): Promise<Forum> {
    try {
      const response = await this.client.get<Forum>(`/api/forums/${forumId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createForum(name: string, description?: string, category?: string): Promise<Forum> {
    try {
      const response = await this.client.post<Forum>('/api/forums', {
        name,
        description,
        category,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateForum(forumId: number, name?: string, description?: string, category?: string): Promise<Forum> {
    try {
      const response = await this.client.put<Forum>(`/api/forums/${forumId}`, {
        name,
        description,
        category,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteForum(forumId: number): Promise<void> {
    try {
      await this.client.delete(`/api/forums/${forumId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getForumPosts(forumId: number, skip: number = 0, limit: number = 20): Promise<ForumPost[]> {
    try {
      const response = await this.client.get<ForumPost[]>(`/api/forums/${forumId}/posts`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getForumPost(postId: number): Promise<ForumPost> {
    try {
      const response = await this.client.get<ForumPost>(`/api/forums/posts/${postId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createForumPost(forumId: number, title: string, content: string): Promise<ForumPost> {
    try {
      if (!title.trim()) {
        throw new Error('Post title cannot be empty');
      }
      if (!content.trim()) {
        throw new Error('Post content cannot be empty');
      }

      const response = await this.client.post<ForumPost>('/api/forums/posts', {
        forum_id: forumId,
        title,
        content,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateForumPost(postId: number, title?: string, content?: string): Promise<ForumPost> {
    try {
      const response = await this.client.put<ForumPost>(`/api/forums/posts/${postId}`, {
        title,
        content,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteForumPost(postId: number): Promise<void> {
    try {
      await this.client.delete(`/api/forums/posts/${postId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPostReplies(postId: number, skip: number = 0, limit: number = 20): Promise<ForumReply[]> {
    try {
      const response = await this.client.get<ForumReply[]>(`/api/forums/posts/${postId}/replies`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createForumReply(postId: number, content: string): Promise<ForumReply> {
    try {
      if (!content.trim()) {
        throw new Error('Reply content cannot be empty');
      }

      const response = await this.client.post<ForumReply>('/api/forums/replies', {
        post_id: postId,
        content,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateForumReply(replyId: number, content: string): Promise<ForumReply> {
    try {
      const response = await this.client.put<ForumReply>(`/api/forums/replies/${replyId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteForumReply(replyId: number): Promise<void> {
    try {
      await this.client.delete(`/api/forums/replies/${replyId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Meeting Requests Endpoints ====================

  async createMeetingRequest(
    expertId: number,
    message: string,
    contactInfo: { name: string; email: string; phone?: string }
  ): Promise<MeetingRequest> {
    try {
      if (!message.trim()) {
        throw new Error('Meeting request message cannot be empty');
      }
      if (!this.validateEmail(contactInfo.email)) {
        throw new Error('Invalid email format in contact info');
      }

      const response = await this.client.post<MeetingRequest>('/api/meeting-requests', {
        expert_id: expertId,
        message,
        contact_info: contactInfo,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMeetingRequests(status?: string): Promise<MeetingRequest[]> {
    try {
      const response = await this.client.get<MeetingRequest[]>('/api/meeting-requests', {
        params: { status },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMeetingRequest(requestId: number): Promise<MeetingRequest> {
    try {
      const response = await this.client.get<MeetingRequest>(`/api/meeting-requests/${requestId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateMeetingRequestStatus(requestId: number, status: string): Promise<MeetingRequest> {
    try {
      const response = await this.client.put<MeetingRequest>(`/api/meeting-requests/${requestId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Utility Methods ====================

  cancelAllRequests(): void {
    this.cancelTokens.forEach((source) => {
      source.cancel('All requests cancelled');
    });
    this.cancelTokens.clear();
  }

  isAuthenticated(): boolean {
    return TokenManager.getToken() !== null;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export TokenManager for external use if needed
export { TokenManager };

// Export class for testing or custom instances
export default APIClient;