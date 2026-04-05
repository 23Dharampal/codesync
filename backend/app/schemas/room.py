from pydantic import BaseModel
from datetime import datetime


class RoomCreate(BaseModel):
    name: str = "Untitled Room"
    display_name: str
    cursor_color: str = "#7aa2f7"


class RoomJoin(BaseModel):
    display_name: str
    cursor_color: str = "#ff9e64"


class RoomResponse(BaseModel):
    id: str
    code: str
    name: str
    language: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RoomUpdate(BaseModel):
    name: str | None = None
    language: str | None = None


class SessionSummary(BaseModel):
    duration_seconds: int
    files_modified: list[str]
    ai_summary: str
