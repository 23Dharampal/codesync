from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.room import Room
from app.models.file import File
from app.schemas.file import FileCreate, FileUpdate, FileResponse

router = APIRouter()


async def get_room_or_404(code: str, db: AsyncSession) -> Room:
    room = (await db.execute(select(Room).where(Room.code == code))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.get("/{code}/files", response_model=list[FileResponse])
async def list_files(code: str, db: AsyncSession = Depends(get_db)):
    room = await get_room_or_404(code, db)
    files = (await db.execute(select(File).where(File.room_id == room.id))).scalars().all()
    return files


@router.post("/{code}/files", response_model=FileResponse, status_code=201)
async def create_file(code: str, body: FileCreate, db: AsyncSession = Depends(get_db)):
    room = await get_room_or_404(code, db)
    file = File(room_id=room.id, name=body.name, content=body.content)
    db.add(file)
    await db.commit()
    await db.refresh(file)
    return file


@router.patch("/{code}/files/{file_id}", response_model=FileResponse)
async def update_file(code: str, file_id: str, body: FileUpdate, db: AsyncSession = Depends(get_db)):
    room = await get_room_or_404(code, db)
    file = (await db.execute(select(File).where(File.id == file_id, File.room_id == room.id))).scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if body.name is not None:
        file.name = body.name
    if body.content is not None:
        file.content = body.content

    await db.commit()
    await db.refresh(file)
    return file


@router.delete("/{code}/files/{file_id}", status_code=204)
async def delete_file(code: str, file_id: str, db: AsyncSession = Depends(get_db)):
    room = await get_room_or_404(code, db)
    file = (await db.execute(select(File).where(File.id == file_id, File.room_id == room.id))).scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    await db.delete(file)
    await db.commit()
