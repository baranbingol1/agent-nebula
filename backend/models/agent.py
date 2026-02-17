import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str] = mapped_column(String(200), nullable=False)
    avatar_id: Mapped[str] = mapped_column(String(50), nullable=False, default="robot")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    room_assignments: Mapped[list["RoomAgent"]] = relationship(  # noqa: F821
        "RoomAgent", back_populates="agent", cascade="all, delete-orphan"
    )
    messages: Mapped[list["Message"]] = relationship(  # noqa: F821
        "Message", back_populates="agent"
    )
