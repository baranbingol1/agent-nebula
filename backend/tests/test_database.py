"""Tests for database configuration and initialization."""

import pytest
from sqlalchemy import text

from database import Base


class TestDatabase:
    async def test_tables_created(self, db_session):
        result = await db_session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = {row[0] for row in result.fetchall()}
        assert "agents" in tables
        assert "rooms" in tables
        assert "room_agents" in tables
        assert "messages" in tables

    async def test_agents_columns(self, db_session):
        result = await db_session.execute(text("PRAGMA table_info(agents)"))
        columns = {row[1] for row in result.fetchall()}
        assert "id" in columns
        assert "name" in columns
        assert "system_prompt" in columns
        assert "model" in columns
        assert "created_at" in columns

    async def test_rooms_columns(self, db_session):
        result = await db_session.execute(text("PRAGMA table_info(rooms)"))
        columns = {row[1] for row in result.fetchall()}
        assert "id" in columns
        assert "name" in columns
        assert "description" in columns
        assert "status" in columns
        assert "current_turn_index" in columns
        assert "max_turns" in columns

    async def test_room_agents_columns(self, db_session):
        result = await db_session.execute(text("PRAGMA table_info(room_agents)"))
        columns = {row[1] for row in result.fetchall()}
        assert "id" in columns
        assert "room_id" in columns
        assert "agent_id" in columns
        assert "turn_order" in columns

    async def test_messages_columns(self, db_session):
        result = await db_session.execute(text("PRAGMA table_info(messages)"))
        columns = {row[1] for row in result.fetchall()}
        assert "id" in columns
        assert "room_id" in columns
        assert "agent_id" in columns
        assert "role" in columns
        assert "content" in columns
        assert "turn_number" in columns
