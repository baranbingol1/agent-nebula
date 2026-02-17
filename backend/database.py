from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from config import settings

DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL.startswith("sqlite:///"):
    DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///", 1)

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db():
    async with engine.begin() as conn:
        from models import agent, room, room_agent, message  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)

        # Migration: drop avatar_id column if it exists (no longer used)
        from sqlalchemy import text
        result = await conn.execute(text("PRAGMA table_info(agents)"))
        columns = [row[1] for row in result.fetchall()]
        if "avatar_id" in columns:
            await conn.execute(text("ALTER TABLE agents DROP COLUMN avatar_id"))
