from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.audit_log import AuditLog
    from backend.app.models.repository import Repository

class User(Base):
    """
    SaaS User representation containing authenticated GitHub OAuth credentials,
    profile metadata, and subscription statuses.
    """
    github_id: Mapped[int] = mapped_column(unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    
    # Encrypted OAuth Access Token (used to fetch file trees and commit status)
    encrypted_oauth_token: Mapped[str] = mapped_column(Text, nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    repositories: Mapped[List["Repository"]] = relationship(
        "Repository", 
        back_populates="owner",
        cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )
