from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:Dharampal%401@localhost:5432/pair_programming"
    groq_api_key: str = ""
    livekit_api_key: str = ""
    livekit_api_secret: str = ""
    livekit_url: str = "ws://localhost:7880"
    cors_origin: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
