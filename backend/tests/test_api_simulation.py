"""Integration tests for the simulation API endpoints."""

import pytest


async def _create_room_with_agent(client):
    agent_resp = await client.post("/api/agents", json={
        "name": "Bot", "system_prompt": "Say hello", "model": "litellm/openai/gpt-5.2"
    })
    agent_id = agent_resp.json()["id"]

    room_resp = await client.post("/api/rooms", json={"name": "Room"})
    room_id = room_resp.json()["id"]

    await client.post(f"/api/rooms/{room_id}/agents", json={"agent_id": agent_id})
    return room_id, agent_id


class TestSimulationAPI:
    async def test_get_status(self, client):
        room_id, _ = await _create_room_with_agent(client)

        response = await client.get(f"/api/simulation/{room_id}/status")
        assert response.status_code == 200
        data = response.json()
        assert data["room_id"] == room_id
        assert data["status"] == "idle"
        assert data["current_turn_index"] == 0

    async def test_get_status_not_found(self, client):
        response = await client.get("/api/simulation/nonexistent/status")
        assert response.status_code == 404

    async def test_start_no_agents(self, client):
        room_resp = await client.post("/api/rooms", json={"name": "Empty"})
        room_id = room_resp.json()["id"]

        response = await client.post(f"/api/simulation/{room_id}/start")
        assert response.status_code == 400

    async def test_start_nonexistent_room(self, client):
        response = await client.post("/api/simulation/nonexistent/start")
        assert response.status_code == 404

    async def test_pause_not_running(self, client):
        response = await client.post("/api/simulation/nonexistent/pause")
        assert response.status_code == 400

    async def test_resume_not_running(self, client):
        response = await client.post("/api/simulation/nonexistent/resume")
        assert response.status_code == 400

    async def test_stop_not_running(self, client):
        response = await client.post("/api/simulation/nonexistent/stop")
        assert response.status_code == 400

    async def test_inject_not_running(self, client):
        response = await client.post("/api/simulation/nonexistent/inject", json={
            "content": "Hello"
        })
        assert response.status_code == 400

    async def test_inject_missing_content(self, client):
        room_id, _ = await _create_room_with_agent(client)
        response = await client.post(f"/api/simulation/{room_id}/inject", json={})
        assert response.status_code == 422


class TestHealthEndpoint:
    async def test_health(self, client):
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
