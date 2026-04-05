from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.ai import AIAnalyzeRequest, AIAskRequest, AIResponse, AIAskResponse
from app.services.ai_service import analyze_code, ask_ai_stream

router = APIRouter()


@router.post("/analyze", response_model=AIResponse)
async def analyze(body: AIAnalyzeRequest):
    messages = await analyze_code(body.code, body.language, body.filename)
    return AIResponse(messages=messages)


@router.post("/ask")
async def ask(body: AIAskRequest):
    """Streams the AI response as SSE."""
    return StreamingResponse(
        ask_ai_stream(body.question, body.code_context, body.language),
        media_type="text/event-stream",
    )
