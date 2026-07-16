import uuid
from sqlalchemy import Float, String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.pull_request import PullRequest
    from backend.app.models.comment import Comment
    from backend.app.models.issue import Issue
    from backend.app.models.llm_response import LLMResponse

class Review(Base):
    """
    Groups the findings of an execution review run, capturing numerical quality scales,
    summarized review advice, and specific comments.
    """
    pull_request_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pull_request.id"), index=True)
    
    # Target commit SHA reviewed
    commit_sha: Mapped[str] = mapped_column(String(100), index=True)
    
    # Recommendation: "Approve", "Comment", "Request Changes"
    recommendation: Mapped[str] = mapped_column(String(50), default="Comment")
    
    # Scoring matrix from 0.0 to 10.0
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    maintainability_score: Mapped[float] = mapped_column(Float, default=0.0)
    security_score: Mapped[float] = mapped_column(Float, default=0.0)
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    readability_score: Mapped[float] = mapped_column(Float, default=0.0)
    testing_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Core Markdown summaries
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    positive_observations: Mapped[str] = mapped_column(Text, nullable=True)
    critical_issues_summary: Mapped[str] = mapped_column(Text, nullable=True)
    recommended_fixes: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    pull_request: Mapped["PullRequest"] = relationship("PullRequest", back_populates="reviews")
    comments: Mapped[List["Comment"]] = relationship(
        "Comment", 
        back_populates="review",
        cascade="all, delete-orphan"
    )
    issues: Mapped[List["Issue"]] = relationship(
        "Issue", 
        back_populates="review",
        cascade="all, delete-orphan"
    )
    llm_responses: Mapped[List["LLMResponse"]] = relationship(
        "LLMResponse", 
        back_populates="review",
        cascade="all, delete-orphan"
    )
