"""Seed the database with demo agents and rooms via the HTTP API."""

import argparse
import json
import sys
import urllib.error
import urllib.request

DEFAULT_BASE_URL = "http://localhost:8484"

AGENTS = [
    {
        "name": "Socrates",
        "system_prompt": (
            "You are Socrates, the classical Greek philosopher. You teach through questioning - "
            "never give direct answers. Instead, ask probing questions that lead others to discover "
            "truth on their own. Use the Socratic method relentlessly. Be concise but profound."
        ),
        "model": "gpt-5-mini",
    },
    {
        "name": "Ada",
        "system_prompt": (
            "You are Ada, a sharp analytical thinker and systems architect. You approach every topic "
            "with rigorous logic, cite concrete examples, and break complex ideas into clear components. "
            "You value precision over poetry and always consider edge cases."
        ),
        "model": "gpt-5-mini",
    },
    {
        "name": "Luna",
        "system_prompt": (
            "You are Luna, a creative storyteller and lateral thinker. You see connections others miss, "
            "use vivid metaphors, and aren't afraid of unconventional ideas. You bring warmth and "
            "imagination to every conversation while keeping things grounded."
        ),
        "model": "gpt-5-mini",
    },
    {
        "name": "Rex",
        "system_prompt": (
            "You are Rex, a sharp-witted devil's advocate. You challenge every assumption, poke holes "
            "in weak arguments, and push others to defend their positions. You're not contrarian for its "
            "own sake - you genuinely believe stress-testing ideas makes them stronger. Be direct."
        ),
        "model": "gpt-5-mini",
    },
]

ROOMS = [
    {
        "name": "Philosophy Lab",
        "description": "A debate room where agents explore deep questions through rigorous dialogue.",
        "max_turns": 15,
        "agent_names": ["Socrates", "Ada", "Rex"],
    },
    {
        "name": "Creative Workshop",
        "description": "A collaborative space for brainstorming and creative problem-solving.",
        "max_turns": 10,
        "agent_names": ["Luna", "Ada"],
    },
]


def api(base_url, method, path, data=None):
    url = f"{base_url}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            if resp.status == 204:
                return None
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode() if e.fp else str(e)
        print(f"  ERROR {e.code}: {detail}")
        return None


def check_server(base_url):
    try:
        urllib.request.urlopen(f"{base_url}/api/agents", timeout=5)
        return True
    except Exception:
        return False


def seed(base_url):
    print(f"\nSeeding against {base_url}\n")

    if not check_server(base_url):
        print(f"ERROR: Cannot reach server at {base_url}")
        print("Make sure the backend is running: cd backend && uv run uvicorn main:app --port 8484")
        sys.exit(1)

    existing = api(base_url, "GET", "/api/agents") or []
    existing_names = {a["name"] for a in existing}

    agent_map = {}
    for agent_data in AGENTS:
        name = agent_data["name"]
        if name in existing_names:
            match = next(a for a in existing if a["name"] == name)
            agent_map[name] = match["id"]
            print(f"  SKIP  agent '{name}' (already exists)")
            continue
        result = api(base_url, "POST", "/api/agents", agent_data)
        if result:
            agent_map[name] = result["id"]
            print(f"  OK    agent '{name}' created")
        else:
            print(f"  FAIL  agent '{name}'")

    print()

    existing_rooms = api(base_url, "GET", "/api/rooms") or []
    existing_room_names = {r["name"] for r in existing_rooms}

    for room_def in ROOMS:
        room_data = {k: v for k, v in room_def.items() if k != "agent_names"}
        agent_names = room_def["agent_names"]
        name = room_data["name"]

        if name in existing_room_names:
            print(f"  SKIP  room '{name}' (already exists)")
            continue

        room = api(base_url, "POST", "/api/rooms", room_data)
        if not room:
            print(f"  FAIL  room '{name}'")
            continue
        print(f"  OK    room '{name}' created")

        room_id = room["id"]
        for agent_name in agent_names:
            agent_id = agent_map.get(agent_name)
            if not agent_id:
                print(f"  WARN  agent '{agent_name}' not found, skipping assignment")
                continue
            result = api(base_url, "POST", f"/api/rooms/{room_id}/agents", {"agent_id": agent_id})
            if result:
                print(f"        + assigned '{agent_name}'")
            else:
                print(f"        ! failed to assign '{agent_name}'")

    print("\nDone! Open http://localhost:3737 to start a simulation.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Agent Nebula with demo data")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help=f"Backend URL (default: {DEFAULT_BASE_URL})")
    args = parser.parse_args()
    seed(args.base_url)
