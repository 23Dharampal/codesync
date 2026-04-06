from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import rooms, files, ai, voice, run
from app.websocket.manager import ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Pair Programming API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
app.include_router(files.router, prefix="/api/rooms", tags=["files"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(run.router, prefix="/api", tags=["run"])
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
