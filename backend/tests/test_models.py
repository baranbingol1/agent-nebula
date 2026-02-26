"""Unit tests for SQLAlchemy models - creation, defaults, relationships."""

import pytest
from datetime import datetime, timezone

from models.agent import Agent
from models.room import Room
from models.room_agent import RoomAgent
from models.message import Message


class TestAgentModel:
    async def test_create_agent(self, db_session):
        agent = Agent(name="TestBot", system_prompt="Be helpful", model="litellm/openai/gpt-5.2")
        db_session.add(agent)
        await db_session.flush()

        assert agent.id is not None
        assert len(agent.id) == 36  # UUID format
        assert agent.name == "TestBot"
        assert agent.created_at is not None

    async def test_agent_default_id_unique(self, db_session):
        a1 = Agent(name="Bot1", system_prompt="p1", model="m1")
        a2 = Agent(name="Bot2", system_prompt="p2", model="m2")
        db_session.add_all([a1, a2])
        await db_session.flush()
        assert a1.id != a2.id

    async def test_agent_created_at_auto(self, db_session):
        before = datetime.now(timezone.utc)
        agent = Agent(name="Bot", system_prompt="p", model="m")
        db_session.add(agent)
        await db_session.flush()
        assert agent.created_at >= before


class TestRoomModel:
    async def test_create_room(self, db_session):
        room = Room(name="Test Room")
        db_session.add(room)
        await db_session.flush()

        assert room.id is not None
        assert room.status == "idle"
        assert room.current_turn_index == 0
        assert room.max_turns == 20

    async def test_room_custom_fields(self, db_session):
        room = Room(name="Custom", description="A room", max_turns=50, status="running")
        db_session.add(room)
        await db_session.flush()

        assert room.max_turns == 50
        assert room.description == "A room"
        assert room.status == "running"


class TestRoomAgentModel:
    async def test_room_agent_association(self, db_session):
        agent = Agent(name="Bot", system_prompt="p", model="m")
        room = Room(name="Room")
        db_session.add_all([agent, room])
        await db_session.flush()

        ra = RoomAgent(room_id=room.id, agent_id=agent.id, turn_order=0)
        db_session.add(ra)
        await db_session.flush()

        assert ra.id is not None
        assert ra.room_id == room.id
        assert ra.agent_id == agent.id
        assert ra.turn_order == 0


class TestMessageModel:
    async def test_create_message(self, db_session):
        agent = Agent(name="Bot", system_prompt="p", model="m")
        room = Room(name="Room")
        db_session.add_all([agent, room])
        await db_session.flush()

        msg = Message(
            room_id=room.id,
            agent_id=agent.id,
            role="assistant",
            content="Hello world",
            turn_number=0,
        )
        db_session.add(msg)
        await db_session.flush()

        assert msg.id is not None
        assert msg.content == "Hello world"
        assert msg.role == "assistant"

    async def test_message_null_agent(self, db_session):
        room = Room(name="Room")
        db_session.add(room)
        await db_session.flush()

        msg = Message(
            room_id=room.id,
            agent_id=None,
            role="user",
            content="User message",
            turn_number=1,
        )
        db_session.add(msg)
        await db_session.flush()

        assert msg.agent_id is None
