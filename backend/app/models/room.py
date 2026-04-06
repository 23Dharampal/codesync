from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.database import Base
from datetime import datetime
import uuid


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(8), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False, default="Untitled Room")
    language: Mapped[str] = mapped_column(String(20), nullable=False, default="javascript")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    files: Mapped[list["File"]] = relationship("File", back_populates="room", cascade="all, delete-orphan")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="room", cascade="all, delete-orphan")
