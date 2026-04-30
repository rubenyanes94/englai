from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class CEFRLevelEnum(str, enum.Enum):
    """CEFR Language Levels"""
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


class User(Base):
    """User model for storing user data"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    
    # Learning data
    level = Column(Enum(CEFRLevelEnum), default=CEFRLevelEnum.A1)
    current_module_index = Column(Integer, default=0)
    progress = Column(Float, default=0)  # Porcentaje 0-100
    words_learned = Column(Integer, default=0)
    practice_hours = Column(Float, default=0)
    streak = Column(Integer, default=0)
    
    # Account
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def name(self) -> str:
        """Return full name"""
        return f"{self.first_name} {self.last_name}"


class Module(Base):
    """Module model for storing course modules"""
    __tablename__ = "modules"
    
    id = Column(String, primary_key=True, index=True)
    level = Column(Enum(CEFRLevelEnum), index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    week = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    exercises = relationship("Exercise", back_populates="module", cascade="all, delete-orphan")
    progress_records = relationship("Progress", back_populates="module")


class Exercise(Base):
    """Exercise model for storing exercises"""
    __tablename__ = "exercises"
    
    id = Column(String, primary_key=True, index=True)
    module_id = Column(String, ForeignKey("modules.id"))
    
    exercise_type = Column(String)  # multiple_choice, fill_in_the_blank, matching, sentence_order
    question = Column(String, nullable=False)
    options = Column(String)  # JSON string
    correct_answer = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    module = relationship("Module", back_populates="exercises")


class Progress(Base):
    """Progress model for tracking user progress in modules"""
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(String, ForeignKey("modules.id"))
    
    progress_percentage = Column(Float, default=0)
    words_learned_in_module = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    passed_exam = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="progress_records")
    module = relationship("Module", back_populates="progress_records")


class Certificate(Base):
    """Certificate model for storing earned certificates"""
    __tablename__ = "certificates"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    level = Column(Enum(CEFRLevelEnum), nullable=False)
    name = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    issuer = Column(String, default="Vene-English Academy")
    
    # Relationships
    user = relationship("User", back_populates="certificates")


class PlacementTestResult(Base):
    """PlacementTestResult model for storing test results"""
    __tablename__ = "placement_test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    score_a1 = Column(Integer, default=0)
    score_a2 = Column(Integer, default=0)
    score_b1 = Column(Integer, default=0)
    score_b2 = Column(Integer, default=0)
    score_c1 = Column(Integer, default=0)
    score_c2 = Column(Integer, default=0)
    
    recommended_level = Column(Enum(CEFRLevelEnum))
    taken_at = Column(DateTime, default=datetime.utcnow)
