from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.agent import Agent
from schemas.agent import AgentCreate, AgentUpdate


class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_agents(self) -> list[Agent]:
        result = await self.db.execute(select(Agent).order_by(Agent.created_at.desc()))
        return list(result.scalars().all())

    async def get_agent(self, agent_id: str) -> Agent | None:
        return await self.db.get(Agent, agent_id)

    async def create_agent(self, data: AgentCreate) -> Agent:
        agent = Agent(**data.model_dump())
        self.db.add(agent)
        await self.db.flush()
        await self.db.refresh(agent)
        return agent

    async def update_agent(self, agent_id: str, data: AgentUpdate) -> Agent | None:
        agent = await self.db.get(Agent, agent_id)
        if not agent:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(agent, key, value)
        await self.db.flush()
        await self.db.refresh(agent)
        return agent

    async def delete_agent(self, agent_id: str) -> bool:
        agent = await self.db.get(Agent, agent_id)
        if not agent:
            return False
        await self.db.delete(agent)
        await self.db.flush()
        return True
