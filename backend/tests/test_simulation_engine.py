"""Unit tests for ConnectionManager and SimulationManager."""

import json

from services.simulation_engine import ConnectionManager, SimulationManager


class FakeWebSocket:
    def __init__(self):
        self.sent: list[str] = []
        self.closed = False

    async def send_text(self, data: str):
        if self.closed:
            raise RuntimeError("WebSocket closed")
        self.sent.append(data)


class TestConnectionManager:
    async def test_connect_and_broadcast(self):
        mgr = ConnectionManager()
        ws = FakeWebSocket()

        await mgr.connect("room-1", ws)
        await mgr.broadcast("room-1", {"type": "status", "status": "running"})

        assert len(ws.sent) == 1
        parsed = json.loads(ws.sent[0])
        assert parsed["type"] == "status"
        assert parsed["status"] == "running"

    async def test_broadcast_multiple_clients(self):
        mgr = ConnectionManager()
        ws1 = FakeWebSocket()
        ws2 = FakeWebSocket()

        await mgr.connect("room-1", ws1)
        await mgr.connect("room-1", ws2)
        await mgr.broadcast("room-1", {"msg": "hello"})

        assert len(ws1.sent) == 1
        assert len(ws2.sent) == 1

    async def test_disconnect(self):
        mgr = ConnectionManager()
        ws = FakeWebSocket()

        await mgr.connect("room-1", ws)
        mgr.disconnect("room-1", ws)
        await mgr.broadcast("room-1", {"msg": "hello"})

        assert len(ws.sent) == 0

    async def test_broadcast_removes_dead_connections(self):
        mgr = ConnectionManager()
        good_ws = FakeWebSocket()
        bad_ws = FakeWebSocket()
        bad_ws.closed = True

        await mgr.connect("room-1", good_ws)
        await mgr.connect("room-1", bad_ws)
        await mgr.broadcast("room-1", {"msg": "test"})

        assert len(good_ws.sent) == 1
        assert bad_ws not in mgr.rooms.get("room-1", [])

    async def test_broadcast_nonexistent_room(self):
        mgr = ConnectionManager()
        await mgr.broadcast("no-room", {"msg": "test"})

    async def test_disconnect_nonexistent_room(self):
        mgr = ConnectionManager()
        ws = FakeWebSocket()
        mgr.disconnect("no-room", ws)

    async def test_multiple_rooms_isolation(self):
        mgr = ConnectionManager()
        ws1 = FakeWebSocket()
        ws2 = FakeWebSocket()

        await mgr.connect("room-1", ws1)
        await mgr.connect("room-2", ws2)

        await mgr.broadcast("room-1", {"for": "room-1"})

        assert len(ws1.sent) == 1
        assert len(ws2.sent) == 0


class TestSimulationManagerSingleton:
    def test_singleton(self):
        SimulationManager._instance = None
        m1 = SimulationManager()
        m2 = SimulationManager()
        assert m1 is m2
        SimulationManager._instance = None

    def test_get_status_nonexistent(self):
        SimulationManager._instance = None
        mgr = SimulationManager()
        assert mgr.get_status("nonexistent") is None
        SimulationManager._instance = None

    async def test_stop_nonexistent(self):
        SimulationManager._instance = None
        mgr = SimulationManager()
        result = await mgr.stop("nonexistent")
        assert result is False
        SimulationManager._instance = None

    async def test_pause_nonexistent(self):
        SimulationManager._instance = None
        mgr = SimulationManager()
        result = await mgr.pause("nonexistent")
        assert result is False
        SimulationManager._instance = None

    async def test_resume_nonexistent(self):
        SimulationManager._instance = None
        mgr = SimulationManager()
        result = await mgr.resume("nonexistent")
        assert result is False
        SimulationManager._instance = None

    async def test_inject_nonexistent(self):
        SimulationManager._instance = None
        mgr = SimulationManager()
        result = await mgr.inject("nonexistent", "message")
        assert result is False
        SimulationManager._instance = None
