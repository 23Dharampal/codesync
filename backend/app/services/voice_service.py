from app.config import settings


async def create_voice_token(room_code: str, display_name: str) -> tuple[str, str]:
    """Generate a Livekit access token for a participant."""
    if not settings.livekit_api_key or not settings.livekit_api_secret:
        raise RuntimeError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in .env")

    from livekit.api import AccessToken, VideoGrants

    grants = VideoGrants(room_join=True, room=room_code)
    token = (
        AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(display_name)
        .with_name(display_name)
        .with_grants(grants)
    )
    return token.to_jwt(), settings.livekit_url
