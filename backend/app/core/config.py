from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

# .env is in DocMind/ (project root), one level above backend/
_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    # App
    APP_NAME: str = "DocMind"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://docmind:docmind@localhost:5432/docmind"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Moss
    MOSS_PROJECT_ID: str = ""
    MOSS_PROJECT_KEY: str = ""

    # LLM
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 20

    # Frontend (read at build time by Next.js, ignored by backend logic)
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",  # silently ignore any unknown vars in .env
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
