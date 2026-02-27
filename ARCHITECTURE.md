```markdown
# Agent Nebula - Architecture Overview

## Overview

Agent Nebula is a multi-agent conversation simulator. Users create AI agents (with name, system prompt, model), assign them to rooms, and watch them converse in round-robin order via WebSocket. Users can pause, resume, stop, and inject messages into running simulations.

---

## Directory Structure

```text
agent-nebula/
├── .env                    # API keys (OPENAI_API_KEY, OPENROUTER_API_KEY)
├── CLAUDE.md               # Project coding guidelines
├── LICENSE
├── README.md
├── assets/                 # Static assets
├── backend/                # FastAPI + SQLAlchemy async + SQLite
│   ├── config.py           # Environment settings
│   ├── database.py         # Async SQLAlchemy setup
│   ├── main.py             # FastAPI entry point
│   ├── pyproject.toml      # Python deps (uv)
│   ├── models/             # ORM models (agent, room, message, room_agent)
│   ├── routers/            # API routes (agents, rooms, messages, simulation, ws)
│   ├── schemas/            # Pydantic schemas
│   └── services/           # Business logic & simulation engine
└── frontend/               # React 19 + Vite + Tailwind CSS 4
    ├── index.html
    ├── package.json        # Node deps (pnpm)
    ├── vite.config.ts
    └── src/
        ├── api/            # API client modules
        ├── components/     # React components (agents/, rooms/, conversation/)
        ├── hooks/          # useWebSocket.ts
        ├── lib/            # Utilities (identicon.ts)
        ├── pages/          # Page components
        ├── stores/         # Zustand stores
        └── types/          # TypeScript definitions
```

---

## Key Files by Layer

| Layer | Backend | Frontend |
| :--- | :--- | :--- |
| **Entry** | `main.py` | `src/main.tsx` → `App.tsx` |
| **Config** | `config.py`, `database.py` | `vite.config.ts`, `src/api/client.ts` |
| **Models** | `models/agent.py`, `room.py`, `message.py` | `src/types/index.ts` |
| **API** | `routers/*.py` | `src/api/*.ts` |
| **State** | `services/simulation_engine.py` | `src/stores/simulationStore.ts` |
| **Core** | `services/simulation_engine.py` (SimulationManager, SimulationRunner) | `src/hooks/useWebSocket.ts` |

---

## Backend Architecture

### Models (`backend/models/`)

| File | Purpose |
| :--- | :--- |
| `agent.py` | Agent entity (id, name, system_prompt, model, created_at) |
| `room.py` | Room entity (id, name, description, status, current_turn_index, max_turns) |
| `room_agent.py` | Junction table for room-agent assignments with turn_order |
| `message.py` | Message entity (room_id, agent_id, role, content, turn_number) |

### Schemas (`backend/schemas/`)

| File | Purpose |
| :--- | :--- |
| `agent.py` | Pydantic schemas for Agent CRUD |
| `room.py` | Pydantic schemas for Room CRUD |
| `message.py` | Pydantic schemas for Message operations |
| `simulation.py` | Schemas for simulation control (start/pause/resume/stop/inject) |

### Routers (`backend/routers/`)

| File | Purpose |
| :--- | :--- |
| `agents.py` | CRUD endpoints for agents |
| `rooms.py` | CRUD endpoints for rooms, agent assignment/reordering |
| `messages.py` | Endpoints for fetching room messages |
| `simulation.py` | Control endpoints (start, pause, resume, stop, inject) |
| `ws.py` | WebSocket endpoint for real-time updates |

### Services (`backend/services/`)

| File | Purpose |
| :--- | :--- |
| `simulation_engine.py` | **Core engine**: SimulationManager (singleton), SimulationRunner (asyncio.Task per room), ConnectionManager (WebSocket broadcasting), LLM calls via openai-agents SDK |
| `agent_service.py` | Agent business logic |
| `room_service.py` | Room business logic |
| `message_service.py` | Message business logic |

---

## Frontend Architecture

### API Layer (`frontend/src/api/`)

| File | Purpose |
| :--- | :--- |
| `client.ts` | `apiFetch()` wrapper, `wsUrl()` helper |
| `agents.ts` | Agent API calls |
| `rooms.ts` | Room API calls |
| `messages.ts` | Message API calls |
| `simulation.ts` | Simulation control API calls |

### State Management (`frontend/src/stores/`)

| File | Purpose |
| :--- | :--- |
| `simulationStore.ts` | Zustand store for real-time simulation state (messages, status, typing, turn info) per room |

### Pages (`frontend/src/pages/`)

| File | Purpose |
| :--- | :--- |
| `AgentsPage.tsx` | Agent management page |
| `RoomsPage.tsx` | Room list page |
| `RoomDetailPage.tsx` | Room configuration & agent assignment |
| `ConversationPage.tsx` | Live conversation view with controls |

### Components (`frontend/src/components/`)

| Directory | Components |
| :--- | :--- |
| `layout/` | `Layout.tsx`, `Header.tsx`, `Sidebar.tsx` — App shell |
| `agents/` | `AgentCard.tsx`, `AgentList.tsx`, `AgentForm.tsx`, `ModelSelect.tsx` |
| `rooms/` | `RoomCard.tsx`, `RoomList.tsx`, `RoomForm.tsx`, `AgentAssignment.tsx` |
| `conversation/` | `ConversationView.tsx`, `MessageList.tsx`, `MessageBubble.tsx`, `ControlBar.tsx`, `InjectMessageInput.tsx`, `TypingIndicator.tsx` |
| `shared/` | `Avatar.tsx` (identicon), `StatusBadge.tsx`, `EmptyState.tsx` |

---

## Architecture Patterns

### Backend
1. **Layered Architecture**: Models → Schemas → Services → Routers
2. **Async SQLAlchemy**: All DB operations use AsyncSession with aiosqlite
3. **Singleton Pattern**: SimulationManager and ConnectionManager are singletons
4. **Dependency Injection**: `get_db()` async generator for DB sessions
5. **WebSocket Broadcasting**: `ws_manager` broadcasts to all connections per room
6. **LLM Integration**: openai-agents SDK with LitellmModel for multi-provider support

### Frontend
1. **State Separation**: Zustand for real-time sim state, TanStack Query for server CRUD
2. **Component Organization**: Feature-based folders (agents/, rooms/, conversation/)
3. **API Abstraction**: Centralized `apiFetch()` with base URL configuration
4. **WebSocket Hook**: Custom `useWebSocket` for real-time message handling
5. **Avatar System**: Frontend-only deterministic identicons from agent names

---

## Key Relationships

### Backend Structure
- `main.py`
    - `config.py` (settings)
    - `database.py` (engine, get_db)
    - `models/*` (SQLAlchemy tables)
    - `schemas/*` (Pydantic models)
    - `services/simulation_engine.py` (core logic)
        - uses openai-agents SDK + LitellmModel
        - `ws_manager` (ConnectionManager singleton)
        - `simulation_manager` (SimulationManager singleton)
    - `routers/*`
        - use services for business logic
        - `ws.py` uses `ws_manager` for WebSocket

### Frontend Structure
- `frontend/src/main.tsx`
    - `App.tsx` (router)
        - `Layout` (shell)
        - `Pages` (Agents, Rooms, RoomDetail, Conversation)
    - `stores/simulationStore.ts` (Zustand)
    - `hooks/useWebSocket.ts` (WebSocket client)
    - `api/*` (fetch wrappers)

---

## Entry Points & Commands

| Component | File | Command |
| :--- | :--- | :--- |
| **Backend** | `backend/main.py` | `uv run uvicorn main:app --reload --port 8484` |
| **Frontend** | `frontend/src/main.tsx` | `pnpm dev` (port 3737) |
| **Type Check** | - | `npx tsc --noEmit` |
| **Build** | - | `pnpm build` |

---

## Environment Configuration

Root `.env` file:
- `OPENAI_API_KEY` — For OpenAI models
- `OPENROUTER_API_KEY` — For OpenRouter models
- `DATABASE_URL` — SQLite path (default: `sqlite+aiosqlite:///./agent_nebula.db`)
- `BACKEND_URL` / `FRONTEND_URL` — CORS origins
```