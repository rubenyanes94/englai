from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
import datetime
from database import Base

class CEFRLevel(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    level = Column(String, default=CEFRLevel.A1)
    current_module_index = Column(Integer, default=0)
    
    sessions = relationship("ClassSession", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    payments = relationship("Payment", back_populates="user")

class ClassSession(Base):
    __tablename__ = "class_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_index = Column(Integer)
    completed = Column(Integer, default=0) # 0 o 1 en SQLite
    
    user = relationship("User", back_populates="sessions")

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    level_achieved = Column(String)
    issue_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="certificates")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    method = Column(String) # Pago Móvil, Mastercard, PayPal, Binance
    reference_code = Column(String, unique=True, index=True)
    status = Column(String, default="pending")
    
    user = relationship("User", back_populates="payments")