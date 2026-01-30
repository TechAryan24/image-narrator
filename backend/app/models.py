from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)  # New field
    hashed_password = Column(String)
    history = relationship("History", back_populates="owner")

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    image_name = Column(String)
    description = Column(Text)
    
    # --- NEW COLUMN ---
    # This stores the actual image code (Base64)
    image_data = Column(Text) 
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="history")

class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)

