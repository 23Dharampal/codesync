const BASE = "http://localhost:8000";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Room ────────────────────────────────────────────────
export interface Room {
  id: string;
  code: string;
  name: string;
  language: string;
  is_active: boolean;
  created_at: string;
}

export interface SessionSummary {
  duration_seconds: number;
  files_modified: string[];
  ai_summary: string;
}

export const createRoom = (name: string, display_name: string, cursor_color: string) =>
  req<Room>("POST", "/api/rooms", { name, display_name, cursor_color });

export const getRoom = (code: string) =>
  req<Room>("GET", `/api/rooms/${code}`);

export const updateRoom = (code: string, data: { name?: string; language?: string }) =>
  req<Room>("PATCH", `/api/rooms/${code}`, data);

export const endSession = (code: string) =>
  req<SessionSummary>("DELETE", `/api/rooms/${code}`);

// ── Files ───────────────────────────────────────────────
export interface RoomFile {
  id: string;
  room_id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const listFiles = (code: string) =>
  req<RoomFile[]>("GET", `/api/rooms/${code}/files`);

export const createFile = (code: string, name: string, content = "") =>
  req<RoomFile>("POST", `/api/rooms/${code}/files`, { name, content });

export const updateFile = (code: string, fileId: string, data: { name?: string; content?: string }) =>
  req<RoomFile>("PATCH", `/api/rooms/${code}/files/${fileId}`, data);

export const deleteFile = (code: string, fileId: string) =>
  req<void>("DELETE", `/api/rooms/${code}/files/${fileId}`);

// ── AI ──────────────────────────────────────────────────
export interface AIMessage {
  type: "suggestion" | "warning" | "error" | "info";
  message: string;
  code_snippet: string | null;
  line_number: number | null;
}

export const analyzeCode = (code: string, language: string, filename = "") =>
  req<{ messages: AIMessage[] }>("POST", "/api/ai/analyze", { code, language, filename });

/** Returns an async generator that yields text deltas from the SSE stream. */
export async function* askAIStream(
  question: string,
  code_context = "",
  language = "",
): AsyncGenerator<string> {
  const res = await fetch(`${BASE}/api/ai/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, code_context, language }),
  });
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.delta) yield parsed.delta;
      } catch {
        // ignore malformed lines
      }
    }
  }
}

// ── Voice ───────────────────────────────────────────────
export const getVoiceToken = (room_code: string, display_name: string) =>
  req<{ token: string; livekit_url: string }>("POST", "/api/voice/token", { room_code, display_name });
