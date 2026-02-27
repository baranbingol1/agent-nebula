from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.message import Message


class MessageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_messages(
        self, room_id: str, limit: int = 100, offset: int = 0
    ) -> tuple[list[Message], int]:
        count_result = await self.db.execute(
            select(func.count(Message.id)).where(Message.room_id == room_id)
        )
        total = count_result.scalar()

        result = await self.db.execute(
            select(Message)
            .where(Message.room_id == room_id)
            .options(selectinload(Message.agent))
            .order_by(Message.created_at.asc())
            .limit(limit)
            .offset(offset)
        )
        messages = list(result.scalars().all())
        return messages, total

    async def create_message(
        self,
        room_id: str,
        content: str,
        role: str,
        turn_number: int,
        agent_id: str | None = None,
    ) -> Message:
        msg = Message(
            room_id=room_id,
            agent_id=agent_id,
            role=role,
            content=content,
            turn_number=turn_number,
        )
        self.db.add(msg)
        await self.db.flush()
        await self.db.refresh(msg, ["agent"])
        return msg

    async def get_conversation_history(self, room_id: str) -> list[dict]:
        result = await self.db.execute(
            select(Message)
            .where(Message.room_id == room_id)
            .options(selectinload(Message.agent))
            .order_by(Message.created_at.asc())
        )
        messages = result.scalars().all()
        history = []
        for msg in messages:
            name = msg.agent.name if msg.agent else "User"
            history.append({
                "role": msg.role,
                "content": msg.content,
                "agent_id": msg.agent_id,
                "name": name,
                "turn_number": msg.turn_number,
            })
        return history
