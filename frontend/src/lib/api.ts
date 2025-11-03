import axios, { AxiosInstance } from 'axios';
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

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(email: string, password: string, userType: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/register', {
      email,
      password,
      user_type: userType,
    });
    localStorage.setItem('authToken', response.data.access_token);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await this.client.post<AuthResponse>('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    localStorage.setItem('authToken', response.data.access_token);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/auth/me');
    return response.data;
  }

  // Patient endpoints
  async createPatientProfile(data: PatientProfileCreate): Promise<PatientProfile> {
    const response = await this.client.post<PatientProfile>('/api/patients/profile', data);
    return response.data;
  }

  async getPatientProfile(): Promise<PatientProfile> {
    const response = await this.client.get<PatientProfile>('/api/patients/profile');
    return response.data;
  }

  // Researcher endpoints
  async createResearcherProfile(data: ResearcherProfileCreate): Promise<ResearcherProfile> {
    const response = await this.client.post<ResearcherProfile>('/api/researchers/profile', data);
    return response.data;
  }

  async getResearcherProfile(): Promise<ResearcherProfile> {
    const response = await this.client.get<ResearcherProfile>('/api/researchers/profile');
    return response.data;
  }

  async searchResearchers(specialty?: string, skip = 0, limit = 20): Promise<ResearcherProfile[]> {
    const response = await this.client.get<ResearcherProfile[]>('/api/researchers', {
      params: { specialty, skip, limit },
    });
    return response.data;
  }

  // Clinical Trials endpoints
  async searchClinicalTrials(
    keywords?: string,
    status?: string,
    location?: string,
    skip = 0,
    limit = 20
  ): Promise<ClinicalTrial[]> {
    const response = await this.client.get<ClinicalTrial[]>('/api/trials', {
      params: { keywords, status, location, skip, limit },
    });
    return response.data;
  }

  async getClinicalTrial(trialId: string): Promise<ClinicalTrial> {
    const response = await this.client.get<ClinicalTrial>(`/api/trials/${trialId}`);
    return response.data;
  }

  async createClinicalTrial(data: Partial<ClinicalTrial>): Promise<ClinicalTrial> {
    const response = await this.client.post<ClinicalTrial>('/api/trials', data);
    return response.data;
  }

  // Publications endpoints
  async searchPublications(keywords?: string, skip = 0, limit = 20): Promise<Publication[]> {
    const response = await this.client.get<Publication[]>('/api/publications', {
      params: { keywords, skip, limit },
    });
    return response.data;
  }

  async getPublication(publicationId: string): Promise<Publication> {
    const response = await this.client.get<Publication>(`/api/publications/${publicationId}`);
    return response.data;
  }

  // Health Experts endpoints
  async searchHealthExperts(
    specialty?: string,
    location?: string,
    skip = 0,
    limit = 20
  ): Promise<HealthExpert[]> {
    const response = await this.client.get<HealthExpert[]>('/api/experts', {
      params: { specialty, location, skip, limit },
    });
    return response.data;
  }

  // Favorites endpoints
  async addFavorite(data: FavoriteCreate): Promise<Favorite> {
    const response = await this.client.post<Favorite>('/api/favorites', data);
    return response.data;
  }

  async getFavorites(favoriteType?: string): Promise<Favorite[]> {
    const response = await this.client.get<Favorite[]>('/api/favorites', {
      params: { favorite_type: favoriteType },
    });
    return response.data;
  }

  async removeFavorite(favoriteId: number): Promise<void> {
    await this.client.delete(`/api/favorites/${favoriteId}`);
  }

  // Forums endpoints
  async getForums(skip = 0, limit = 20): Promise<Forum[]> {
    const response = await this.client.get<Forum[]>('/api/forums', {
      params: { skip, limit },
    });
    return response.data;
  }

  async createForum(name: string, description?: string, category?: string): Promise<Forum> {
    const response = await this.client.post<Forum>('/api/forums', {
      name,
      description,
      category,
    });
    return response.data;
  }

  async getForumPosts(forumId: number, skip = 0, limit = 20): Promise<ForumPost[]> {
    const response = await this.client.get<ForumPost[]>(`/api/forums/${forumId}/posts`, {
      params: { skip, limit },
    });
    return response.data;
  }

  async createForumPost(forumId: number, title: string, content: string): Promise<ForumPost> {
    const response = await this.client.post<ForumPost>('/api/forums/posts', {
      forum_id: forumId,
      title,
      content,
    });
    return response.data;
  }

  async createForumReply(postId: number, content: string): Promise<ForumReply> {
    const response = await this.client.post<ForumReply>('/api/forums/replies', {
      post_id: postId,
      content,
    });
    return response.data;
  }

  // Meeting Requests endpoints
  async createMeetingRequest(
    expertId: number,
    message: string,
    contactInfo: { name: string; email: string; phone?: string }
  ): Promise<MeetingRequest> {
    const response = await this.client.post<MeetingRequest>('/api/meeting-requests', {
      expert_id: expertId,
      message,
      contact_info: contactInfo,
    });
    return response.data;
  }
}

export const apiClient = new APIClient();