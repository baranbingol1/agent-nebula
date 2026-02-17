from pydantic import BaseModel
from datetime import datetime


class AgentCreate(BaseModel):
    name: str
    system_prompt: str
    model: str
    avatar_id: str = "robot"


class AgentUpdate(BaseModel):
    name: str | None = None
    system_prompt: str | None = None
    model: str | None = None
    avatar_id: str | None = None


class AgentResponse(BaseModel):
    id: str
    name: str
    system_prompt: str
    model: str
    avatar_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
