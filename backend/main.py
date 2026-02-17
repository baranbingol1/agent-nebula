from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from routers import (
    agents_router,
    rooms_router,
    simulation_router,
    messages_router,
    avatars_router,
    ws_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Agent Nebula", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3737"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents_router)
app.include_router(rooms_router)
app.include_router(simulation_router)
app.include_router(messages_router)
app.include_router(avatars_router)
app.include_router(ws_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
