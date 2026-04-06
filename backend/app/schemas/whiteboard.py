from pydantic import BaseModel
from typing import Any


class WhiteboardResponse(BaseModel):
    elements: list[Any]
    app_state: dict[str, Any]


class WhiteboardSaveRequest(BaseModel):
    elements: list[Any]
    app_state: dict[str, Any] = {}
