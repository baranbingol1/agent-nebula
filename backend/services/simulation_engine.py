import asyncio
import json
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from agents import Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel

from database import async_session
from models.room import Room
from models.room_agent import RoomAgent
from models.message import Message

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list] = {}

    async def connect(self, room_id: str, websocket):
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket):
        if room_id in self.rooms:
            self.rooms[room_id] = [ws for ws in self.rooms[room_id] if ws != websocket]

    async def broadcast(self, room_id: str, data: dict):
        if room_id not in self.rooms:
            return
        dead = []
        for ws in self.rooms[room_id]:
            try:
                await ws.send_text(json.dumps(data, default=str))
            except Exception as e:
                logger.warning(f"Failed to broadcast to {room_id}: {e}")
                dead.append(ws)
        for ws in dead:
            self.disconnect(room_id, ws)


ws_manager = ConnectionManager()


class SimulationRunner:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.pause_event = asyncio.Event()
        self.pause_event.set()
        self.inject_queue: asyncio.Queue = asyncio.Queue()
        self.stopped = False
        self.task: asyncio.Task | None = None

    async def run(self):
        try:
            async with async_session() as db:
                room = await self._load_room(db)
                if not room:
                    return

                room.status = "running"
                await db.commit()
                await ws_manager.broadcast(self.room_id, {
                    "type": "status", "status": "running",
                    "current_turn_index": room.current_turn_index,
                    "max_turns": room.max_turns,
                })

                room_agents = sorted(room.agents, key=lambda ra: ra.turn_order)
                if not room_agents:
                    room.status = "idle"
                    await db.commit()
                    return

                while not self.stopped and room.current_turn_index < room.max_turns:
                    await self.pause_event.wait()
                    if self.stopped:
                        break

                    # Check for injected user messages
                    while not self.inject_queue.empty():
                        try:
                            inject_content = self.inject_queue.get_nowait()
                            msg = Message(
                                room_id=self.room_id,
                                agent_id=None,
                                role="user",
                                content=inject_content,
                                turn_number=room.current_turn_index,
                            )
                            db.add(msg)
                            await db.commit()
                            await db.refresh(msg)
                            await ws_manager.broadcast(self.room_id, {
                                "type": "message",
                                "message": {
                                    "id": msg.id,
                                    "room_id": msg.room_id,
                                    "agent_id": None,
                                    "role": "user",
                                    "content": inject_content,
                                    "turn_number": msg.turn_number,
                                    "created_at": msg.created_at.isoformat(),
                                    "agent_name": "User",
                                },
                            })
                        except asyncio.QueueEmpty:
                            break

                    current_ra = room_agents[room.current_turn_index % len(room_agents)]
                    agent_model = current_ra.agent

                    # Broadcast typing indicator
                    await ws_manager.broadcast(self.room_id, {
                        "type": "typing",
                        "agent_id": agent_model.id,
                        "agent_name": agent_model.name,
                    })

                    # Build conversation history from this agent's perspective
                    history = await self._build_history(db, agent_model.id, agent_model.name)

                    # Call the LLM
                    try:
                        response_text = await self._call_llm(agent_model, history)
                    except Exception as e:
                        logger.error(f"LLM call failed for agent {agent_model.name}: {e}")
                        response_text = f"[Error: {str(e)[:200]}]"

                    # Save message
                    msg = Message(
                        room_id=self.room_id,
                        agent_id=agent_model.id,
                        role="assistant",
                        content=response_text,
                        turn_number=room.current_turn_index,
                    )
                    db.add(msg)
                    room.current_turn_index += 1
                    await db.commit()
                    await db.refresh(msg)

                    # Broadcast message
                    await ws_manager.broadcast(self.room_id, {
                        "type": "message",
                        "message": {
                            "id": msg.id,
                            "room_id": msg.room_id,
                            "agent_id": msg.agent_id,
                            "role": "assistant",
                            "content": response_text,
                            "turn_number": msg.turn_number,
                            "created_at": msg.created_at.isoformat(),
                            "agent_name": agent_model.name,
                        },
                    })

                    await ws_manager.broadcast(self.room_id, {
                        "type": "status", "status": "running",
                        "current_turn_index": room.current_turn_index,
                        "max_turns": room.max_turns,
                    })

                    # Delay between turns
                    await asyncio.sleep(1)

                # Simulation ended
                room.status = "stopped" if self.stopped else "idle"
                await db.commit()
                await ws_manager.broadcast(self.room_id, {
                    "type": "status", "status": room.status,
                    "current_turn_index": room.current_turn_index,
                    "max_turns": room.max_turns,
                })
        except asyncio.CancelledError:
            async with async_session() as db:
                room = await db.get(Room, self.room_id)
                if room:
                    room.status = "stopped"
                    await db.commit()
            await ws_manager.broadcast(self.room_id, {
                "type": "status", "status": "stopped",
                "current_turn_index": room.current_turn_index if room else 0,
                "max_turns": room.max_turns if room else 0,
            })
        except Exception as e:
            logger.exception(f"Simulation error for room {self.room_id}: {e}")
            async with async_session() as db:
                room = await db.get(Room, self.room_id)
                if room:
                    room.status = "idle"
                    await db.commit()
            await ws_manager.broadcast(self.room_id, {
                "type": "error", "error": str(e),
            })

    async def _load_room(self, db) -> Room | None:
        result = await db.execute(
            select(Room)
            .where(Room.id == self.room_id)
            .options(selectinload(Room.agents).selectinload(RoomAgent.agent))
        )
        return result.scalar_one_or_none()

    async def _build_history(self, db, current_agent_id: str, current_agent_name: str) -> list[dict]:
        result = await db.execute(
            select(Message)
            .where(Message.room_id == self.room_id)
            .options(selectinload(Message.agent))
            .order_by(Message.created_at.asc())
        )
        messages = result.scalars().all()

        history = []
        for msg in messages:
            if msg.agent_id == current_agent_id:
                history.append({"role": "assistant", "content": msg.content})
            else:
                name = msg.agent.name if msg.agent else "User"
                history.append({"role": "user", "content": f"[{name}]: {msg.content}"})
        return history

    async def _call_llm(self, agent_model, history: list[dict]) -> str:
        model_str = agent_model.model
        if model_str.startswith("litellm/"):
            model_str = model_str[len("litellm/"):]
        model = LitellmModel(model=model_str)
        ai_agent = Agent(
            name=agent_model.name,
            instructions=agent_model.system_prompt,
            model=model,
        )
        input_messages = history if history else [{"role": "user", "content": "Start the conversation. Introduce yourself and begin discussing."}]

        result = await Runner.run(
            ai_agent,
            input=input_messages,
            max_turns=1,
        )
        return result.final_output


class SimulationManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.simulations: dict[str, SimulationRunner] = {}
        return cls._instance

    async def start(self, room_id: str) -> bool:
        if room_id in self.simulations:
            runner = self.simulations[room_id]
            if runner.task and not runner.task.done():
                return False

        runner = SimulationRunner(room_id)
        self.simulations[room_id] = runner
        runner.task = asyncio.create_task(runner.run())
        return True

    async def pause(self, room_id: str) -> bool:
        runner = self.simulations.get(room_id)
        if not runner or not runner.task or runner.task.done():
            return False
        runner.pause_event.clear()
        async with async_session() as db:
            room = await db.get(Room, room_id)
            if room:
                room.status = "paused"
                await db.commit()
        await ws_manager.broadcast(room_id, {"type": "status", "status": "paused"})
        return True

    async def resume(self, room_id: str) -> bool:
        runner = self.simulations.get(room_id)
        if not runner or not runner.task or runner.task.done():
            return False
        runner.pause_event.set()
        async with async_session() as db:
            room = await db.get(Room, room_id)
            if room:
                room.status = "running"
                await db.commit()
        await ws_manager.broadcast(room_id, {"type": "status", "status": "running"})
        return True

    async def stop(self, room_id: str) -> bool:
        runner = self.simulations.get(room_id)
        if not runner:
            return False
        runner.stopped = True
        runner.pause_event.set()  # Unblock if paused
        if runner.task and not runner.task.done():
            runner.task.cancel()
            try:
                await runner.task
            except asyncio.CancelledError:
                pass
        del self.simulations[room_id]
        return True

    async def inject(self, room_id: str, content: str) -> bool:
        runner = self.simulations.get(room_id)
        if not runner or not runner.task or runner.task.done():
            return False
        await runner.inject_queue.put(content)
        return True

    def get_status(self, room_id: str) -> dict | None:
        runner = self.simulations.get(room_id)
        if not runner:
            return None
        return {
            "running": runner.task is not None and not runner.task.done(),
            "paused": not runner.pause_event.is_set(),
        }


simulation_manager = SimulationManager()
