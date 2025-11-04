// User types
export enum UserType {
  PATIENT = 'patient',
  RESEARCHER = 'researcher',
}

export interface User {
  id: number;
  email: string;
  user_type: UserType;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Patient types
export interface PatientProfile {
  id: number;
  user_id: number;
  full_name?: string;
  conditions?: string[];
  location?: string;
  age?: number;
  gender?: string;
  additional_info?: string;
  created_at: string;
}

export interface PatientProfileCreate {
  full_name?: string;
  conditions?: string[];
  location?: string;
  age?: number;
  gender?: string;
  additional_info?: string;
}

// Researcher types
export interface ResearcherProfile {
  id: number;
  user_id: number;
  full_name?: string;
  institution?: string;
  specialties?: string[];
  research_interests?: string[];
  orcid?: string;
  researchgate_url?: string;
  bio?: string;
  location?: string;
  available_for_meetings: boolean;
  created_at: string;
}

export interface ResearcherProfileCreate {
  full_name?: string;
  institution?: string;
  specialties?: string[];
  research_interests?: string[];
  orcid?: string;
  researchgate_url?: string;
  bio?: string;
  location?: string;
  available_for_meetings?: boolean;
}

// Clinical Trial types
export interface ClinicalTrial {
  id: string;
  title: string;
  description?: string;
  status?: string;
  phase?: string;
  conditions?: string[];
  eligibility?: string;
  locations?: string[];
  contact_email?: string;
  contact_phone?: string;
  start_date?: string;
  completion_date?: string;
  enrollment?: number;
  source: string;
  url?: string;
  ai_summary?: string;
  created_at: string;
}

// Publication types
export interface Publication {
  id: string;
  title: string;
  authors?: string[];
  abstract?: string;
  journal?: string;
  publication_date?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  keywords?: string[];
  conditions?: string[];
  ai_summary?: string;
  created_at: string;
}

// Health Expert types
export interface HealthExpert {
  id: number;
  full_name: string;
  specialties?: string[];
  institution?: string;
  location?: string;
  email?: string;
  phone?: string;
  bio?: string;
  research_interests?: string[];
  publications_count: number;
  orcid?: string;
  is_platform_member: boolean;
  created_at: string;
}

// Favorite types
export interface Favorite {
  id: number;  // or string if you're using UUID
  user_id: number;  // or string if using UUID
  favorite_type: string;
  favorite_id: string;  // Changed from item_id
  notes?: string;
  created_at: string;
}

export interface FavoriteCreate {
  favorite_type: string;
  favorite_id: string;
  notes?: string;
}

// Forum types
export interface Forum {
  id: number;
  name: string;
  description?: string;
  category?: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
}

export interface ForumPost {
  id: number;
  forum_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface ForumReply {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
}

// Meeting Request types
export interface MeetingRequest {
  id: number;
  requester_id: number;
  expert_id: number;
  message?: string;
  status: string;
  contact_info: {
    name: string;
    email: string;
    phone?: string;
  };
  created_at: string;
}

// API Error type
export interface APIError {
  detail: string;
}