from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserType(str, Enum):
    PATIENT = "patient"
    RESEARCHER = "researcher"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    user_type: UserType


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


# Patient Profile Schemas
class PatientProfileBase(BaseModel):
    full_name: Optional[str] = None
    conditions: Optional[List[str]] = []
    location: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    additional_info: Optional[str] = None


class PatientProfileCreate(PatientProfileBase):
    pass


class PatientProfile(PatientProfileBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Researcher Profile Schemas
class ResearcherProfileBase(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
    specialties: Optional[List[str]] = []
    research_interests: Optional[List[str]] = []
    orcid: Optional[str] = None
    researchgate_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    available_for_meetings: bool = True


class ResearcherProfileCreate(ResearcherProfileBase):
    pass


class ResearcherProfile(ResearcherProfileBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Clinical Trial Schemas
class ClinicalTrialBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    phase: Optional[str] = None
    conditions: Optional[List[str]] = []
    eligibility: Optional[str] = None
    locations: Optional[List[str]] = []
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    enrollment: Optional[int] = None
    url: Optional[str] = None


class ClinicalTrialCreate(ClinicalTrialBase):
    id: str  # NCT ID


class ClinicalTrial(ClinicalTrialBase):
    id: str
    source: str
    ai_summary: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Publication Schemas
class PublicationBase(BaseModel):
    title: str
    authors: Optional[List[str]] = []
    abstract: Optional[str] = None
    journal: Optional[str] = None
    publication_date: Optional[datetime] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None
    url: Optional[str] = None
    keywords: Optional[List[str]] = []
    conditions: Optional[List[str]] = []


class PublicationCreate(PublicationBase):
    id: str


class Publication(PublicationBase):
    id: str
    ai_summary: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Health Expert Schemas
class HealthExpertBase(BaseModel):
    full_name: str
    specialties: Optional[List[str]] = []
    institution: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    research_interests: Optional[List[str]] = []
    orcid: Optional[str] = None


class HealthExpertCreate(HealthExpertBase):
    pass


class HealthExpert(HealthExpertBase):
    id: int
    is_platform_member: bool
    publications_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Favorite Schemas
class FavoriteBase(BaseModel):
    favorite_type: str
    favorite_id: str
    notes: Optional[str] = None


class FavoriteCreate(FavoriteBase):
    pass


class Favorite(FavoriteBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Forum Schemas
class ForumBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class ForumCreate(ForumBase):
    pass


class Forum(ForumBase):
    id: int
    created_by: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Forum Post Schemas
class ForumPostBase(BaseModel):
    title: str
    content: str
    forum_id: int


class ForumPostCreate(ForumPostBase):
    pass


class ForumPost(ForumPostBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Forum Reply Schemas
class ForumReplyBase(BaseModel):
    content: str
    post_id: int


class ForumReplyCreate(ForumReplyBase):
    pass


class ForumReply(ForumReplyBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Meeting Request Schemas
class MeetingRequestBase(BaseModel):
    expert_id: int
    message: Optional[str] = None
    contact_info: dict


class MeetingRequestCreate(MeetingRequestBase):
    pass


class MeetingRequest(MeetingRequestBase):
    id: int
    requester_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True