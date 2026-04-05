from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(String, ForeignKey("rooms.id"), nullable=False)
    sender_name: Mapped[str] = mapped_column(String(50), nullable=False)
    # "user" or "ai"
    sender_type: Mapped[str] = mapped_column(String(10), nullable=False, default="user")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    room: Mapped["Room"] = relationship("Room", back_populates="messages")
