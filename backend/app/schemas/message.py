from pydantic import BaseModel
from datetime import datetime


class MessageCreate(BaseModel):
    sender_name: str
    content: str


class MessageResponse(BaseModel):
    id: str
    room_id: str
    sender_name: str
    sender_type: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
