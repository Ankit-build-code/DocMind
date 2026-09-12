"""
LLM generation service using OpenAI (or compatible) API.
"""
from openai import AsyncOpenAI
from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are DocMind, an expert assistant that answers questions \
strictly based on the provided document excerpts. \
Always cite the document(s) you used. \
If the answer is not in the provided excerpts, say "I could not find relevant \
information in your documents." Do not hallucinate."""


class LLMService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate(self, question: str, context_chunks: list[dict]) -> str:
        """Generate a grounded, cited answer from retrieved chunks."""
        context_text = "\n\n".join(
            f"[{i+1}] From '{c['filename']}':\n{c['chunk_text']}"
            for i, c in enumerate(context_chunks)
        )
        user_message = f"""Context:\n{context_text}\n\nQuestion: {question}"""

        response = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            max_tokens=1024,
        )
        return response.choices[0].message.content or ""
