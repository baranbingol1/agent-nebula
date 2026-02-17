from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.room import Room
from models.room_agent import RoomAgent
from models.agent import Agent
from schemas.room import RoomCreate, RoomUpdate


class RoomService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_rooms(self) -> list[Room]:
        result = await self.db.execute(
            select(Room)
            .options(selectinload(Room.agents).selectinload(RoomAgent.agent))
            .order_by(Room.created_at.desc())
        )
        return list(result.scalars().unique().all())

    async def get_room(self, room_id: str) -> Room | None:
        result = await self.db.execute(
            select(Room)
            .where(Room.id == room_id)
            .options(selectinload(Room.agents).selectinload(RoomAgent.agent))
        )
        return result.scalar_one_or_none()

    async def create_room(self, data: RoomCreate) -> Room:
        room = Room(**data.model_dump())
        self.db.add(room)
        await self.db.flush()
        await self.db.refresh(room)
        return room

    async def update_room(self, room_id: str, data: RoomUpdate) -> Room | None:
        room = await self.get_room(room_id)
        if not room:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(room, key, value)
        await self.db.flush()
        await self.db.refresh(room)
        return room

    async def delete_room(self, room_id: str) -> bool:
        room = await self.db.get(Room, room_id)
        if not room:
            return False
        await self.db.delete(room)
        await self.db.flush()
        return True

    async def add_agent_to_room(self, room_id: str, agent_id: str) -> RoomAgent | None:
        room = await self.db.get(Room, room_id)
        agent = await self.db.get(Agent, agent_id)
        if not room or not agent:
            return None

        existing = await self.db.execute(
            select(RoomAgent).where(
                RoomAgent.room_id == room_id,
                RoomAgent.agent_id == agent_id
            )
        )
        if existing.scalar_one_or_none():
            return None

        max_order = await self.db.execute(
            select(func.coalesce(func.max(RoomAgent.turn_order), -1))
            .where(RoomAgent.room_id == room_id)
        )
        next_order = max_order.scalar() + 1

        room_agent = RoomAgent(room_id=room_id, agent_id=agent_id, turn_order=next_order)
        self.db.add(room_agent)
        await self.db.flush()
        return room_agent

    async def remove_agent_from_room(self, room_id: str, agent_id: str) -> bool:
        result = await self.db.execute(
            select(RoomAgent).where(
                RoomAgent.room_id == room_id,
                RoomAgent.agent_id == agent_id
            )
        )
        room_agent = result.scalar_one_or_none()
        if not room_agent:
            return False

        removed_order = room_agent.turn_order
        await self.db.delete(room_agent)
        await self.db.flush()

        remaining = await self.db.execute(
            select(RoomAgent)
            .where(RoomAgent.room_id == room_id, RoomAgent.turn_order > removed_order)
            .order_by(RoomAgent.turn_order)
        )
        for ra in remaining.scalars().all():
            ra.turn_order -= 1
        await self.db.flush()
        return True

    async def reorder_agents(self, room_id: str, agent_ids: list[str]) -> bool:
        result = await self.db.execute(
            select(RoomAgent).where(RoomAgent.room_id == room_id)
        )
        room_agents = {ra.agent_id: ra for ra in result.scalars().all()}

        if set(agent_ids) != set(room_agents.keys()):
            return False

        # Temporarily set high turn orders to avoid unique constraint violations
        for i, ra in enumerate(room_agents.values()):
            ra.turn_order = 1000 + i
        await self.db.flush()

        for i, agent_id in enumerate(agent_ids):
            room_agents[agent_id].turn_order = i
        await self.db.flush()
        return True
