from fastapi import APIRouter
from avatars import AVATARS

router = APIRouter(prefix="/api/avatars", tags=["avatars"])


@router.get("")
async def list_avatars():
    return AVATARS
