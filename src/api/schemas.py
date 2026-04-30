from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class CEFRLevel(str, Enum):
    """CEFR Language Levels"""
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


# ==================== AUTH SCHEMAS ====================

class UserRegister(BaseModel):
    """User registration schema"""
    email: EmailStr
    first_name: str
    last_name: str
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    
    def validate_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")


class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    email: Optional[str] = None


# ==================== USER SCHEMAS ====================

class CertificationBase(BaseModel):
    """Base certification schema"""
    level: CEFRLevel
    name: str
    issuer: str


class CertificationResponse(CertificationBase):
    """Certification response schema"""
    id: str
    date: datetime
    
    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    first_name: str
    last_name: str
    avatar: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: int
    level: CEFRLevel
    current_module_index: int
    progress: float
    words_learned: int
    practice_hours: float
    streak: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    certificates: List[CertificationResponse] = []
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User update schema"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: Optional[str] = None
    level: Optional[CEFRLevel] = None
    

# ==================== MODULE SCHEMAS ====================

class ModuleBase(BaseModel):
    """Base module schema"""
    title: str
    description: str
    week: int


class ModuleResponse(ModuleBase):
    """Module response schema"""
    id: str
    level: CEFRLevel
    
    class Config:
        from_attributes = True


class ModuleCreate(BaseModel):
    """Module create schema"""
    id: str
    level: CEFRLevel
    title: str
    description: str
    week: int


# ==================== CURRICULUM SCHEMAS ====================

class CurriculumResponse(BaseModel):
    """Curriculum response schema"""
    level: CEFRLevel
    title: str
    description: str
    modules: List[ModuleResponse]


# ==================== EXERCISE SCHEMAS ====================

class ExerciseBase(BaseModel):
    """Base exercise schema"""
    exercise_type: str  # multiple_choice, fill_in_the_blank, matching, sentence_order
    question: str
    options: Optional[str] = None
    correct_answer: Optional[str] = None


class ExerciseResponse(ExerciseBase):
    """Exercise response schema"""
    id: str
    module_id: str
    
    class Config:
        from_attributes = True


# ==================== PROGRESS SCHEMAS ====================

class ProgressBase(BaseModel):
    """Base progress schema"""
    progress_percentage: float = 0
    words_learned_in_module: int = 0
    is_completed: bool = False
    passed_exam: bool = False


class ProgressResponse(ProgressBase):
    """Progress response schema"""
    id: int
    user_id: int
    module_id: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    """Progress update schema"""
    progress_percentage: Optional[float] = None
    words_learned_in_module: Optional[int] = None
    is_completed: Optional[bool] = None
    passed_exam: Optional[bool] = None


# ==================== PLACEMENT TEST SCHEMAS ====================

class PlacementTestQuestion(BaseModel):
    """Placement test question schema"""
    id: int
    level: CEFRLevel
    text: str
    options: List[str]
    answer: str


class PlacementTestAnswer(BaseModel):
    """Placement test answer schema"""
    question_id: int
    selected_option: str


class PlacementTestSubmit(BaseModel):
    """Placement test submission schema"""
    answers: List[PlacementTestAnswer]


class PlacementTestResult(BaseModel):
    """Placement test result schema"""
    score_a1: int
    score_a2: int
    score_b1: int
    score_b2: int
    score_c1: int
    score_c2: int
    recommended_level: CEFRLevel
    
    class Config:
        from_attributes = True


# ==================== PASSWORD RESET SCHEMAS ====================

class PasswordResetRequest(BaseModel):
    """Password reset request schema"""
    email: EmailStr


class PasswordReset(BaseModel):
    """Password reset schema"""
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
