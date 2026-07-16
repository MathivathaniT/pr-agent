import uuid
from sqlalchemy import String, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.user import User
    from backend.app.models.pull_request import PullRequest

class Repository(Base):
    """
    Represents a GitHub Repository connected to the automated PR reviewer.
    """
    github_repo_id: Mapped[int] = mapped_column(unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)  # e.g., "my-repo"
    full_name: Mapped[str] = mapped_column(String(255), unique=True, index=True)  # e.g., "owner/my-repo"
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), index=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Secrets & Config
    webhook_id: Mapped[int] = mapped_column(nullable=True)
    webhook_secret: Mapped[str] = mapped_column(String(255), nullable=True) # Used to sign incoming webhooks
    
    # Specific branches to monitor. Default is empty (means check all branches or primary branch)
    branches_whitelist: Mapped[str] = mapped_column(Text, nullable=True, default="")
    
    # Custom instructions context (e.g. "Ignore legacy folder /dep")
    custom_review_instructions: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="repositories")
    pull_requests: Mapped[List["PullRequest"]] = relationship(
        "PullRequest", 
        back_populates="repository",
        cascade="all, delete-orphan"
    )
