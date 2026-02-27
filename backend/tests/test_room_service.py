"""Unit tests for RoomService CRUD and agent assignment operations."""


from schemas.agent import AgentCreate
from schemas.room import RoomCreate, RoomUpdate
from services.agent_service import AgentService
from services.room_service import RoomService


async def _create_agent(db_session, name="Bot"):
    service = AgentService(db_session)
    return await service.create_agent(AgentCreate(name=name, system_prompt="p", model="m"))


class TestRoomServiceCRUD:
    async def test_create_room(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Test Room"))

        assert room.id is not None
        assert room.name == "Test Room"
        assert room.status == "idle"
        assert room.max_turns == 20

    async def test_create_room_custom(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(
            RoomCreate(name="Custom", description="Desc", max_turns=50)
        )
        assert room.max_turns == 50
        assert room.description == "Desc"

    async def test_get_room(self, db_session):
        service = RoomService(db_session)
        created = await service.create_room(RoomCreate(name="Room"))
        fetched = await service.get_room(created.id)
        assert fetched is not None
        assert fetched.name == "Room"

    async def test_get_room_not_found(self, db_session):
        service = RoomService(db_session)
        result = await service.get_room("nonexistent")
        assert result is None

    async def test_list_rooms(self, db_session):
        service = RoomService(db_session)
        await service.create_room(RoomCreate(name="R1"))
        await service.create_room(RoomCreate(name="R2"))

        rooms = await service.list_rooms()
        assert len(rooms) >= 2

    async def test_update_room(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Old"))
        updated = await service.update_room(room.id, RoomUpdate(name="New"))

        assert updated is not None
        assert updated.name == "New"

    async def test_update_room_partial(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(
            RoomCreate(name="Room", description="Desc", max_turns=30)
        )
        updated = await service.update_room(room.id, RoomUpdate(max_turns=50))

        assert updated.name == "Room"
        assert updated.max_turns == 50

    async def test_update_room_not_found(self, db_session):
        service = RoomService(db_session)
        result = await service.update_room("bad-id", RoomUpdate(name="X"))
        assert result is None

    async def test_delete_room(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="ToDelete"))
        assert await service.delete_room(room.id) is True
        assert await service.get_room(room.id) is None

    async def test_delete_room_not_found(self, db_session):
        service = RoomService(db_session)
        assert await service.delete_room("nonexistent") is False


class TestRoomAgentAssignment:
    async def test_add_agent_to_room(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        agent = await _create_agent(db_session)

        result = await service.add_agent_to_room(room.id, agent.id)
        assert result is not None
        assert result.turn_order == 0

    async def test_add_multiple_agents_increments_order(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        a1 = await _create_agent(db_session, "Agent1")
        a2 = await _create_agent(db_session, "Agent2")
        a3 = await _create_agent(db_session, "Agent3")

        r1 = await service.add_agent_to_room(room.id, a1.id)
        r2 = await service.add_agent_to_room(room.id, a2.id)
        r3 = await service.add_agent_to_room(room.id, a3.id)

        assert r1.turn_order == 0
        assert r2.turn_order == 1
        assert r3.turn_order == 2

    async def test_add_duplicate_agent(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        agent = await _create_agent(db_session)

        first = await service.add_agent_to_room(room.id, agent.id)
        assert first is not None

        duplicate = await service.add_agent_to_room(room.id, agent.id)
        assert duplicate is None

    async def test_add_agent_invalid_room(self, db_session):
        service = RoomService(db_session)
        agent = await _create_agent(db_session)
        result = await service.add_agent_to_room("bad-room", agent.id)
        assert result is None

    async def test_add_agent_invalid_agent(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        result = await service.add_agent_to_room(room.id, "bad-agent")
        assert result is None

    async def test_remove_agent_from_room(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        agent = await _create_agent(db_session)

        await service.add_agent_to_room(room.id, agent.id)
        result = await service.remove_agent_from_room(room.id, agent.id)
        assert result is True

    async def test_remove_agent_reorders(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        a1 = await _create_agent(db_session, "A1")
        a2 = await _create_agent(db_session, "A2")
        a3 = await _create_agent(db_session, "A3")

        await service.add_agent_to_room(room.id, a1.id)
        await service.add_agent_to_room(room.id, a2.id)
        await service.add_agent_to_room(room.id, a3.id)

        await service.remove_agent_from_room(room.id, a1.id)

        fetched = await service.get_room(room.id)
        orders = [(ra.agent_id, ra.turn_order) for ra in fetched.agents]
        assert (a2.id, 0) in orders
        assert (a3.id, 1) in orders

    async def test_remove_nonexistent_agent(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        result = await service.remove_agent_from_room(room.id, "nonexistent")
        assert result is False

    async def test_reorder_agents(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        a1 = await _create_agent(db_session, "A1")
        a2 = await _create_agent(db_session, "A2")
        a3 = await _create_agent(db_session, "A3")

        await service.add_agent_to_room(room.id, a1.id)
        await service.add_agent_to_room(room.id, a2.id)
        await service.add_agent_to_room(room.id, a3.id)

        result = await service.reorder_agents(room.id, [a3.id, a1.id, a2.id])
        assert result is True

        fetched = await service.get_room(room.id)
        order_map = {ra.agent_id: ra.turn_order for ra in fetched.agents}
        assert order_map[a3.id] == 0
        assert order_map[a1.id] == 1
        assert order_map[a2.id] == 2

    async def test_reorder_agents_invalid_ids(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        agent = await _create_agent(db_session)
        await service.add_agent_to_room(room.id, agent.id)

        result = await service.reorder_agents(room.id, ["wrong-id"])
        assert result is False

    async def test_reorder_agents_missing_agent(self, db_session):
        service = RoomService(db_session)
        room = await service.create_room(RoomCreate(name="Room"))
        a1 = await _create_agent(db_session, "A1")
        a2 = await _create_agent(db_session, "A2")
        await service.add_agent_to_room(room.id, a1.id)
        await service.add_agent_to_room(room.id, a2.id)

        result = await service.reorder_agents(room.id, [a1.id])
        assert result is False
