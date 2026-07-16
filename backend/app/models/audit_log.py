import uuid
from sqlalchemy import String, ForeignKey, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.user import User

class AuditLog(Base):
    """
    Tracks administrative and configuration actions performed on the management dashboard.
    """
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), index=True, nullable=True)
    
    # Action type, e.g., "REPO_CONNECTED", "REPO_DISCONNECTED", "PREFERENCES_UPDATED", "MANUAL_REVIEW_TRIGGERED"
    action: Mapped[str] = mapped_column(String(100), index=True)
    
    # Context summary, e.g., "Connected repository owner/my-repo"
    details: Mapped[str] = mapped_column(Text)
    
    # Optional IP address or browser agent logging
    ip_address: Mapped[str] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="audit_logs")
