"""
Pydantic request / response schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: str
    is_active: bool

    model_config = {"from_attributes": True}


# ── Documents ────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    filename: str
    size: int
    chunk_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Query ─────────────────────────────────────────────────────────────────────

class CitationOut(BaseModel):
    document_id: str
    filename: str
    chunk_text: str
    score: float


class QueryRequest(BaseModel):
    question: str
    document_ids: Optional[list[str]] = None


class QueryResponse(BaseModel):
    answer: str
    citations: list[CitationOut]
    retrieval_ms: int


# ── Chat ──────────────────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    citations: Optional[list[CitationOut]] = None
    retrieval_ms: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    messages: list[MessageOut] = []

    model_config = {"from_attributes": True}
