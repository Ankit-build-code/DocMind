from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models import User, Document, ChatSession, Message
from app.schemas import QueryRequest, QueryResponse
from app.services.moss import MossService
from app.services.llm import LLMService

router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse)
async def query(
    body: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Guard: empty question
    if not body.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    # Guard: question too long (prevent token flooding)
    if len(body.question) > 2000:
        raise HTTPException(status_code=422, detail="Question must be under 2000 characters.")

    # Resolve which document Moss indices to search
    doc_filter_ids: list[str] | None = None
    if body.document_ids:
        result = await db.execute(
            select(Document).where(
                Document.id.in_(body.document_ids),
                Document.owner_id == current_user.id,  # RBAC: only user's own docs
            )
        )
        docs = result.scalars().all()
        doc_filter_ids = [d.moss_index_id for d in docs if d.moss_index_id]

    # Retrieve from Moss
    moss = MossService()
    retrieved, retrieval_ms = await moss.search(
        query=body.question,
        index_ids=doc_filter_ids,
        top_k=5,
    )

    if not retrieved:
        raise HTTPException(status_code=404, detail="No relevant content found in your documents.")

    # Generate answer via LLM
    llm = LLMService()
    answer = await llm.generate(question=body.question, context_chunks=retrieved)

    citations = [
        {
            "document_id": c["document_id"],
            "filename": c["filename"],
            "chunk_text": c["chunk_text"],
            "score": c["score"],
        }
        for c in retrieved
    ]

    # Persist to chat history (auto-create session per user per day for now)
    session_result = await db.execute(
        select(ChatSession)
        .where(ChatSession.owner_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(1)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        session = ChatSession(owner_id=current_user.id, title=body.question[:60])
        db.add(session)
        await db.flush()

    db.add(Message(session_id=session.id, role="user", content=body.question))
    db.add(
        Message(
            session_id=session.id,
            role="assistant",
            content=answer,
            citations=citations,
            retrieval_ms=retrieval_ms,
        )
    )

    return QueryResponse(answer=answer, citations=citations, retrieval_ms=retrieval_ms)
