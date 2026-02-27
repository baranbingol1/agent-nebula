from datetime import datetime

from pydantic import BaseModel

from schemas.agent import AgentResponse


class RoomCreate(BaseModel):
    name: str
    description: str = ""
    max_turns: int = 20


class RoomUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    max_turns: int | None = None


class RoomAgentInfo(BaseModel):
    agent_id: str
    turn_order: int
    agent: AgentResponse

    model_config = {"from_attributes": True}


class RoomResponse(BaseModel):
    id: str
    name: str
    description: str | None
    status: str
    current_turn_index: int
    max_turns: int
    created_at: datetime
    agents: list[RoomAgentInfo] = []

    model_config = {"from_attributes": True}


class RoomAgentAdd(BaseModel):
    agent_id: str


class RoomAgentReorder(BaseModel):
    agent_ids: list[str]
