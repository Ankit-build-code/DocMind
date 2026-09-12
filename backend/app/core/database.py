from typing import AsyncGenerator
from urllib.parse import urlparse, unquote

import asyncpg
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings

settings = get_settings()


def _parse_db_url() -> dict:
    """Parse DATABASE_URL and decode any percent-encoded characters."""
    parsed = urlparse(settings.DATABASE_URL)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path.lstrip("/"),
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
    }


def _make_engine() -> AsyncEngine:
    db = _parse_db_url()

    # Use asyncpg DSN with re-encoded safe password
    # asyncpg accepts password separately via connect_args when using creator
    async def creator():
        return await asyncpg.connect(
            host=db["host"],
            port=db["port"],
            database=db["database"],
            user=db["user"],
            password=db["password"],
        )

    # SQLAlchemy needs a valid URL for dialect detection only
    url = f"postgresql+asyncpg://{db['host']}:{db['port']}/{db['database']}"

    return create_async_engine(
        url,
        async_creator=creator,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )


engine = _make_engine()
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
