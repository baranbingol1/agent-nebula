"""Unit tests for Pydantic schemas - validation, serialization, defaults."""

import pytest
from datetime import datetime, timezone
from pydantic import ValidationError

from schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomAgentAdd, RoomAgentReorder
from schemas.message import MessageResponse
from schemas.simulation import SimulationStatus, InjectMessage


class TestAgentSchemas:
    def test_agent_create_valid(self):
        data = AgentCreate(name="TestBot", system_prompt="Be helpful", model="litellm/openai/gpt-5.2")
        assert data.name == "TestBot"
        assert data.system_prompt == "Be helpful"
        assert data.model == "litellm/openai/gpt-5.2"

    def test_agent_create_missing_field(self):
        with pytest.raises(ValidationError):
            AgentCreate(name="TestBot", system_prompt="Be helpful")

    def test_agent_create_empty_name(self):
        agent = AgentCreate(name="", system_prompt="prompt", model="litellm/openai/gpt-5.2")
        assert agent.name == ""

    def test_agent_update_partial(self):
        data = AgentUpdate(name="NewName")
        assert data.name == "NewName"
        assert data.system_prompt is None
        assert data.model is None

    def test_agent_update_empty(self):
        data = AgentUpdate()
        assert data.name is None
        assert data.system_prompt is None
        assert data.model is None

    def test_agent_update_all_fields(self):
        data = AgentUpdate(name="New", system_prompt="Updated", model="litellm/openai/gpt-5-mini")
        dump = data.model_dump(exclude_unset=True)
        assert len(dump) == 3

    def test_agent_response_from_attributes(self):
        now = datetime.now(timezone.utc)
        resp = AgentResponse(
            id="abc-123",
            name="Bot",
            system_prompt="prompt",
            model="litellm/openai/gpt-5.2",
            created_at=now,
        )
        assert resp.id == "abc-123"
        assert resp.created_at == now


class TestRoomSchemas:
    def test_room_create_defaults(self):
        data = RoomCreate(name="Test Room")
        assert data.description == ""
        assert data.max_turns == 20

    def test_room_create_custom(self):
        data = RoomCreate(name="Room", description="A test room", max_turns=50)
        assert data.max_turns == 50
        assert data.description == "A test room"

    def test_room_create_missing_name(self):
        with pytest.raises(ValidationError):
            RoomCreate()

    def test_room_update_partial(self):
        data = RoomUpdate(name="NewRoom")
        dump = data.model_dump(exclude_unset=True)
        assert dump == {"name": "NewRoom"}

    def test_room_update_empty(self):
        data = RoomUpdate()
        dump = data.model_dump(exclude_unset=True)
        assert dump == {}

    def test_room_response_with_agents(self):
        now = datetime.now(timezone.utc)
        resp = RoomResponse(
            id="room-1",
            name="Test",
            description=None,
            status="idle",
            current_turn_index=0,
            max_turns=20,
            created_at=now,
            agents=[],
        )
        assert resp.agents == []
        assert resp.status == "idle"

    def test_room_agent_add(self):
        data = RoomAgentAdd(agent_id="agent-1")
        assert data.agent_id == "agent-1"

    def test_room_agent_add_missing_id(self):
        with pytest.raises(ValidationError):
            RoomAgentAdd()

    def test_room_agent_reorder(self):
        data = RoomAgentReorder(agent_ids=["a1", "a2", "a3"])
        assert len(data.agent_ids) == 3

    def test_room_agent_reorder_empty(self):
        data = RoomAgentReorder(agent_ids=[])
        assert data.agent_ids == []


class TestMessageSchemas:
    def test_message_response(self):
        now = datetime.now(timezone.utc)
        resp = MessageResponse(
            id="msg-1",
            room_id="room-1",
            agent_id="agent-1",
            role="assistant",
            content="Hello",
            turn_number=0,
            created_at=now,
            agent_name="Bot",
        )
        assert resp.role == "assistant"
        assert resp.agent_name == "Bot"

    def test_message_response_null_agent(self):
        now = datetime.now(timezone.utc)
        resp = MessageResponse(
            id="msg-2",
            room_id="room-1",
            agent_id=None,
            role="user",
            content="User message",
            turn_number=1,
            created_at=now,
        )
        assert resp.agent_id is None
        assert resp.agent_name is None


class TestSimulationSchemas:
    def test_simulation_status(self):
        status = SimulationStatus(
            room_id="room-1",
            status="running",
            current_turn_index=5,
            max_turns=20,
        )
        assert status.status == "running"

    def test_inject_message(self):
        msg = InjectMessage(content="Hello from user")
        assert msg.content == "Hello from user"

    def test_inject_message_missing_content(self):
        with pytest.raises(ValidationError):
            InjectMessage()
