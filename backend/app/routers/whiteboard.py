import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.whiteboard import WhiteboardState
from app.schemas.whiteboard import WhiteboardResponse, WhiteboardSaveRequest

router = APIRouter()


@router.get("/{code}/whiteboard", response_model=WhiteboardResponse)
async def get_whiteboard(code: str, db: AsyncSession = Depends(get_db)):
    """Return the latest saved whiteboard state for a room."""
    result = await db.execute(
        select(WhiteboardState).where(WhiteboardState.room_code == code)
    )
    wb = result.scalar_one_or_none()
    if not wb:
        return WhiteboardResponse(elements=[], app_state={})
    return WhiteboardResponse(
        elements=json.loads(wb.elements),
        app_state=json.loads(wb.app_state),
    )


@router.put("/{code}/whiteboard", response_model=dict)
async def save_whiteboard(
    code: str,
    body: WhiteboardSaveRequest,
    db: AsyncSession = Depends(get_db),
):
    """Upsert whiteboard state for a room (called on debounced user edits)."""
    result = await db.execute(
        select(WhiteboardState).where(WhiteboardState.room_code == code)
    )
    wb = result.scalar_one_or_none()

    if wb:
        wb.elements = json.dumps(body.elements)
        wb.app_state = json.dumps(body.app_state)
    else:
        wb = WhiteboardState(
            room_code=code,
            elements=json.dumps(body.elements),
            app_state=json.dumps(body.app_state),
        )
        db.add(wb)

    await db.commit()
    return {"ok": True}
