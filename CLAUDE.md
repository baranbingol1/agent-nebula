# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Nebula is a multi-agent conversation simulator. Users create AI agents (with name, system prompt, model), assign them to rooms, and watch them converse in round-robin order via WebSocket. Users can pause, resume, stop, and inject messages into running simulations.

## Development Commands

```bash
# Backend (FastAPI + SQLAlchemy async + SQLite)
cd backend && uv run uvicorn main:app --reload --port 8484

# Frontend (React 19 + Vite + Tailwind CSS 4)
cd frontend && pnpm dev          # Dev server on port 3737
cd frontend && npx tsc --noEmit  # Type check
cd frontend && pnpm build        # Production build
```

## Architecture

**Backend** (`backend/`): FastAPI with async SQLAlchemy (aiosqlite). Follows a models → schemas → services → routers layering pattern. All database operations are async via `AsyncSession`.

**Frontend** (`frontend/src/`): React 19 + TypeScript. Uses Zustand for real-time simulation state (messages, status, typing per room) and @tanstack/react-query for server CRUD state (agents, rooms). WebSocket delivers live updates.

**Simulation Engine** (`backend/services/simulation_engine.py`): The core of the app. `SimulationManager` (singleton) spawns one `SimulationRunner` asyncio.Task per room. The runner loops round-robin through agents, calling LLMs via the openai-agents SDK with `LitellmModel`. Pause/resume uses `asyncio.Event`, message injection uses `asyncio.Queue`. WebSocket broadcasts happen through a `ConnectionManager` that tracks connections per room.

**LLM calls**: Each agent turn creates an `Agent` (openai-agents SDK) with `LitellmModel(model=agent.model)` and calls `Runner.run()` with `max_turns=1`. Model strings follow `litellm/{provider}/{model}` format (e.g., `litellm/openai/gpt-4o`, `litellm/openrouter/anthropic/claude-sonnet-4-5-20250929`).

**Conversation history**: Built per-agent perspective — the current agent's messages appear as `assistant` role, all other agents' messages appear as `user` role prefixed with `[AgentName]: content`.

## Key Patterns

- Database session management: `get_db()` async generator handles commit/rollback automatically
- Room agent reordering uses temporary high turn_order values to avoid unique constraint violations
- The `ws_manager` singleton (in simulation_engine.py) is shared between the simulation loop and the WebSocket router
- Frontend API client is at `frontend/src/api/client.ts` — all API calls go through `apiFetch()` with base URL `http://localhost:8484`
- Avatar system: Deterministic identicons generated frontend-only from agent names (`frontend/src/lib/identicon.ts`). No backend avatar storage needed.

## Environment

API keys go in the root `.env` file: `OPENAI_API_KEY` for OpenAI models, `OPENROUTER_API_KEY` for OpenRouter models. The backend config (`backend/config.py`) loads from this file.
