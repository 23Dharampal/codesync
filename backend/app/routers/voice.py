from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.voice_service import create_voice_token

router = APIRouter()


class VoiceTokenRequest(BaseModel):
    room_code: str
    display_name: str


class VoiceTokenResponse(BaseModel):
    token: str
    livekit_url: str


@router.post("/token", response_model=VoiceTokenResponse)
async def get_voice_token(body: VoiceTokenRequest):
    try:
        token, url = await create_voice_token(body.room_code, body.display_name)
        return VoiceTokenResponse(token=token, livekit_url=url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
