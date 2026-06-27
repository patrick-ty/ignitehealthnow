from typing import Literal

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatSource(BaseModel):
    source_uri: str
    source_type: str
    score: float


class ChatResponse(BaseModel):
    reply: str
    sources: list[ChatSource]
