import uuid
from sqlalchemy import Integer, String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.review import Review

class Issue(Base):
    """
    SaaS tracking table isolating and classifying individual defects, security problems,
    or performance bottlenecks discovered during review.
    """
    review_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("review.id"), index=True)
    
    # Severity: "Low", "Medium", "High", "Critical"
    severity: Mapped[str] = mapped_column(String(50), index=True)
    
    # Category: "Security", "Performance", "Bug", "Style", "Documentation", "Maintainability"
    category: Mapped[str] = mapped_column(String(100), index=True)
    
    file_path: Mapped[str] = mapped_column(String(500), index=True)
    line_number: Mapped[int] = mapped_column(Integer, nullable=True)
    
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    suggestion: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Indicates whether the issue has been marked resolved on the dashboard or subsequent commits
    is_resolved: Mapped[bool] = mapped_column(default=False)

    # Relationships
    review: Mapped["Review"] = relationship("Review", back_populates="issues")
