# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
uv run uvicorn main:app --reload --port 8484   # Run dev server
uv run python -c "from main import app"         # Quick import check
```

## Architecture

FastAPI app with async SQLAlchemy + aiosqlite. Layered as:

- **models/**: SQLAlchemy ORM (Agent, Room, RoomAgent, Message). RoomAgent is a join table with `turn_order` and two unique constraints: `(room_id, agent_id)` and `(room_id, turn_order)`.
- **schemas/**: Pydantic v2 models with `from_attributes = True` for ORM conversion. RoomResponse nests RoomAgentInfo which nests AgentResponse.
- **services/**: Business logic. Each service takes `AsyncSession` in constructor. `SimulationManager` is a singleton — do not instantiate, use `simulation_manager` from `services.simulation_engine`.
- **routers/**: Thin HTTP handlers that delegate to services. All under `/api/` prefix except WebSocket at `/ws/{room_id}`.

## Simulation Engine

`services/simulation_engine.py` contains three classes:

1. **ConnectionManager** — tracks WebSocket connections per room, broadcasts JSON messages
2. **SimulationRunner** — one per active room, runs as `asyncio.Task`. The main loop: wait for pause_event → drain inject_queue → pick next agent (round-robin) → broadcast typing → build history → call LLM → save message → broadcast → sleep 1s
3. **SimulationManager** — singleton that manages SimulationRunners. Exposes start/pause/resume/stop/inject methods

The runner creates its own `async_session()` (not injected via FastAPI deps) since it runs as a background task outside request scope.

## LLM Integration

Uses `agents.Agent` + `agents.Runner` from `openai-agents` SDK with `LitellmModel` from `agents.extensions.models.litellm_model`. Model strings must follow `litellm/{provider}/{model}` format. `RunConfig(max_turns=1)` ensures one response per agent turn.

## Database

SQLite via aiosqlite. Tables auto-created on startup in `lifespan`. Config loads `.env` from the parent directory (root of repo). If `DATABASE_URL` starts with `sqlite:///`, it's auto-converted to `sqlite+aiosqlite:///` in `database.py`.
