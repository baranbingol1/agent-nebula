"""Unit tests for MessageService operations."""

import pytest

from services.message_service import MessageService
from services.agent_service import AgentService
from services.room_service import RoomService
from schemas.agent import AgentCreate
from schemas.room import RoomCreate


async def _setup_room_and_agent(db_session):
    agent_svc = AgentService(db_session)
    room_svc = RoomService(db_session)
    agent = await agent_svc.create_agent(
        AgentCreate(name="Bot", system_prompt="p", model="m")
    )
    room = await room_svc.create_room(RoomCreate(name="Room"))
    return room, agent


class TestMessageService:
    async def test_create_message(self, db_session):
        room, agent = await _setup_room_and_agent(db_session)
        service = MessageService(db_session)

        msg = await service.create_message(
            room_id=room.id,
            content="Hello!",
            role="assistant",
            turn_number=0,
            agent_id=agent.id,
        )
        assert msg.id is not None
        assert msg.content == "Hello!"
        assert msg.role == "assistant"
        assert msg.turn_number == 0

    async def test_create_user_message(self, db_session):
        room, _ = await _setup_room_and_agent(db_session)
        service = MessageService(db_session)

        msg = await service.create_message(
            room_id=room.id,
            content="User input",
            role="user",
            turn_number=1,
        )
        assert msg.agent_id is None
        assert msg.role == "user"

    async def test_get_messages(self, db_session):
        room, agent = await _setup_room_and_agent(db_session)
        service = MessageService(db_session)

        for i in range(5):
            await service.create_message(
                room_id=room.id,
                content=f"Message {i}",
                role="assistant",
                turn_number=i,
                agent_id=agent.id,
            )

        messages, total = await service.get_messages(room.id)
        assert total == 5
        assert len(messages) == 5

    async def test_get_messages_pagination(self, db_session):
        room, agent = await _setup_room_and_agent(db_session)
        service = MessageService(db_session)

        for i in range(10):
            await service.create_message(
                room_id=room.id,
                content=f"Message {i}",
                role="assistant",
                turn_number=i,
                agent_id=agent.id,
            )

        messages, total = await service.get_messages(room.id, limit=3, offset=0)
        assert total == 10
        assert len(messages) == 3

        messages2, _ = await service.get_messages(room.id, limit=3, offset=3)
        assert len(messages2) == 3
        assert messages2[0].content != messages[0].content

    async def test_get_messages_empty_room(self, db_session):
        room_svc = RoomService(db_session)
        room = await room_svc.create_room(RoomCreate(name="Empty"))
        service = MessageService(db_session)

        messages, total = await service.get_messages(room.id)
        assert total == 0
        assert messages == []

    async def test_get_messages_order(self, db_session):
        room, agent = await _setup_room_and_agent(db_session)
        service = MessageService(db_session)

        await service.create_message(room.id, "First", "assistant", 0, agent.id)
        await service.create_message(room.id, "Second", "assistant", 1, agent.id)
        await service.create_message(room.id, "Third", "assistant", 2, agent.id)

        messages, _ = await service.get_messages(room.id)
        assert messages[0].content == "First"
        assert messages[2].content == "Third"

    async def test_get_conversation_history(self, db_session):
        room, agent = await _setup_room_and_agent(db_session)
        service = MessageService(db_session)

        await service.create_message(room.id, "Hello", "assistant", 0, agent.id)
        await service.create_message(room.id, "User input", "user", 1)

        history = await service.get_conversation_history(room.id)
        assert len(history) == 2
        assert history[0]["role"] == "assistant"
        assert history[0]["name"] == "Bot"
        assert history[1]["role"] == "user"
        assert history[1]["name"] == "User"

    async def test_conversation_history_empty(self, db_session):
        room_svc = RoomService(db_session)
        room = await room_svc.create_room(RoomCreate(name="Empty"))
        service = MessageService(db_session)

        history = await service.get_conversation_history(room.id)
        assert history == []
