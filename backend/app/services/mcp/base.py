"""
MCP (Model Context Protocol) Tool Layer
Exposes callable tools that the assistant can invoke mid-conversation.
"""
from abc import ABC, abstractmethod
from typing import Any


class MCPTool(ABC):
    name: str
    description: str

    @abstractmethod
    async def run(self, **kwargs: Any) -> str:
        """Execute the tool and return a string result."""
        ...

    def to_openai_schema(self) -> dict:
        """Return OpenAI function-calling schema for this tool."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self._parameters_schema(),
            },
        }

    def _parameters_schema(self) -> dict:
        return {"type": "object", "properties": {}, "required": []}


# Registry of all available tools
_registry: dict[str, MCPTool] = {}


def register_tool(tool: MCPTool) -> None:
    _registry[tool.name] = tool


def get_tool(name: str) -> MCPTool | None:
    return _registry.get(name)


def all_tools() -> list[MCPTool]:
    return list(_registry.values())
