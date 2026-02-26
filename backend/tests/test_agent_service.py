"""Unit tests for AgentService CRUD operations."""

import pytest

from services.agent_service import AgentService
from schemas.agent import AgentCreate, AgentUpdate
from models.agent import Agent


class TestAgentService:
    async def test_create_agent(self, db_session):
        service = AgentService(db_session)
        data = AgentCreate(name="TestBot", system_prompt="Be helpful", model="litellm/openai/gpt-5.2")
        agent = await service.create_agent(data)

        assert agent.id is not None
        assert agent.name == "TestBot"
        assert agent.system_prompt == "Be helpful"
        assert agent.model == "litellm/openai/gpt-5.2"

    async def test_get_agent(self, db_session):
        service = AgentService(db_session)
        created = await service.create_agent(
            AgentCreate(name="Bot", system_prompt="p", model="m")
        )
        fetched = await service.get_agent(created.id)
        assert fetched is not None
        assert fetched.id == created.id
        assert fetched.name == "Bot"

    async def test_get_agent_not_found(self, db_session):
        service = AgentService(db_session)
        result = await service.get_agent("nonexistent-id")
        assert result is None

    async def test_list_agents(self, db_session):
        service = AgentService(db_session)
        await service.create_agent(AgentCreate(name="A", system_prompt="p", model="m"))
        await service.create_agent(AgentCreate(name="B", system_prompt="p", model="m"))

        agents = await service.list_agents()
        assert len(agents) >= 2
        names = [a.name for a in agents]
        assert "A" in names
        assert "B" in names

    async def test_list_agents_order(self, db_session):
        service = AgentService(db_session)
        a1 = await service.create_agent(AgentCreate(name="First", system_prompt="p", model="m"))
        a2 = await service.create_agent(AgentCreate(name="Second", system_prompt="p", model="m"))

        agents = await service.list_agents()
        assert agents[0].created_at >= agents[1].created_at

    async def test_update_agent_name(self, db_session):
        service = AgentService(db_session)
        agent = await service.create_agent(
            AgentCreate(name="Old", system_prompt="p", model="m")
        )
        updated = await service.update_agent(agent.id, AgentUpdate(name="New"))

        assert updated is not None
        assert updated.name == "New"
        assert updated.system_prompt == "p"

    async def test_update_agent_all_fields(self, db_session):
        service = AgentService(db_session)
        agent = await service.create_agent(
            AgentCreate(name="Bot", system_prompt="old", model="old-model")
        )
        updated = await service.update_agent(
            agent.id,
            AgentUpdate(name="NewBot", system_prompt="new prompt", model="new-model"),
        )

        assert updated.name == "NewBot"
        assert updated.system_prompt == "new prompt"
        assert updated.model == "new-model"

    async def test_update_agent_not_found(self, db_session):
        service = AgentService(db_session)
        result = await service.update_agent("bad-id", AgentUpdate(name="X"))
        assert result is None

    async def test_update_agent_no_changes(self, db_session):
        service = AgentService(db_session)
        agent = await service.create_agent(
            AgentCreate(name="Bot", system_prompt="p", model="m")
        )
        updated = await service.update_agent(agent.id, AgentUpdate())
        assert updated is not None
        assert updated.name == "Bot"

    async def test_delete_agent(self, db_session):
        service = AgentService(db_session)
        agent = await service.create_agent(
            AgentCreate(name="ToDelete", system_prompt="p", model="m")
        )
        result = await service.delete_agent(agent.id)
        assert result is True

        fetched = await service.get_agent(agent.id)
        assert fetched is None

    async def test_delete_agent_not_found(self, db_session):
        service = AgentService(db_session)
        result = await service.delete_agent("nonexistent")
        assert result is False
