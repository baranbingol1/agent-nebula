from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.agent import AgentCreate, AgentResponse, AgentUpdate
from services.agent_service import AgentService

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("", response_model=list[AgentResponse])
async def list_agents(db: AsyncSession = Depends(get_db)):
    service = AgentService(db)
    return await service.list_agents()


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    service = AgentService(db)
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent


@router.post("", response_model=AgentResponse, status_code=201)
async def create_agent(data: AgentCreate, db: AsyncSession = Depends(get_db)):
    service = AgentService(db)
    return await service.create_agent(data)


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(agent_id: str, data: AgentUpdate, db: AsyncSession = Depends(get_db)):
    service = AgentService(db)
    agent = await service.update_agent(agent_id, data)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent


@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    service = AgentService(db)
    if not await service.delete_agent(agent_id):
        raise HTTPException(404, "Agent not found")
