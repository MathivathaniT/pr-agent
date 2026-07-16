from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class RepositoryBase(BaseModel):
    name: str
    full_name: str
    is_active: bool = True
    branches_whitelist: Optional[str] = ""
    custom_review_instructions: Optional[str] = None

class RepositoryCreate(RepositoryBase):
    github_repo_id: int
    webhook_secret: Optional[str] = None

class RepositoryUpdate(BaseModel):
    is_active: Optional[bool] = None
    branches_whitelist: Optional[str] = None
    custom_review_instructions: Optional[str] = None
    webhook_secret: Optional[str] = None

class RepositoryResponse(RepositoryBase):
    id: uuid.UUID
    github_repo_id: int
    owner_id: uuid.UUID
    webhook_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
