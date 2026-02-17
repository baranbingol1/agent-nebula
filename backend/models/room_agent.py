from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class RoomAgent(Base):
    __tablename__ = "room_agents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    turn_order: Mapped[int] = mapped_column(Integer, nullable=False)

    room: Mapped["Room"] = relationship("Room", back_populates="agents")  # noqa: F821
    agent: Mapped["Agent"] = relationship("Agent", back_populates="room_assignments")  # noqa: F821

    __table_args__ = (
        UniqueConstraint("room_id", "agent_id", name="uq_room_agent"),
        UniqueConstraint("room_id", "turn_order", name="uq_room_turn_order"),
    )
