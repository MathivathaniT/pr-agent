from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class CommentBase(BaseModel):
    file_path: str
    line_number: Optional[int] = None
    body: str
    source: str = "AI_AGENT"

class CommentCreate(CommentBase):
    review_id: uuid.UUID
    github_comment_id: Optional[int] = None

class CommentResponse(CommentBase):
    id: uuid.UUID
    review_id: uuid.UUID
    github_comment_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
