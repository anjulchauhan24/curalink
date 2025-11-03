from sqlalchemy import Boolean, Column, String, Text, DateTime, ForeignKey, Table, ARRAY, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid
import enum

def generate_uuid():
    return str(uuid.uuid4())

class UserType(str, enum.Enum):
    PATIENT = "patient"
    RESEARCHER = "researcher"

class TrialStatus(str, enum.Enum):
    RECRUITING = "recruiting"
    COMPLETED = "completed"
    ACTIVE = "active"
    SUSPENDED = "suspended"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACCEPTED = "accepted"

class ItemType(str, enum.Enum):
    TRIAL = "trial"
    PUBLICATION = "publication"
    EXPERT = "expert"
    COLLABORATOR = "collaborator"

# Users Table
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    user_type = Column(SQLEnum(UserType), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    researcher_profile = relationship("ResearcherProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")

# Patient Profile Table
class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    conditions = Column(ARRAY(String), default=[])
    symptoms = Column(Text)
    location_city = Column(String)
    location_country = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")

# Researcher Profile Table
class ResearcherProfile(Base):
    __tablename__ = "researcher_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    specialties = Column(ARRAY(String), default=[])
    research_interests = Column(ARRAY(String), default=[])
    orcid_id = Column(String)
    researchgate_url = Column(String)
    available_for_meetings = Column(Boolean, default=False)
    bio = Column(Text)
    institution = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="researcher_profile")
    publications = relationship("Publication", back_populates="researcher", cascade="all, delete-orphan")
    clinical_trials = relationship("ClinicalTrial", back_populates="researcher", cascade="all, delete-orphan")

# Clinical Trials Table
class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    nct_id = Column(String, unique=True, index=True)
    researcher_id = Column(String, ForeignKey("researcher_profiles.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    condition = Column(String, nullable=False)
    phase = Column(String)
    status = Column(SQLEnum(TrialStatus), default=TrialStatus.RECRUITING)
    location = Column(String)
    eligibility = Column(Text)
    contact_email = Column(String)
    start_date = Column(DateTime(timezone=True))
    completion_date = Column(DateTime(timezone=True))
    ai_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    researcher = relationship("ResearcherProfile", back_populates="clinical_trials")

# Publications Table
class Publication(Base):
    __tablename__ = "publications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    researcher_id = Column(String, ForeignKey("researcher_profiles.id"), nullable=True)
    pubmed_id = Column(String, unique=True, index=True, nullable=True)
    title = Column(String, nullable=False)
    authors = Column(ARRAY(String), default=[])
    journal = Column(String)
    publication_date = Column(DateTime(timezone=True))
    abstract = Column(Text)
    doi = Column(String)
    url = Column(String)
    keywords = Column(ARRAY(String), default=[])
    ai_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    researcher = relationship("ResearcherProfile", back_populates="publications")

# Health Experts Table
class HealthExpert(Base):
    __tablename__ = "health_experts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    specialties = Column(ARRAY(String), default=[])
    research_interests = Column(ARRAY(String), default=[])
    location_city = Column(String)
    location_country = Column(String)
    is_registered = Column(Boolean, default=False)
    contact_email = Column(String)
    ai_summary = Column(Text)
    external_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Forum Categories Table
class ForumCategory(Base):
    __tablename__ = "forum_categories"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    posts = relationship("ForumPost", back_populates="category", cascade="all, delete-orphan")

# Forum Posts Table
class ForumPost(Base):
    __tablename__ = "forum_posts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    category_id = Column(String, ForeignKey("forum_categories.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    author_type = Column(SQLEnum(UserType), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("ForumCategory", back_populates="posts")
    replies = relationship("ForumReply", back_populates="post", cascade="all, delete-orphan")

# Forum Replies Table
class ForumReply(Base):
    __tablename__ = "forum_replies"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    post_id = Column(String, ForeignKey("forum_posts.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    post = relationship("ForumPost", back_populates="replies")

# Favorites Table
class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    item_type = Column(SQLEnum(ItemType), nullable=False)
    item_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="favorites")

# Meeting Requests Table
class MeetingRequest(Base):
    __tablename__ = "meeting_requests"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("users.id"), nullable=False)
    expert_id = Column(String, nullable=False)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING)
    message = Column(Text)
    patient_name = Column(String, nullable=False)
    patient_contact = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Connections Table (for researchers)
class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    requester_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())