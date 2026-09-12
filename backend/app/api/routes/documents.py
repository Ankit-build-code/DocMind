import os
import re
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.config import get_settings
from app.models import User, Document
from app.schemas import DocumentOut
from app.services.moss import MossService
from app.services.parser import extract_text

router = APIRouter(prefix="/documents", tags=["documents"])
settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}


def _sanitize_filename(filename: str) -> str:
    """
    Strip path components and dangerous characters from filenames.
    Prevents path traversal (e.g. ../../etc/passwd).
    """
    # Keep only the base name, no directory parts
    name = os.path.basename(filename)
    # Replace anything that's not alphanumeric, dash, underscore, dot
    name = re.sub(r"[^\w\-.]", "_", name)
    # Prevent empty or dot-only names
    if not name or name.startswith("."):
        name = f"upload_{uuid.uuid4().hex[:8]}{os.path.splitext(filename)[1]}"
    return name


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.owner_id == current_user.id).order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Sanitize filename — prevent path traversal
    safe_name = _sanitize_filename(file.filename or "upload")
    ext = os.path.splitext(safe_name)[1].lower()

    # Validate extension
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Validate size
    contents = await file.read()
    size = len(contents)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    # Save to disk — each user gets their own subdirectory
    upload_dir = os.path.join(settings.UPLOAD_DIR, current_user.id)
    os.makedirs(upload_dir, exist_ok=True)
    # Prefix with UUID to avoid collisions on same filename
    file_path = os.path.join(upload_dir, f"{uuid.uuid4().hex}_{safe_name}")
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    # Extract text and ingest into Moss
    try:
        text = extract_text(file_path, safe_name)
    except (ValueError, RuntimeError) as e:
        # Clean up the saved file if parsing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=422, detail=f"Could not extract text: {e}")

    if not text.strip():
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=422, detail="Document appears to be empty or has no extractable text.")

    moss = MossService()
    try:
        moss_index_id, chunk_count = await moss.ingest(
            doc_id=None,
            text=text,
            metadata={"filename": safe_name, "user_id": current_user.id},
        )
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=502, detail=f"Moss ingestion failed: {e}")

    doc = Document(
        owner_id=current_user.id,
        filename=safe_name,
        file_path=file_path,
        size=size,
        chunk_count=chunk_count,
        moss_index_id=moss_index_id,
    )
    db.add(doc)
    await db.flush()
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove from Moss
    if doc.moss_index_id:
        moss = MossService()
        await moss.delete(doc.moss_index_id)

    # Remove file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    await db.delete(doc)
