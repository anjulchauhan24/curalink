"""
CuraLink FastAPI Main Application
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn

# Import configurations (you'll need to create these)
from app.core.config import settings
from app.db.session import get_db, engine
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_current_active_user
)
import app.models.models as models
import app.schemas.schemas as schemas

# Create tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-powered platform connecting patients and researchers"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ==================== AUTH ROUTES ====================
@app.post("/api/auth/register", response_model=schemas.Token)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        user_type=user.user_type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }


@app.post("/api/auth/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user"""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/auth/me", response_model=schemas.User)
def get_current_user_info(current_user: models.User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user


# ==================== PATIENT ROUTES ====================
@app.post("/api/patients/profile", response_model=schemas.PatientProfile)
def create_patient_profile(
    profile: schemas.PatientProfileCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create or update patient profile"""
    if current_user.user_type != schemas.UserType.PATIENT:
        raise HTTPException(status_code=403, detail="Only patients can create patient profiles")
    
    # Check if profile exists
    db_profile = db.query(models.PatientProfile).filter(
        models.PatientProfile.user_id == current_user.id
    ).first()
    
    if db_profile:
        # Update existing profile
        for key, value in profile.dict().items():
            setattr(db_profile, key, value)
    else:
        # Create new profile
        db_profile = models.PatientProfile(**profile.dict(), user_id=current_user.id)
        db.add(db_profile)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile


@app.get("/api/patients/profile", response_model=schemas.PatientProfile)
def get_patient_profile(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient profile"""
    profile = db.query(models.PatientProfile).filter(
        models.PatientProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile


# ==================== RESEARCHER ROUTES ====================
@app.post("/api/researchers/profile", response_model=schemas.ResearcherProfile)
def create_researcher_profile(
    profile: schemas.ResearcherProfileCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create or update researcher profile"""
    if current_user.user_type != schemas.UserType.RESEARCHER:
        raise HTTPException(status_code=403, detail="Only researchers can create researcher profiles")
    
    db_profile = db.query(models.ResearcherProfile).filter(
        models.ResearcherProfile.user_id == current_user.id
    ).first()
    
    if db_profile:
        for key, value in profile.dict().items():
            setattr(db_profile, key, value)
    else:
        db_profile = models.ResearcherProfile(**profile.dict(), user_id=current_user.id)
        db.add(db_profile)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile


@app.get("/api/researchers/profile", response_model=schemas.ResearcherProfile)
def get_researcher_profile(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get researcher profile"""
    profile = db.query(models.ResearcherProfile).filter(
        models.ResearcherProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile


@app.get("/api/researchers", response_model=List[schemas.ResearcherProfile])
def search_researchers(
    specialty: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search researchers (for collaborators)"""
    query = db.query(models.ResearcherProfile)
    
    if specialty:
        query = query.filter(models.ResearcherProfile.specialties.contains([specialty]))
    
    researchers = query.offset(skip).limit(limit).all()
    return researchers


# ==================== CLINICAL TRIALS ROUTES ====================
@app.get("/api/trials", response_model=List[schemas.ClinicalTrial])
def search_clinical_trials(
    keywords: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search clinical trials"""
    query = db.query(models.ClinicalTrial)
    
    if keywords:
        query = query.filter(
            models.ClinicalTrial.title.ilike(f"%{keywords}%") |
            models.ClinicalTrial.description.ilike(f"%{keywords}%")
        )
    
    if status:
        query = query.filter(models.ClinicalTrial.status == status)
    
    if location:
        query = query.filter(models.ClinicalTrial.locations.contains([location]))
    
    trials = query.offset(skip).limit(limit).all()
    return trials


@app.post("/api/trials", response_model=schemas.ClinicalTrial)
def create_clinical_trial(
    trial: schemas.ClinicalTrialCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a clinical trial (researchers only)"""
    if current_user.user_type != schemas.UserType.RESEARCHER:
        raise HTTPException(status_code=403, detail="Only researchers can create trials")
    
    db_trial = models.ClinicalTrial(**trial.dict(), created_by=current_user.id)
    db.add(db_trial)
    db.commit()
    db.refresh(db_trial)
    return db_trial


@app.get("/api/trials/{trial_id}", response_model=schemas.ClinicalTrial)
def get_clinical_trial(trial_id: str, db: Session = Depends(get_db)):
    """Get a specific clinical trial"""
    trial = db.query(models.ClinicalTrial).filter(models.ClinicalTrial.id == trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    return trial


# ==================== PUBLICATIONS ROUTES ====================
@app.get("/api/publications", response_model=List[schemas.Publication])
def search_publications(
    keywords: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search publications"""
    query = db.query(models.Publication)
    
    if keywords:
        query = query.filter(
            models.Publication.title.ilike(f"%{keywords}%") |
            models.Publication.abstract.ilike(f"%{keywords}%")
        )
    
    publications = query.offset(skip).limit(limit).all()
    return publications


@app.get("/api/publications/{publication_id}", response_model=schemas.Publication)
def get_publication(publication_id: str, db: Session = Depends(get_db)):
    """Get a specific publication"""
    pub = db.query(models.Publication).filter(models.Publication.id == publication_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    return pub


# ==================== HEALTH EXPERTS ROUTES ====================
@app.get("/api/experts", response_model=List[schemas.HealthExpert])
def search_health_experts(
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search health experts"""
    query = db.query(models.HealthExpert)
    
    if specialty:
        query = query.filter(models.HealthExpert.specialties.contains([specialty]))
    
    if location:
        query = query.filter(models.HealthExpert.location.ilike(f"%{location}%"))
    
    experts = query.offset(skip).limit(limit).all()
    return experts


# ==================== FAVORITES ROUTES ====================
@app.post("/api/favorites", response_model=schemas.Favorite)
def add_favorite(
    favorite: schemas.FavoriteCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add to favorites"""
    # Check if already favorited
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.favorite_type == favorite.favorite_type,
        models.Favorite.favorite_id == favorite.favorite_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already favorited")
    
    db_favorite = models.Favorite(
        **favorite.dict(),
        user_id=current_user.id
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite


@app.get("/api/favorites", response_model=List[schemas.Favorite])
def get_favorites(
    favorite_type: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's favorites"""
    query = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id)
    
    if favorite_type:
        query = query.filter(models.Favorite.favorite_type == favorite_type)
    
    return query.all()


@app.delete("/api/favorites/{favorite_id}")
def remove_favorite(
    favorite_id: str,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove from favorites"""
    favorite = db.query(models.Favorite).filter(
        models.Favorite.id == favorite_id,
        models.Favorite.user_id == current_user.id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    return {"message": "Removed from favorites"}


# ==================== FORUMS ROUTES ====================
@app.get("/api/forums", response_model=List[schemas.Forum])
def get_forums(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get all forums"""
    return db.query(models.Forum).offset(skip).limit(limit).all()


@app.post("/api/forums", response_model=schemas.Forum)
def create_forum(
    forum: schemas.ForumCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a forum (researchers only)"""
    if current_user.user_type != schemas.UserType.RESEARCHER:
        raise HTTPException(status_code=403, detail="Only researchers can create forums")
    
    db_forum = models.Forum(**forum.dict(), created_by=current_user.id)
    db.add(db_forum)
    db.commit()
    db.refresh(db_forum)
    return db_forum


@app.get("/api/forums/{forum_id}/posts", response_model=List[schemas.ForumPost])
def get_forum_posts(forum_id: str, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get posts in a forum"""
    return db.query(models.ForumPost).filter(
        models.ForumPost.forum_id == forum_id
    ).offset(skip).limit(limit).all()


@app.post("/api/forums/posts", response_model=schemas.ForumPost)
def create_forum_post(
    post: schemas.ForumPostCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a forum post"""
    db_post = models.ForumPost(**post.dict(), user_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.post("/api/forums/replies", response_model=schemas.ForumReply)
def create_forum_reply(
    reply: schemas.ForumReplyCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reply to a forum post (researchers only)"""
    if current_user.user_type != schemas.UserType.RESEARCHER:
        raise HTTPException(status_code=403, detail="Only researchers can reply")
    
    db_reply = models.ForumReply(**reply.dict(), user_id=current_user.id)
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    return db_reply


# ==================== MEETING REQUESTS ====================
@app.post("/api/meeting-requests", response_model=schemas.MeetingRequest)
def create_meeting_request(
    request: schemas.MeetingRequestCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Request a meeting with an expert"""
    db_request = models.MeetingRequest(**request.dict(), requester_id=current_user.id)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


# ==================== HEALTH CHECK ====================
@app.get("/")
def root():
    return {"message": "CuraLink API is running", "version": settings.VERSION}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)