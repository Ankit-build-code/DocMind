"""
MCP Tool: Extract Action Items
One-click "Extract action items" from a document.
"""
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.services.mcp.base import MCPTool, register_tool

settings = get_settings()


class ExtractActionItemsTool(MCPTool):
    name = "extract_action_items"
    description = (
        "Extracts a bullet-point list of action items, tasks, or TODOs from a document. "
        "Use this when the user asks to extract tasks or action items."
    )

    def _parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "document_text": {
                    "type": "string",
                    "description": "The full text of the document to extract action items from.",
                },
                "assignee_filter": {
                    "type": "string",
                    "description": "Optional: Only return action items assigned to this person.",
                },
            },
            "required": ["document_text"],
        }

    async def run(self, document_text: str, assignee_filter: str | None = None, **_) -> str:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        system = (
            "Extract all action items, tasks, and TODOs from the document. "
            "Return a numbered list. Each item should include: task description, "
            "assignee (if mentioned), and deadline (if mentioned). "
            "If there are no action items, say 'No action items found.'"
        )
        if assignee_filter:
            system += f" Only include items assigned to: {assignee_filter}."

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": document_text[:8000]},
            ],
            temperature=0.1,
            max_tokens=600,
        )
        return response.choices[0].message.content or ""


# Auto-register on import
register_tool(ExtractActionItemsTool())
