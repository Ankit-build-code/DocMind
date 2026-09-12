from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine, Base
from app.api.routes import auth, documents, query, chat, tools
import app.models  # noqa: F401 — registers all models with SQLAlchemy metadata

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (use Alembic migrations in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="DocMind API",
    description="Real-Time AI Knowledge Assistant — powered by Moss",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — adjust origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://doc-mind-f6nojnxp6-solo-b89a.vercel.app","https://doc-mind-topaz-psi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(query.router)
app.include_router(chat.router)
app.include_router(tools.router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
