from pydantic import BaseModel
from datetime import datetime


class AgentCreate(BaseModel):
    name: str
    system_prompt: str
    model: str


class AgentUpdate(BaseModel):
    name: str | None = None
    system_prompt: str | None = None
    model: str | None = None


class AgentResponse(BaseModel):
    id: str
    name: str
    system_prompt: str
    model: str
    created_at: datetime

    model_config = {"from_attributes": True}
