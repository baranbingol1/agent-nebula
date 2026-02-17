from pydantic import BaseModel


class SimulationStatus(BaseModel):
    room_id: str
    status: str
    current_turn_index: int
    max_turns: int


class InjectMessage(BaseModel):
    content: str
