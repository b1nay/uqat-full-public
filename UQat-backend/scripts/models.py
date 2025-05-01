

# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from pydantic import BaseModel
# from sqlalchemy import Column, Integer, String, JSON
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    hashed_password = Column(String)  # 👈 Add this line
    # Relationship with Chat table
    chat_history = relationship("Chat", back_populates="user")

class Chat(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # FK to users.id
    title = Column(String, nullable=True)
    chat_data = Column(JSON)

    user = relationship("User", back_populates="chat_history")



