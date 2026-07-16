import uuid
from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.repository import Repository
    from backend.app.models.review import Review

class PullRequest(Base):
    """
    Represents a Pull Request retrieved from GitHub, acting as the root node
    for individual reviews.
    """
    repository_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository.id"), index=True)
    
    number: Mapped[int] = mapped_column(Integer, index=True)  # PR number on GitHub, e.g. 42
    title: Mapped[str] = mapped_column(String(255))
    state: Mapped[str] = mapped_column(String(50))  # open, closed, merged
    
    source_branch: Mapped[str] = mapped_column(String(255))
    target_branch: Mapped[str] = mapped_column(String(255))
    
    head_sha: Mapped[str] = mapped_column(String(100))  # Commit hash triggering the review
    base_sha: Mapped[str] = mapped_column(String(100))
    
    user_avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    author_username: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    repository: Mapped["Repository"] = relationship("Repository", back_populates="pull_requests")
    reviews: Mapped[List["Review"]] = relationship(
        "Review", 
        back_populates="pull_request",
        cascade="all, delete-orphan"
    )
