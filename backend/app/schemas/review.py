from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from backend.app.schemas.comment import CommentResponse
from backend.app.schemas.issue import IssueResponse

class ReviewBase(BaseModel):
    commit_sha: str
    recommendation: str = "Comment"
    overall_score: float = 0.0
    maintainability_score: float = 0.0
    security_score: float = 0.0
    performance_score: float = 0.0
    readability_score: float = 0.0
    testing_score: float = 0.0
    
    summary: Optional[str] = None
    positive_observations: Optional[str] = None
    critical_issues_summary: Optional[str] = None
    recommended_fixes: Optional[str] = None

class ReviewCreate(ReviewBase):
    pull_request_id: uuid.UUID

class ReviewResponse(ReviewBase):
    id: uuid.UUID
    pull_request_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    comments: List[CommentResponse] = []
    issues: List[IssueResponse] = []

    class Config:
        from_attributes = True
