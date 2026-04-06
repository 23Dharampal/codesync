import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from dataclasses import dataclass, field

ws_router = APIRouter()


@dataclass
class UserConnection:
    websocket: WebSocket
    display_name: str
    cursor_color: str
    room_code: str


class ConnectionManager:
    def __init__(self):
        # room_code -> list of UserConnection
        self.rooms: dict[str, list[UserConnection]] = {}

    def get_room(self, room_code: str) -> list[UserConnection]:
        return self.rooms.get(room_code, [])

    async def connect(self, websocket: WebSocket, room_code: str, display_name: str, cursor_color: str):
        await websocket.accept()
        conn = UserConnection(websocket, display_name, cursor_color, room_code)
        self.rooms.setdefault(room_code, []).append(conn)
        return conn

    def disconnect(self, conn: UserConnection):
        room = self.rooms.get(conn.room_code, [])
        if conn in room:
            room.remove(conn)
        if not room:
            self.rooms.pop(conn.room_code, None)

    async def broadcast(self, room_code: str, message: dict, exclude: WebSocket | None = None):
        data = json.dumps(message)
        for conn in self.get_room(room_code):
            if conn.websocket != exclude:
                try:
                    await conn.websocket.send_text(data)
                except Exception:
                    pass

    def users_in_room(self, room_code: str) -> list[dict]:
        return [
            {"name": c.display_name, "color": c.cursor_color}
            for c in self.get_room(room_code)
        ]


manager = ConnectionManager()


@ws_router.websocket("/ws/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    display_name: str = "Anonymous",
    cursor_color: str = "#7aa2f7",
):
    conn = await manager.connect(websocket, room_code, display_name, cursor_color)

    # notify everyone that a new user joined
    await manager.broadcast(room_code, {
        "type": "user_joined",
        "user": {"name": display_name, "color": cursor_color},
        "users": manager.users_in_room(room_code),
    })

    try:
        while True:
            raw = await websocket.receive_text()
            event = json.loads(raw)
            await handle_event(conn, event, room_code)
    except WebSocketDisconnect:
        manager.disconnect(conn)
        await manager.broadcast(room_code, {
            "type": "user_left",
            "user": {"name": display_name, "color": cursor_color},
            "users": manager.users_in_room(room_code),
        })


async def handle_event(conn: UserConnection, event: dict, room_code: str):
    event_type = event.get("type")

    if event_type == "cursor_move":
        # broadcast cursor position to everyone else
        await manager.broadcast(room_code, {
            "type": "cursor_move",
            "user": {"name": conn.display_name, "color": conn.cursor_color},
            "position": event.get("position"),
        }, exclude=conn.websocket)

    elif event_type == "code_change":
        # broadcast code delta to everyone else
        await manager.broadcast(room_code, {
            "type": "code_change",
            "file_id": event.get("file_id"),
            "delta": event.get("delta"),
            "user": conn.display_name,
        }, exclude=conn.websocket)

    elif event_type == "selection_change":
        await manager.broadcast(room_code, {
            "type": "selection_change",
            "user": {"name": conn.display_name, "color": conn.cursor_color},
            "selection": event.get("selection"),
            "file_id": event.get("file_id"),
        }, exclude=conn.websocket)

    elif event_type == "chat_message":
        # exclude sender — they already added it to local state
        await manager.broadcast(room_code, {
            "type": "chat_message",
            "user": {"name": conn.display_name, "color": conn.cursor_color},
            "message": event.get("message"),
            "timestamp": event.get("timestamp"),
        }, exclude=conn.websocket)

    elif event_type == "language_change":
        await manager.broadcast(room_code, {
            "type": "language_change",
            "language": event.get("language"),
            "user": conn.display_name,
        }, exclude=conn.websocket)

    elif event_type == "file_created":
        await manager.broadcast(room_code, {
            "type": "file_created",
            "file": event.get("file"),
            "user": conn.display_name,
        }, exclude=conn.websocket)

    elif event_type == "file_deleted":
        await manager.broadcast(room_code, {
            "type": "file_deleted",
            "file_id": event.get("file_id"),
            "user": conn.display_name,
        }, exclude=conn.websocket)

    elif event_type == "file_renamed":
        await manager.broadcast(room_code, {
            "type": "file_renamed",
            "file_id": event.get("file_id"),
            "name": event.get("name"),
            "user": conn.display_name,
        }, exclude=conn.websocket)

    elif event_type == "whiteboard_update":
        # Broadcast Excalidraw elements + appState to everyone else in the room
        await manager.broadcast(room_code, {
            "type": "whiteboard_update",
            "elements": event.get("elements", []),
            "app_state": event.get("app_state", {}),
            "user": conn.display_name,
        }, exclude=conn.websocket)
