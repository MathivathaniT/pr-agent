from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class IssueBase(BaseModel):
    severity: str  # "Low", "Medium", "High", "Critical"
    category: str  # "Security", "Performance", "Bug", "Style", "Documentation", "Maintainability"
    file_path: str
    line_number: Optional[int] = None
    title: str
    description: str
    suggestion: Optional[str] = None
    is_resolved: bool = False

class IssueCreate(IssueBase):
    review_id: uuid.UUID

class IssueUpdate(BaseModel):
    is_resolved: Optional[bool] = None

class IssueResponse(IssueBase):
    id: uuid.UUID
    review_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
