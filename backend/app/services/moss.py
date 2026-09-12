"""
Moss retrieval service — uses the official Moss Python SDK.
SDK docs: https://service.usemoss.dev/v1

Each uploaded document gets its own named index (doc_{doc_id}).
Search queries across the user's document indexes using MossClient.query().
"""
import time
from typing import Optional

from moss import MossClient, DocumentInfo, QueryOptions

from app.core.config import get_settings

settings = get_settings()

CHUNK_SIZE = 500   # characters per chunk
CHUNK_OVERLAP = 0.2  # 20% overlap between chunks
MOSS_MODEL = "moss-minilm"


def _chunk_text(text: str, size: int = CHUNK_SIZE) -> list[str]:
    """Split text into overlapping chunks for better retrieval coverage."""
    words = text.split()
    chunks, current = [], []
    char_count = 0
    for word in words:
        current.append(word)
        char_count += len(word) + 1
        if char_count >= size:
            chunks.append(" ".join(current))
            overlap = max(1, int(len(current) * CHUNK_OVERLAP))
            current = current[-overlap:]
            char_count = sum(len(w) + 1 for w in current)
    if current:
        chunks.append(" ".join(current))
    return chunks


def _index_name(doc_id: str) -> str:
    """Stable index name for a document."""
    return f"doc-{doc_id}"


class MossService:
    """
    Wraps MossClient for DocMind's document Q&A use-case.

    - ingest(): chunk a document and create a named Moss index
    - search(): query across one or more indexes, returns cited chunks + latency
    - delete(): drop a document's index from Moss
    """

    def _client(self) -> MossClient:
        return MossClient(
            project_id=settings.MOSS_PROJECT_ID,
            project_key=settings.MOSS_PROJECT_KEY,
        )

    async def ingest(
        self, doc_id: str, text: str, metadata: dict
    ) -> tuple[str, int]:
        """
        Chunk document text and upload to Moss as a named index.
        Returns (index_name, chunk_count).
        """
        if not text.strip():
            raise ValueError("Document text is empty — nothing to ingest into Moss.")

        chunks = _chunk_text(text)
        docs = [
            DocumentInfo(id=f"{doc_id}_{i}", text=chunk)
            for i, chunk in enumerate(chunks)
        ]

        index_name = _index_name(doc_id)
        client = self._client()
        await client.create_index(index_name, docs, model_id=MOSS_MODEL)

        return index_name, len(chunks)

    async def search(
        self,
        query: str,
        index_ids: Optional[list[str]],  # these are index_names returned by ingest()
        top_k: int = 5,
    ) -> tuple[list[dict], int]:
        """
        Search Moss indexes for relevant chunks.
        Returns (results, latency_ms).

        Each result dict has: document_id, filename, chunk_text, score.
        """
        if not index_ids:
            return [], 0

        client = self._client()
        options = QueryOptions(top_k=top_k, alpha=0.8)

        t0 = time.monotonic()

        # Load each index in-process then query
        # Moss runs sub-10ms after load
        results: list[dict] = []
        for index_name in index_ids:
            try:
                await client.load_index(index_name)
                resp = await client.query(index_name, query, options)
                for doc in resp.docs:
                    # index_name format: "doc-{doc_id}"
                    raw_doc_id = index_name.removeprefix("doc-")
                    results.append({
                        "document_id": raw_doc_id,
                        "filename": doc.metadata.get("filename", "unknown") if doc.metadata else "unknown",
                        "chunk_text": doc.text,
                        "score": doc.score if hasattr(doc, "score") else 1.0,
                    })
            except Exception:
                # Skip indexes that fail to load (deleted / not yet synced)
                continue

        latency_ms = int((time.monotonic() - t0) * 1000)

        # Sort by score descending, return top_k overall
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k], latency_ms

    async def delete(self, index_name: str) -> None:
        """Remove a document's Moss index."""
        client = self._client()
        try:
            await client.delete_index(index_name)
        except Exception:
            # Index may already be gone — not a fatal error
            pass
