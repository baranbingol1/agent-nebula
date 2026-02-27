# Agent Nebula

A multi-agent conversation simulator where AI agents debate, brainstorm, and collaborate in real time.

![Agent Nebula](assets/aislopimagecompressed.jpg)

## What is this?

Agent Nebula lets you create AI agents with distinct personalities and system prompts, assign them to conversation rooms, and watch them converse in round-robin order. You can pause, resume, stop, and inject your own messages into running simulations — all streamed live via WebSocket.

## Features

- **Agent Management** — Create agents with custom names, system prompts, and LLM models
- **Room System** — Organize agents into themed conversation rooms with configurable turn limits
- **Live Simulation** — Watch agents converse in real time with WebSocket streaming
- **Simulation Controls** — Pause, resume, stop, and inject messages mid-conversation
- **Drag-and-Drop Reordering** — Rearrange agent turn order within rooms
- **Markdown Rendering** — Agent messages render with full markdown support (code blocks, lists, headings)
- **Toast Notifications** — Visual feedback for all CRUD operations with loading states
- **WebSocket Reconnection** — Automatic reconnect with exponential backoff and disconnect banner
- **Multi-Provider LLM Support** — OpenAI and OpenRouter models via LiteLLM
- **Deterministic Avatars** — Unique identicon avatars generated from agent names

## Screenshots

<!-- Drop your screenshots into the assets/ folder and uncomment these lines -->
<!-- ![Rooms Page](assets/screenshot-rooms.png) -->
<!-- ![Agent Creation](assets/screenshot-agents.png) -->
<!-- ![Live Conversation](assets/screenshot-conversation.png) -->
<!-- ![Room Configuration](assets/screenshot-room-detail.png) -->

## Quick Start

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Node.js 22+
- [pnpm](https://pnpm.io/)
- An API key from [OpenAI](https://platform.openai.com/) or [OpenRouter](https://openrouter.ai/)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/agent-nebula.git
   cd agent-nebula
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API key(s):

   ```
   OPENAI_API_KEY=sk-your-key-here
   OPENROUTER_API_KEY=sk-or-your-key-here
   ```

3. **Start the backend**

   ```bash
   cd backend
   uv sync
   uv run uvicorn main:app --reload --port 8484
   ```

4. **Start the frontend** (new terminal)

   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

5. **Open the app** at [http://localhost:3737](http://localhost:3737)

### Seed Demo Data (optional)

With the backend running, populate the database with sample agents and rooms:

```bash
python scripts/seed.py
```

This creates 4 agents with distinct personalities and 2 pre-configured rooms so you can start a simulation immediately.

## Development

| Command | Description |
|---------|-------------|
| `cd backend && uv run uvicorn main:app --reload --port 8484` | Start backend dev server |
| `cd frontend && pnpm dev` | Start frontend dev server (port 3737) |
| `cd frontend && npx tsc --noEmit` | TypeScript type check |
| `cd frontend && pnpm lint` | ESLint |
| `cd frontend && pnpm test` | Run frontend tests (87 tests) |
| `cd backend && uv run pytest` | Run backend tests (130 tests) |
| `cd backend && uv run ruff check .` | Python linting |
| `cd frontend && pnpm build` | Production build |

For a detailed architecture overview, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Tech Stack

**Backend:** FastAPI, SQLAlchemy (async), aiosqlite, openai-agents SDK, LiteLLM

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, TanStack Query

**CI:** GitHub Actions (lint + typecheck + test + build)

## License

[GPL-3.0](LICENSE)
