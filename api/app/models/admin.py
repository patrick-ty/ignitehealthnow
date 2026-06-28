from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

Channel = Literal["instagram", "x", "linkedin", "facebook"]
Status = Literal["draft", "review", "scheduled", "published"]


class AdminMe(BaseModel):
    admin: bool
    email: str


class AdminContentPost(BaseModel):
    id: str
    channel: Channel
    caption: str
    hashtags: list[str]
    status: Status
    scheduled_for: Optional[datetime]
    source: Optional[str]
    ai: bool
    why_it_works: Optional[str]
    created_at: datetime
    updated_at: datetime


class AdminContentCreate(BaseModel):
    channel: Channel
    caption: str
    hashtags: list[str] = []
    source: Optional[str] = None
    why_it_works: Optional[str] = None
    status: Status = "draft"


class AdminContentUpdate(BaseModel):
    channel: Optional[Channel] = None
    caption: Optional[str] = None
    hashtags: Optional[list[str]] = None
    scheduled_for: Optional[datetime] = None
    source: Optional[str] = None
    why_it_works: Optional[str] = None


class AdminContentApprove(BaseModel):
    edited_caption: Optional[str] = None
    scheduled_for: Optional[datetime] = None
