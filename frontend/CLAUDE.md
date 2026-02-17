# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # Dev server on port 3737
npx tsc --noEmit    # Type check
pnpm build          # Production build (tsc + vite)
```

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS 4 (using `@tailwindcss/vite` plugin, not PostCSS).

### State Management (dual approach)

- **Zustand** (`stores/simulationStore.ts`): Real-time simulation state — messages, room status, typing indicators, turn progress. All keyed by `roomId`. Updated by the WebSocket hook.
- **@tanstack/react-query**: Server CRUD state — agent list, room list, room details. Mutations invalidate queries for automatic refresh.

### WebSocket

`hooks/useWebSocket.ts` connects to `ws://localhost:8484/ws/{roomId}`. Receives 4 message types: `message` (new chat message), `status` (simulation state change), `typing` (agent thinking), `error`. All dispatched to the Zustand store.

### API Layer

`api/client.ts` exports `apiFetch<T>()` — a typed fetch wrapper pointing at `http://localhost:8484`. Module files (`agents.ts`, `rooms.ts`, `simulation.ts`, `messages.ts`) export API objects used in react-query hooks.

### Routing

```
/           → redirect to /rooms
/agents     → Agent CRUD (AgentList → AgentCard + AgentForm)
/rooms      → Room listing (RoomList → RoomCard + RoomForm)
/rooms/:id  → Room setup with agent assignment
/rooms/:id/conversation → Live simulation (ConversationView)
```

### Styling

Dark space/nebula theme. Custom colors defined as CSS variables in `index.css` using Tailwind's `@theme` directive (e.g., `nebula-900`, `cosmic-purple`, `star-white`). Utility classes `.glow-purple`, `.glow-text`, `.bg-cosmic-card`, `.bg-cosmic-gradient` are in `index.css`. Typing animation uses custom `@keyframes bounce-dot`.

### Types

All TypeScript interfaces and the `MODELS` constant (available LLM models) live in `types/index.ts`. The `MODELS` array must stay in sync with what the backend supports.

### Avatars

`avatars/index.ts` mirrors `backend/avatars.py` — 28 emoji avatars. Both files must stay in sync.
