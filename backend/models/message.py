import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    agent_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    turn_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    room: Mapped["Room"] = relationship("Room", back_populates="messages")  # noqa: F821
    agent: Mapped["Agent | None"] = relationship("Agent", back_populates="messages")  # noqa: F821
