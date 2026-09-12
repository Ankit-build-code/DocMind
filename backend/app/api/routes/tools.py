"""
MCP tool invocation API endpoint.
POST /tools/{tool_name}  →  runs the named tool with provided kwargs.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any

from app.core.auth import get_current_user
from app.models import User
from app.services.mcp import base as mcp_registry
# Import tools to trigger auto-registration
import app.services.mcp.summarize  # noqa: F401
import app.services.mcp.extract_tasks  # noqa: F401

router = APIRouter(prefix="/tools", tags=["mcp-tools"])


class ToolRequest(BaseModel):
    kwargs: dict[str, Any] = {}


class ToolResponse(BaseModel):
    tool: str
    result: str


@router.get("")
async def list_tools(_: User = Depends(get_current_user)):
    """List all available MCP tools and their schemas."""
    return [
        {"name": t.name, "description": t.description, "schema": t.to_openai_schema()}
        for t in mcp_registry.all_tools()
    ]


@router.post("/{tool_name}", response_model=ToolResponse)
async def invoke_tool(
    tool_name: str,
    body: ToolRequest,
    _: User = Depends(get_current_user),
):
    tool = mcp_registry.get_tool(tool_name)
    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")
    result = await tool.run(**body.kwargs)
    return ToolResponse(tool=tool_name, result=result)
