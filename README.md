# CodeSync — Live Pair Programming with AI Co-Pilot

A real-time collaborative code editor with live cursors, shared whiteboard, voice calls, chat, and an AI co-pilot powered by Groq (Llama 3.3). Built with React + FastAPI.

---

## Documentation

| Document | Description |
|---|---|
| [docs/features.md](docs/features.md) | Detailed feature reference — all features, supported languages, WebSocket events, limitations |

---

## Features

- **Live code editing** — Monaco Editor (VS Code engine) shared across all users in real time
- **Live cursors** — colored cursor badges with initials (Excel/Google Docs style) per user
- **File explorer** — VS Code-style tree (react-arborist) with right-click context menu: rename, duplicate, delete; upload entire folders
- **Shared whiteboard** — Excalidraw canvas, one per room, real-time synced and persisted
- **Code runner** — execute code in 20 languages via Judge0 CE sandbox, see stdout/stderr inline
- **Voice call** — WebRTC audio via Livekit (mute/unmute, speaking indicator)
- **Chat** — real-time room chat via WebSocket
- **AI Co-Pilot** — auto-analyzes code every 3 seconds, flags bugs/suggestions/warnings; ask the AI anything about your code
- **Session summary** — AI generates a bullet-point summary of what was built when ending the session
- **Dark theme** — futuristic dark UI throughout

---

## Project Structure

```
├── frontend/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home.tsx             # Landing page — create/join room
│   │   │   └── room.tsx             # Main editor room
│   │   ├── components/
│   │   │   ├── file-tree/
│   │   │   │   └── FileTree.tsx     # react-arborist file explorer
│   │   │   ├── whiteboard/
│   │   │   │   └── WhiteboardPanel.tsx  # Excalidraw wrapper
│   │   │   └── ui/                  # Shadcn UI components
│   │   ├── hooks/
│   │   │   ├── use-websocket.ts     # WebSocket hook (cursors, code, chat, whiteboard)
│   │   │   ├── use-voice.ts         # Livekit voice call hook
│   │   │   └── use-whiteboard.ts    # Whiteboard state + WS sync + DB persistence
│   │   └── lib/
│   │       ├── api.ts               # HTTP client for all backend endpoints
│   │       └── utils.ts
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                         # Python FastAPI backend
│   ├── main.py                      # App entry point, CORS, router registration
│   ├── app/
│   │   ├── config.py                # Settings loaded from .env
│   │   ├── database.py              # SQLAlchemy async + PostgreSQL
│   │   ├── models/
│   │   │   ├── room.py              # rooms table
│   │   │   ├── file.py              # files table
│   │   │   ├── message.py           # messages table
│   │   │   └── whiteboard.py        # whiteboard_states table
│   │   ├── schemas/                 # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── rooms.py             # POST/GET/PATCH/DELETE /api/rooms
│   │   │   ├── files.py             # CRUD /api/rooms/:code/files
│   │   │   ├── ai.py                # POST /api/ai/analyze, /api/ai/ask (SSE)
│   │   │   ├── voice.py             # POST /api/voice/token
│   │   │   ├── run.py               # POST /api/run (Judge0 CE)
│   │   │   └── whiteboard.py        # GET/PUT /api/rooms/:code/whiteboard
│   │   ├── websocket/
│   │   │   └── manager.py           # WS /ws/:code — all real-time events
│   │   └── services/
│   │       ├── ai_service.py        # Groq API calls (analyze, ask, summarize)
│   │       └── voice_service.py     # Livekit token generation
│   ├── requirements.txt
│   ├── .env.example
│   └── test_groq.py                 # Quick test to verify Groq API key
│
├── docs/
│   └── features.md                  # Full feature reference
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS v4, Shadcn UI, Framer Motion |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| File Tree | react-arborist |
| Whiteboard | Excalidraw (`@excalidraw/excalidraw`) |
| Routing | Wouter |
| Real-time | WebSocket (native browser API) |
| Voice | Livekit WebRTC (`livekit-client`) |
| Backend | Python, FastAPI, Uvicorn |
| Database | PostgreSQL via SQLAlchemy async + asyncpg |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Code Execution | Judge0 CE (free public sandbox) |
| Voice backend | Livekit Cloud (token generation) |

---

## Prerequisites

- **Node.js** v18+
- **Python** 3.11+
- **PostgreSQL** running locally (or a hosted instance)
- **Groq API key** — free at [console.groq.com](https://console.groq.com)
- **Livekit account** — free at [cloud.livekit.io](https://cloud.livekit.io) (for voice)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/23Dharampal/codesync
cd codesync
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/pair_programming
GROQ_API_KEY=your_groq_api_key_here
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
CORS_ORIGIN=http://localhost:3000
```

Install dependencies and start:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

> The database tables are created automatically on first startup via `init_db()`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Getting API Keys

### Groq (AI Co-Pilot) — Free
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (no credit card needed)
3. Go to **API Keys** → **Create API Key**
4. Add to `.env` as `GROQ_API_KEY`

Test your key:
```bash
cd backend
python test_groq.py
```

### Livekit (Voice Calls) — Free tier
1. Go to [cloud.livekit.io](https://cloud.livekit.io)
2. Create an account and a new project
3. Go to **Settings → API Keys**
4. Create a new key — copy both the **API Key** and **API Secret** (secret shown once only)
5. Get the **WebSocket URL** from **Settings → Project** (`wss://your-project.livekit.cloud`)
6. Add all three to `.env`

---

## How It Works

### Creating a Room
1. Click **Create room** on the landing page
2. Enter your name and pick a cursor color
3. Backend creates a room with a unique 6-character code
4. Share the code with collaborators

### Joining a Room
1. Click **Join room**
2. Enter the room code, your name, and cursor color
3. You're dropped into the shared editor

### Real-time Sync
- All code changes are broadcast via WebSocket to every user instantly
- File content is also saved to the database every 1 second (debounced)
- Cursor positions are sent on every move and rendered as colored badges with initials
- Whiteboard changes broadcast in real time and saved to DB every 2 seconds

### File Explorer
- Right-click any file for a context menu: **Rename**, **Duplicate**, **Delete**
- Press **F2** to rename the selected file inline, **Del** to delete
- Click the folder icon (↑) in the Explorer header to upload an entire local folder — all files are created in the room and broadcast to other users

### Whiteboard
- Click the **Whiteboard** tab in the editor header to switch from code to the shared canvas
- Both views stay mounted — switching tabs never loses your drawing or code state
- Any user can draw; changes sync to everyone and persist in the database

### AI Co-Pilot
- Automatically analyzes the active file every 3 seconds after you stop typing
- Returns structured feedback: warnings (yellow), errors (red), suggestions (blue), info
- Use the **Ask AI** input to ask questions about your code — responses stream back via SSE

### Voice Call
- Click **Join voice** in the bottom bar
- Browser requests microphone permission
- You connect to the Livekit room via WebRTC
- Speaking users are highlighted in green; use the mute button to toggle your mic

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rooms` | Create a new room |
| `GET` | `/api/rooms/:code` | Get room details |
| `PATCH` | `/api/rooms/:code` | Update room name or language |
| `DELETE` | `/api/rooms/:code` | End session + get AI summary |
| `GET` | `/api/rooms/:code/files` | List all files in room |
| `POST` | `/api/rooms/:code/files` | Create a new file |
| `PATCH` | `/api/rooms/:code/files/:id` | Update file name or content |
| `DELETE` | `/api/rooms/:code/files/:id` | Delete a file |
| `GET` | `/api/rooms/:code/whiteboard` | Get saved whiteboard state |
| `PUT` | `/api/rooms/:code/whiteboard` | Save whiteboard state (upsert) |
| `POST` | `/api/ai/analyze` | Analyze code, get suggestions |
| `POST` | `/api/ai/ask` | Ask AI a question (SSE stream) |
| `POST` | `/api/voice/token` | Get Livekit JWT for voice call |
| `POST` | `/api/run` | Execute code via Judge0 CE |
| `WS` | `/ws/:code` | WebSocket for all real-time events |

### WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `user_joined` | Server → Client | User joined, updated user list |
| `user_left` | Server → Client | User left, updated user list |
| `cursor_move` | Both | Cursor position `{ line, column }` |
| `code_change` | Both | File content update `{ file_id, delta }` |
| `chat_message` | Both | Chat message `{ user, message, timestamp }` |
| `language_change` | Both | Language changed for room |
| `file_created` | Both | New file created |
| `file_deleted` | Both | File deleted |
| `file_renamed` | Both | File renamed |
| `whiteboard_update` | Both | Excalidraw elements + appState snapshot |

---

## Testing with Two Users Locally

1. Open `http://localhost:3000` in a normal browser tab → create a room
2. Open `http://localhost:3000` in an **incognito window** → join with the room code
3. Both users will see each other's cursors, code changes, whiteboard drawings, and chat in real time
4. Both must click **Join voice** in the bottom bar for audio to work

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `GROQ_API_KEY` | Yes | Groq API key for AI features |
| `LIVEKIT_API_KEY` | For voice | Livekit project API key |
| `LIVEKIT_API_SECRET` | For voice | Livekit project API secret |
| `LIVEKIT_URL` | For voice | Livekit WebSocket URL (`wss://...`) |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS (`http://localhost:3000`) |

---

## Known Limitations

- **No auth** — room codes are the only access control. Anyone with the code can join.
- **Code sync** — sends full file content on each change (no OT/CRDT). Works well for small files.
- **Whiteboard sync** — last-write-wins. For concurrent heavy drawing, Yjs CRDT would be more robust.
- **Flat file tree** — no nested folder support yet; all files are at the top level.
- **Voice** — requires Livekit Cloud or a self-hosted Livekit server.
