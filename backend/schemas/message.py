from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: str
    room_id: str
    agent_id: str | None
    role: str
    content: str
    turn_number: int
    created_at: datetime
    agent_name: str | None = None

    model_config = {"from_attributes": True}
