from pydantic import BaseModel, HttpUrl, EmailStr
from typing import Optional
import uuid
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    avatar_url: Optional[HttpUrl] = None
    is_active: bool = True
    is_admin: bool = False

class UserCreate(UserBase):
    github_id: int
    encrypted_oauth_token: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    avatar_url: Optional[HttpUrl] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: uuid.UUID
    github_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
