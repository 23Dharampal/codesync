from pydantic import BaseModel


class AIAnalyzeRequest(BaseModel):
    room_code: str = ""
    code: str
    language: str
    filename: str = ""


class AIAskRequest(BaseModel):
    room_code: str = ""
    question: str
    code_context: str = ""
    language: str = ""


class AISummarizeRequest(BaseModel):
    room_code: str
    files: list[dict]
    duration_seconds: int


class AIMessage(BaseModel):
    # "suggestion" | "warning" | "error" | "info"
    type: str
    message: str
    code_snippet: str | None = None
    line_number: int | None = None


class AIResponse(BaseModel):
    messages: list[AIMessage]


class AIAskResponse(BaseModel):
    answer: str
    code_snippet: str | None = None
