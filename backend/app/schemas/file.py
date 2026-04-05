from pydantic import BaseModel
from datetime import datetime


class FileCreate(BaseModel):
    name: str
    content: str = ""


class FileUpdate(BaseModel):
    name: str | None = None
    content: str | None = None


class FileResponse(BaseModel):
    id: str
    room_id: str
    name: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
