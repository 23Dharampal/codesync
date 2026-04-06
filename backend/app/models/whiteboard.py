from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import uuid


class WhiteboardState(Base):
    __tablename__ = "whiteboard_states"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_code: Mapped[str] = mapped_column(String(8), unique=True, index=True, nullable=False)
    # JSON-encoded list of Excalidraw elements
    elements: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    # JSON-encoded Excalidraw appState subset (viewBackgroundColor, etc.)
    app_state: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
