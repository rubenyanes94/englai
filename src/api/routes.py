from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from database import get_db
from models import User, Module, Progress, Certificate, CEFRLevelEnum
from schemas import (
    UserRegister, UserLogin, Token, UserResponse, UserUpdate,
    ModuleResponse, CurriculumResponse, ProgressResponse, ProgressUpdate,
    CertificationResponse
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_active_user
)
from config import get_settings

settings = get_settings()
router = APIRouter()


# ==================== AUTH ROUTES ====================

@router.post("/auth/register", response_model=UserResponse, tags=["auth"])
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Validate passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=hashed_password,
        level=CEFRLevelEnum.A1
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/auth/login", response_model=Token, tags=["auth"])
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


# ==================== USER ROUTES ====================

@router.get("/api/user", response_model=UserResponse, tags=["user"])
async def get_user(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user


@router.put("/api/user", response_model=UserResponse, tags=["user"])
async def update_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    
    if user_data.first_name:
        current_user.first_name = user_data.first_name
    if user_data.last_name:
        current_user.last_name = user_data.last_name
    if user_data.avatar:
        current_user.avatar = user_data.avatar
    if user_data.level:
        current_user.level = user_data.level
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.post("/api/user/logout", tags=["user"])
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user (client should discard token)"""
    return {"message": "Successfully logged out"}


# ==================== CURRICULUM ROUTES ====================

@router.get("/api/curriculum/{level}", response_model=CurriculumResponse, tags=["curriculum"])
async def get_curriculum(level: str, db: Session = Depends(get_db)):
    """Get curriculum for a specific CEFR level"""
    
    try:
        cefr_level = CEFRLevelEnum[level.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level. Must be one of: A1, A2, B1, B2, C1, C2"
        )
    
    modules = db.query(Module).filter(Module.level == cefr_level).all()
    
    return {
        "level": cefr_level,
        "title": f"Nivel {cefr_level}",
        "description": f"Curriculum for CEFR level {cefr_level}",
        "modules": modules
    }


@router.get("/api/modules/{level}", response_model=List[ModuleResponse], tags=["curriculum"])
async def get_modules_by_level(level: str, db: Session = Depends(get_db)):
    """Get all modules for a specific level"""
    
    try:
        cefr_level = CEFRLevelEnum[level.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level. Must be one of: A1, A2, B1, B2, C1, C2"
        )
    
    modules = db.query(Module).filter(Module.level == cefr_level).order_by(Module.week).all()
    
    return modules


@router.get("/api/module/{module_id}", response_model=ModuleResponse, tags=["curriculum"])
async def get_module(module_id: str, db: Session = Depends(get_db)):
    """Get a specific module"""
    
    module = db.query(Module).filter(Module.id == module_id).first()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    return module


# ==================== PROGRESS ROUTES ====================

@router.get("/api/progress", response_model=List[ProgressResponse], tags=["progress"])
async def get_user_progress(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user progress for all modules"""
    
    progress = db.query(Progress).filter(Progress.user_id == current_user.id).all()
    
    return progress


@router.get("/api/progress/{module_id}", response_model=ProgressResponse, tags=["progress"])
async def get_module_progress(
    module_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get progress for a specific module"""
    
    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.module_id == module_id
    ).first()
    
    if not progress:
        # Create new progress record
        module = db.query(Module).filter(Module.id == module_id).first()
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found"
            )
        
        progress = Progress(user_id=current_user.id, module_id=module_id)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return progress


@router.put("/api/progress/{module_id}", response_model=ProgressResponse, tags=["progress"])
async def update_module_progress(
    module_id: str,
    progress_data: ProgressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update progress for a specific module"""
    
    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.module_id == module_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress record not found"
        )
    
    if progress_data.progress_percentage is not None:
        progress.progress_percentage = progress_data.progress_percentage
    if progress_data.words_learned_in_module is not None:
        progress.words_learned_in_module = progress_data.words_learned_in_module
    if progress_data.is_completed is not None:
        progress.is_completed = progress_data.is_completed
    if progress_data.passed_exam is not None:
        progress.passed_exam = progress_data.passed_exam
    
    db.commit()
    db.refresh(progress)
    
    return progress


@router.post("/api/progress/complete-module", tags=["progress"])
async def complete_module(
    module_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a module as completed"""
    
    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.module_id == module_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress record not found"
        )
    
    progress.is_completed = True
    progress.progress_percentage = 100
    
    # Update user current module index
    module = db.query(Module).filter(Module.id == module_id).first()
    if module and module.week < 8:  # 8 modules per level
        current_user.current_module_index = module.week
    
    db.commit()
    db.refresh(progress)
    
    return {"message": "Module completed successfully"}


# ==================== CERTIFICATES ROUTES ====================

@router.get("/api/certificates", response_model=List[CertificationResponse], tags=["certificates"])
async def get_user_certificates(
    current_user: User = Depends(get_current_active_user)
):
    """Get all certificates for current user"""
    return current_user.certificates


@router.post("/api/certificates", response_model=CertificationResponse, tags=["certificates"])
async def create_certificate(
    level: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new certificate for user (after passing exam)"""
    
    try:
        cefr_level = CEFRLevelEnum[level.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level"
        )
    
    # Check if user already has certificate for this level
    existing_cert = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.level == cefr_level
    ).first()
    
    if existing_cert:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has certificate for this level"
        )
    
    # Create certificate
    cert_id = f"cert_{current_user.id}_{cefr_level}_{int(__import__('time').time())}"
    certificate = Certificate(
        id=cert_id,
        user_id=current_user.id,
        level=cefr_level,
        name=f"Certificación CEFR {cefr_level}",
        issuer="Vene-English Academy"
    )
    
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    
    return certificate


# ==================== HEALTH CHECK ====================

@router.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
