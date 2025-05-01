# schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True



class Message(BaseModel):
    id: int
    text: str
    sender: str
    details: dict = None
    expanded: bool = False
    isLoading: bool = False
    isError: bool = False

class ChatHistory(BaseModel):
    title: str
    messages: list[Message]