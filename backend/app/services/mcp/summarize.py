"""
MCP Tool: Summarize Document
One-click "Summarize this doc" action.
"""
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.services.mcp.base import MCPTool, register_tool

settings = get_settings()


class SummarizeTool(MCPTool):
    name = "summarize_document"
    description = (
        "Produces a concise summary of a document given its text content. "
        "Use this when the user asks to summarize a document."
    )

    def _parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "document_text": {
                    "type": "string",
                    "description": "The full text of the document to summarize.",
                },
                "max_words": {
                    "type": "integer",
                    "description": "Target word count for the summary (default 150).",
                    "default": 150,
                },
            },
            "required": ["document_text"],
        }

    async def run(self, document_text: str, max_words: int = 150, **_) -> str:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"Summarize the following document in {max_words} words or fewer. "
                               "Be concise and highlight the key points.",
                },
                {"role": "user", "content": document_text[:8000]},  # token guard
            ],
            temperature=0.3,
            max_tokens=400,
        )
        return response.choices[0].message.content or ""


# Auto-register on import
register_tool(SummarizeTool())
