import os
from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8484")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3737")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agent_nebula.db")


settings = Settings()
