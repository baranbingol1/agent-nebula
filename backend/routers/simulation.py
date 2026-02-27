from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.simulation import InjectMessage, SimulationStatus
from services.room_service import RoomService
from services.simulation_engine import simulation_manager

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


@router.post("/{room_id}/start")
async def start_simulation(room_id: str, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    room = await service.get_room(room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    if not room.agents:
        raise HTTPException(400, "Room has no agents assigned")
    started = await simulation_manager.start(room_id)
    if not started:
        raise HTTPException(400, "Simulation already running")
    return {"status": "started"}


@router.post("/{room_id}/pause")
async def pause_simulation(room_id: str):
    if not await simulation_manager.pause(room_id):
        raise HTTPException(400, "Cannot pause simulation")
    return {"status": "paused"}


@router.post("/{room_id}/resume")
async def resume_simulation(room_id: str):
    if not await simulation_manager.resume(room_id):
        raise HTTPException(400, "Cannot resume simulation")
    return {"status": "resumed"}


@router.post("/{room_id}/stop")
async def stop_simulation(room_id: str):
    if not await simulation_manager.stop(room_id):
        raise HTTPException(400, "Cannot stop simulation")
    return {"status": "stopped"}


@router.post("/{room_id}/inject")
async def inject_message(room_id: str, data: InjectMessage):
    if not await simulation_manager.inject(room_id, data.content):
        raise HTTPException(400, "Cannot inject message (simulation not running)")
    return {"status": "injected"}


@router.get("/{room_id}/status", response_model=SimulationStatus)
async def get_status(room_id: str, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    room = await service.get_room(room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    return SimulationStatus(
        room_id=room.id,
        status=room.status,
        current_turn_index=room.current_turn_index,
        max_turns=room.max_turns,
    )
