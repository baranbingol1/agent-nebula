"""Integration tests for the rooms API endpoints."""

import pytest


async def _create_agent(client, name="Bot"):
    resp = await client.post("/api/agents", json={
        "name": name, "system_prompt": "p", "model": "m"
    })
    return resp.json()["id"]


class TestRoomsAPI:
    async def test_create_room(self, client):
        response = await client.post("/api/rooms", json={"name": "Test Room"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Room"
        assert data["status"] == "idle"
        assert data["max_turns"] == 20
        assert data["agents"] == []

    async def test_create_room_custom(self, client):
        response = await client.post("/api/rooms", json={
            "name": "Custom",
            "description": "A test room",
            "max_turns": 50,
        })
        assert response.status_code == 201
        data = response.json()
        assert data["max_turns"] == 50
        assert data["description"] == "A test room"

    async def test_list_rooms(self, client):
        await client.post("/api/rooms", json={"name": "R1"})
        await client.post("/api/rooms", json={"name": "R2"})

        response = await client.get("/api/rooms")
        assert response.status_code == 200
        assert len(response.json()) >= 2

    async def test_get_room(self, client):
        create_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = create_resp.json()["id"]

        response = await client.get(f"/api/rooms/{room_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "Room"

    async def test_get_room_not_found(self, client):
        response = await client.get("/api/rooms/nonexistent")
        assert response.status_code == 404

    async def test_update_room(self, client):
        create_resp = await client.post("/api/rooms", json={"name": "Old"})
        room_id = create_resp.json()["id"]

        response = await client.put(f"/api/rooms/{room_id}", json={"name": "New"})
        assert response.status_code == 200
        assert response.json()["name"] == "New"

    async def test_update_room_not_found(self, client):
        response = await client.put("/api/rooms/nonexistent", json={"name": "X"})
        assert response.status_code == 404

    async def test_delete_room(self, client):
        create_resp = await client.post("/api/rooms", json={"name": "Del"})
        room_id = create_resp.json()["id"]

        response = await client.delete(f"/api/rooms/{room_id}")
        assert response.status_code == 204

        get_resp = await client.get(f"/api/rooms/{room_id}")
        assert get_resp.status_code == 404

    async def test_delete_room_not_found(self, client):
        response = await client.delete("/api/rooms/nonexistent")
        assert response.status_code == 404


class TestRoomAgentsAPI:
    async def test_add_agent_to_room(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]
        agent_id = await _create_agent(client)

        response = await client.post(f"/api/rooms/{room_id}/agents", json={
            "agent_id": agent_id,
        })
        assert response.status_code == 201
        assert len(response.json()["agents"]) == 1

    async def test_add_multiple_agents(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]
        a1 = await _create_agent(client, "A1")
        a2 = await _create_agent(client, "A2")

        await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": a1})
        response = await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": a2})
        assert len(response.json()["agents"]) == 2

    async def test_add_duplicate_agent(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]
        agent_id = await _create_agent(client)

        await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": agent_id})
        response = await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": agent_id})
        assert response.status_code == 400

    async def test_remove_agent_from_room(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]
        agent_id = await _create_agent(client)

        await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": agent_id})
        response = await client.delete(f"/api/rooms/{room_id}/agents/{agent_id}")
        assert response.status_code == 200
        assert len(response.json()["agents"]) == 0

    async def test_remove_nonexistent_agent(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]

        response = await client.delete(f"/api/rooms/{room_id}/agents/nonexistent")
        assert response.status_code == 404

    async def test_reorder_agents(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]
        a1 = await _create_agent(client, "A1")
        a2 = await _create_agent(client, "A2")
        a3 = await _create_agent(client, "A3")

        await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": a1})
        await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": a2})
        await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": a3})

        response = await client.put(f"/api/rooms/{room_id}/agents/reorder", json={
            "agent_ids": [a3, a1, a2],
        })
        assert response.status_code == 200
        agents = response.json()["agents"]
        order_map = {a["agent_id"]: a["turn_order"] for a in agents}
        assert order_map[a3] == 0
        assert order_map[a1] == 1
        assert order_map[a2] == 2

    async def test_reorder_invalid_agents(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Room"})
        room_id = room_resp.json()["id"]

        response = await client.put(f"/api/rooms/{room_id}/agents/reorder", json={
            "agent_ids": ["fake-id"],
        })
        assert response.status_code == 400


class TestRoomCreateMissingField:
    async def test_create_room_missing_name(self, client):
        response = await client.post("/api/rooms", json={})
        assert response.status_code == 422
