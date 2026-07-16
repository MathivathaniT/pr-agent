import uuid
from sqlalchemy import Integer, String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.review import Review

class Comment(Base):
    """
    Line-level or file-level review feedback mapped directly to raw files and diff lines.
    """
    review_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("review.id"), index=True)
    
    # Path of the target file, e.g. "src/auth/service.py"
    file_path: Mapped[str] = mapped_column(String(500), index=True)
    
    # Target line number in the current version of the file (nullable for general file-level comments)
    line_number: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # The actual Markdown feedback content containing the code suggestion
    body: Mapped[str] = mapped_column(Text)
    
    # Associated GitHub comment ID if posted back (helps with synchronization and replies)
    github_comment_id: Mapped[int] = mapped_column(Integer, nullable=True, index=True)
    
    # Source indicator, e.g., "AI_AGENT", "PYLINT", "BANDIT", "ESLINT"
    source: Mapped[str] = mapped_column(String(50), default="AI_AGENT")

    # Relationships
    review: Mapped["Review"] = relationship("Review", back_populates="comments")
