from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomAgentAdd, RoomAgentReorder
from services.room_service import RoomService

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.get("", response_model=list[RoomResponse])
async def list_rooms(db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    return await service.list_rooms()


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    room = await service.get_room(room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    return room


@router.post("", response_model=RoomResponse, status_code=201)
async def create_room(data: RoomCreate, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    room = await service.create_room(data)
    return await service.get_room(room.id)


@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(room_id: str, data: RoomUpdate, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    room = await service.update_room(room_id, data)
    if not room:
        raise HTTPException(404, "Room not found")
    return await service.get_room(room.id)


@router.delete("/{room_id}", status_code=204)
async def delete_room(room_id: str, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    if not await service.delete_room(room_id):
        raise HTTPException(404, "Room not found")


@router.post("/{room_id}/agents", status_code=201)
async def add_agent_to_room(room_id: str, data: RoomAgentAdd, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    result = await service.add_agent_to_room(room_id, data.agent_id)
    if not result:
        raise HTTPException(400, "Could not add agent to room (not found or already assigned)")
    room = await service.get_room(room_id)
    return RoomResponse.model_validate(room)


@router.delete("/{room_id}/agents/{agent_id}")
async def remove_agent_from_room(room_id: str, agent_id: str, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    if not await service.remove_agent_from_room(room_id, agent_id):
        raise HTTPException(404, "Agent not in room")
    room = await service.get_room(room_id)
    return RoomResponse.model_validate(room)


@router.put("/{room_id}/agents/reorder", response_model=RoomResponse)
async def reorder_agents(room_id: str, data: RoomAgentReorder, db: AsyncSession = Depends(get_db)):
    service = RoomService(db)
    if not await service.reorder_agents(room_id, data.agent_ids):
        raise HTTPException(400, "Invalid agent list for reorder")
    room = await service.get_room(room_id)
    return RoomResponse.model_validate(room)
