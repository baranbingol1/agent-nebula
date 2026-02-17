from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.message import MessageResponse
from services.message_service import MessageService

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/{room_id}", response_model=dict)
async def get_messages(
    room_id: str,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = MessageService(db)
    messages, total = await service.get_messages(room_id, limit, offset)
    return {
        "messages": [
            MessageResponse(
                id=m.id,
                room_id=m.room_id,
                agent_id=m.agent_id,
                role=m.role,
                content=m.content,
                turn_number=m.turn_number,
                created_at=m.created_at,
                agent_name=m.agent.name if m.agent else None,
            )
            for m in messages
        ],
        "total": total,
    }
