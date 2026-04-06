import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.database import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate, SessionSummary
from app.services.ai_service import summarize_session

router = APIRouter()


def generate_room_code(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


@router.post("", response_model=RoomResponse, status_code=201)
async def create_room(body: RoomCreate, db: AsyncSession = Depends(get_db)):
    code = generate_room_code()
    # ensure uniqueness
    while (await db.execute(select(Room).where(Room.code == code))).scalar_one_or_none():
        code = generate_room_code()

    room = Room(name=body.name, code=code)
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room


@router.get("/{code}", response_model=RoomResponse)
async def get_room(code: str, db: AsyncSession = Depends(get_db)):
    room = (await db.execute(select(Room).where(Room.code == code))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.patch("/{code}", response_model=RoomResponse)
async def update_room(code: str, body: RoomUpdate, db: AsyncSession = Depends(get_db)):
    room = (await db.execute(select(Room).where(Room.code == code))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if body.name is not None:
        room.name = body.name
    if body.language is not None:
        room.language = body.language

    await db.commit()
    await db.refresh(room)
    return room


@router.delete("/{code}", response_model=SessionSummary)
async def end_session(code: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.sql import func
    from app.models.file import File

    room = (await db.execute(select(Room).where(Room.code == code))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    files = (await db.execute(select(File).where(File.room_id == room.id))).scalars().all()
    file_data = [{"name": f.name, "content": f.content} for f in files]

    from datetime import datetime
    now = datetime.now()  # local time — matches PostgreSQL func.now() on same machine
    created = room.created_at
    if created.tzinfo is not None:
        created = created.replace(tzinfo=None)
    duration = max(0, int((now - created).total_seconds()))

    try:
        ai_summary = await summarize_session(file_data, duration)
    except Exception as e:
        ai_summary = f"Summary unavailable: {e}"

    room.is_active = False
    room.ended_at = now
    await db.commit()

    return SessionSummary(
        duration_seconds=duration,
        files_modified=[f.name for f in files],
        ai_summary=ai_summary,
    )
