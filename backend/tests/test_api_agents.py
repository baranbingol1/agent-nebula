"""Integration tests for the agents API endpoints."""

import pytest


class TestAgentsAPI:
    async def test_create_agent(self, client):
        response = await client.post("/api/agents", json={
            "name": "TestBot",
            "system_prompt": "Be helpful",
            "model": "litellm/openai/gpt-5.2",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "TestBot"
        assert data["system_prompt"] == "Be helpful"
        assert data["model"] == "litellm/openai/gpt-5.2"
        assert "id" in data
        assert "created_at" in data

    async def test_list_agents(self, client):
        await client.post("/api/agents", json={
            "name": "Bot1", "system_prompt": "p", "model": "m"
        })
        await client.post("/api/agents", json={
            "name": "Bot2", "system_prompt": "p", "model": "m"
        })

        response = await client.get("/api/agents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    async def test_get_agent(self, client):
        create_resp = await client.post("/api/agents", json={
            "name": "Bot", "system_prompt": "p", "model": "m"
        })
        agent_id = create_resp.json()["id"]

        response = await client.get(f"/api/agents/{agent_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "Bot"

    async def test_get_agent_not_found(self, client):
        response = await client.get("/api/agents/nonexistent")
        assert response.status_code == 404

    async def test_update_agent(self, client):
        create_resp = await client.post("/api/agents", json={
            "name": "Old", "system_prompt": "p", "model": "m"
        })
        agent_id = create_resp.json()["id"]

        response = await client.put(f"/api/agents/{agent_id}", json={
            "name": "New",
        })
        assert response.status_code == 200
        assert response.json()["name"] == "New"

    async def test_update_agent_not_found(self, client):
        response = await client.put("/api/agents/nonexistent", json={"name": "X"})
        assert response.status_code == 404

    async def test_delete_agent(self, client):
        create_resp = await client.post("/api/agents", json={
            "name": "ToDelete", "system_prompt": "p", "model": "m"
        })
        agent_id = create_resp.json()["id"]

        response = await client.delete(f"/api/agents/{agent_id}")
        assert response.status_code == 204

        get_resp = await client.get(f"/api/agents/{agent_id}")
        assert get_resp.status_code == 404

    async def test_delete_agent_not_found(self, client):
        response = await client.delete("/api/agents/nonexistent")
        assert response.status_code == 404

    async def test_create_agent_missing_field(self, client):
        response = await client.post("/api/agents", json={
            "name": "Bot", "system_prompt": "p"
        })
        assert response.status_code == 422

    async def test_create_agent_empty_body(self, client):
        response = await client.post("/api/agents", json={})
        assert response.status_code == 422

    async def test_update_agent_preserves_unchanged(self, client):
        create_resp = await client.post("/api/agents", json={
            "name": "Bot", "system_prompt": "prompt", "model": "model123"
        })
        agent_id = create_resp.json()["id"]

        await client.put(f"/api/agents/{agent_id}", json={"name": "NewName"})
        get_resp = await client.get(f"/api/agents/{agent_id}")
        data = get_resp.json()
        assert data["name"] == "NewName"
        assert data["system_prompt"] == "prompt"
        assert data["model"] == "model123"
