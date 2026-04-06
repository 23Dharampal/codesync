import { useEffect, useRef, useCallback } from "react";

const WS_BASE = "ws://localhost:8000";

export interface WSUser {
  name: string;
  color: string;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface ChatMessage {
  user: WSUser;
  message: string;
  timestamp: string;
}

export type WSEvent =
  | { type: "user_joined"; user: WSUser; users: WSUser[] }
  | { type: "user_left"; user: WSUser; users: WSUser[] }
  | { type: "cursor_move"; user: WSUser; position: CursorPosition }
  | { type: "code_change"; file_id: string; delta: string; user: string }
  | { type: "selection_change"; user: WSUser; selection: unknown; file_id: string }
  | { type: "chat_message"; user: WSUser; message: string; timestamp: string }
  | { type: "language_change"; language: string; user: string }
  | { type: "file_created"; file: unknown; user: string }
  | { type: "file_deleted"; file_id: string; user: string }
  | { type: "file_renamed"; file_id: string; name: string; user: string }
  | { type: "whiteboard_update"; elements: unknown[]; app_state: Record<string, unknown>; user: string };

interface UseWebSocketOptions {
  roomCode: string;
  displayName: string;
  cursorColor: string;
  onEvent: (event: WSEvent) => void;
  enabled?: boolean;
}

export function useWebSocket({
  roomCode,
  displayName,
  cursorColor,
  onEvent,
  enabled = true,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!enabled || !roomCode) return;

    const params = new URLSearchParams({
      display_name: displayName,
      cursor_color: cursorColor,
    });
    const url = `${WS_BASE}/ws/${roomCode}?${params}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as WSEvent;
        onEventRef.current(event);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [roomCode, displayName, cursorColor, enabled]);

  const sendCursorMove = useCallback((position: CursorPosition) => {
    send({ type: "cursor_move", position });
  }, [send]);

  const sendCodeChange = useCallback((fileId: string, delta: string) => {
    send({ type: "code_change", file_id: fileId, delta });
  }, [send]);

  const sendChatMessage = useCallback((message: string) => {
    send({ type: "chat_message", message, timestamp: new Date().toISOString() });
  }, [send]);

  const sendLanguageChange = useCallback((language: string) => {
    send({ type: "language_change", language });
  }, [send]);

  const sendFileCreated = useCallback((file: unknown) => {
    send({ type: "file_created", file });
  }, [send]);

  const sendFileDeleted = useCallback((fileId: string) => {
    send({ type: "file_deleted", file_id: fileId });
  }, [send]);

  const sendFileRenamed = useCallback((fileId: string, name: string) => {
    send({ type: "file_renamed", file_id: fileId, name });
  }, [send]);

  const sendWhiteboardUpdate = useCallback(
    (elements: unknown[], appState: Record<string, unknown>) => {
      send({ type: "whiteboard_update", elements, app_state: appState });
    },
    [send],
  );

  return {
    sendCursorMove,
    sendCodeChange,
    sendChatMessage,
    sendLanguageChange,
    sendFileCreated,
    sendFileDeleted,
    sendFileRenamed,
    sendWhiteboardUpdate,
  };
}
