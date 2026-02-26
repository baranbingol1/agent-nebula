"""Integration tests for the messages API endpoint."""

import pytest

from services.message_service import MessageService


async def _setup(client, db_session):
    agent_resp = await client.post("/api/agents", json={
        "name": "Bot", "system_prompt": "p", "model": "m"
    })
    room_resp = await client.post("/api/rooms", json={"name": "Room"})
    return room_resp.json()["id"], agent_resp.json()["id"]


class TestMessagesAPI:
    async def test_get_messages_empty(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]

        response = await client.get(f"/api/messages/{room_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["messages"] == []
        assert data["total"] == 0

    async def test_get_messages_with_data(self, client, db_session):
        room_id, agent_id = await _setup(client, db_session)

        service = MessageService(db_session)
        for i in range(3):
            await service.create_message(room_id, f"Msg {i}", "assistant", i, agent_id)
        await db_session.commit()

        response = await client.get(f"/api/messages/{room_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["messages"]) == 3

    async def test_get_messages_pagination_limit(self, client, db_session):
        room_id, agent_id = await _setup(client, db_session)

        service = MessageService(db_session)
        for i in range(10):
            await service.create_message(room_id, f"Msg {i}", "assistant", i, agent_id)
        await db_session.commit()

        response = await client.get(f"/api/messages/{room_id}?limit=3&offset=0")
        data = response.json()
        assert data["total"] == 10
        assert len(data["messages"]) == 3

    async def test_get_messages_pagination_offset(self, client, db_session):
        room_id, agent_id = await _setup(client, db_session)

        service = MessageService(db_session)
        for i in range(5):
            await service.create_message(room_id, f"Msg {i}", "assistant", i, agent_id)
        await db_session.commit()

        response = await client.get(f"/api/messages/{room_id}?limit=2&offset=3")
        data = response.json()
        assert data["total"] == 5
        assert len(data["messages"]) == 2
