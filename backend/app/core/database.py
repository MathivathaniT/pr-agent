"""
Database Core module providing modern SQLAlchemy engine setup and standard Base class.
"""
from datetime import datetime, timezone
from typing import Any
import uuid

from sqlalchemy import create_engine, DateTime
from sqlalchemy.orm import declarative_base, declared_attr, sessionmaker, Mapped, mapped_column

# In production, this would be read from Environment variables via Pydantic settings.
DATABASE_URL = "postgresql://user:password@localhost:5432/github_agent"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Automatic connection health check
    pool_recycle=3600,   # Recycle connections hourly to prevent stale sockets
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class CustomBase:
    """
    Custom Declarative Base providing automatic table naming, generic ID columns,
    and standard created_at/updated_at audit fields.
    """
    @declared_attr
    def __tablename__(cls) -> str:
        # Converts UserService -> user_service automatically
        import re
        name = cls.__name__
        return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()

    # Shared default attributes
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

Base = declarative_base(cls=CustomBase)

def get_db():
    """
    FastAPI Dependency yielding database sessions with automatic transactional teardowns.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
