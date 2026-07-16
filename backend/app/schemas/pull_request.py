from pydantic import BaseModel, HttpUrl
from typing import Optional
import uuid
from datetime import datetime

class PullRequestBase(BaseModel):
    number: int
    title: str
    state: str
    source_branch: str
    target_branch: str
    head_sha: str
    base_sha: str
    user_avatar_url: Optional[HttpUrl] = None
    author_username: str
    description: Optional[str] = None

class PullRequestCreate(PullRequestBase):
    repository_id: uuid.UUID

class PullRequestUpdate(BaseModel):
    state: Optional[str] = None
    title: Optional[str] = None
    head_sha: Optional[str] = None
    description: Optional[str] = None

class PullRequestResponse(PullRequestBase):
    id: uuid.UUID
    repository_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
