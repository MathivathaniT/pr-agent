import uuid
from sqlalchemy import Integer, Float, String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from backend.app.core.database import Base

if TYPE_CHECKING:
    from backend.app.models.review import Review

class LLMResponse(Base):
    """
    Diagnostic log of API calls made to Gemini. Keeps a full audit trail
    of tokens, latency, prompts, and raw response JSON.
    """
    review_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("review.id"), index=True, nullable=True)
    
    model_name: Mapped[str] = mapped_column(String(100))  # e.g. "gemini-3.5-flash"
    
    # Token usage statistics
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    
    # Execution metrics
    latency_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Payload details (stored as text/JSON text)
    prompt_raw: Mapped[str] = mapped_column(Text)
    response_raw: Mapped[str] = mapped_column(Text)
    
    # Success/Failure details
    is_success: Mapped[bool] = mapped_column(default=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    review: Mapped["Review"] = relationship("Review", back_populates="llm_responses")
