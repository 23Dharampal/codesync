# CodeSync — Live Pair Programming with AI Co-Pilot

A real-time collaborative code editor with live cursors, voice calls, chat, and an AI co-pilot powered by Groq (Llama 3.3). Built with React + FastAPI.

---

## Documentation

| Document | Description |
|---|---|
| [docs/features.md](docs/features.md) | Detailed feature reference — all features, supported languages, WebSocket events, limitations |

---

## Features

- **Live code editing** — Monaco Editor (VS Code engine) shared across all users in real time
- **Live cursors** — colored cursor badges with initials (Excel/Google Docs style) per user
- **File tree** — create, rename, delete files per room; synced across users
- **Voice call** — WebRTC audio via Livekit (mute/unmute, speaking indicator)
- **Chat** — real-time room chat via WebSocket
- **AI Co-Pilot** — auto-analyzes code every 3 seconds, flags bugs/suggestions/warnings; ask the AI anything about your code
- **Session summary** — AI generates a bullet-point summary of what was built when ending the session
- **Dark theme** — futuristic dark UI throughout

---

## Project Structure

```
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home.tsx        # Landing page — create/join room
│   │   │   └── room.tsx        # Main editor room
│   │   ├── hooks/
│   │   │   ├── use-websocket.ts  # WebSocket hook (cursors, code, chat)
│   │   │   └── use-voice.ts      # Livekit voice call hook
│   │   ├── lib/
│   │   │   ├── api.ts          # HTTP client for all backend endpoints
│   │   │   └── utils.ts
│   │   └── components/ui/      # Shadcn UI components
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── app/
│   │   ├── config.py           # Settings loaded from .env
│   │   ├── database.py         # SQLAlchemy async + SQLite
│   │   ├── models/
│   │   │   ├── room.py         # Room table
│   │   │   ├── file.py         # File table
│   │   │   └── message.py      # Chat message table
│   │   ├── schemas/            # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── rooms.py        # POST/GET/PATCH/DELETE /api/rooms
│   │   │   ├── files.py        # CRUD /api/rooms/:code/files
│   │   │   ├── ai.py           # POST /api/ai/analyze, /api/ai/ask (SSE)
│   │   │   └── voice.py        # POST /api/voice/token
│   │   ├── websocket/
│   │   │   └── manager.py      # WS /ws/:code — cursors, code, chat, presence
│   │   └── services/
│   │       ├── ai_service.py   # Groq API calls (analyze, ask, summarize)
│   │       └── voice_service.py # Livekit token generation
│   ├── requirements.txt
│   ├── .env.example
│   └── test_groq.py            # Quick test to verify Groq API key
│
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS v4, Shadcn UI, Framer Motion |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Routing | Wouter |
| Real-time | WebSocket (native browser API) |
| Voice | Livekit WebRTC (`livekit-client`) |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite via SQLAlchemy async + aiosqlite |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Voice backend | Livekit Cloud (token generation) |

---

## Prerequisites

- **Node.js** v18+
- **Python** 3.11+
- **Groq API key** — free at [console.groq.com](https://console.groq.com)
- **Livekit account** — free at [cloud.livekit.io](https://cloud.livekit.io) (for voice)

---

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd Visual-Frontend-Display
```

### 2. Backend setup

```bash
cd backend

# Copy env file and fill in your keys
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=sqlite+aiosqlite:///./pair_programming.db
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
4. Create a new key — copy both the **API Key** and **API Secret** immediately (secret is only shown once)
5. Get the **WebSocket URL** from **Settings → Project** (format: `wss://your-project.livekit.cloud`)
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
- All code changes are broadcast via WebSocket to every user in the room instantly
- File content is also saved to the database every 1 second (debounced)
- Cursor positions are sent on every cursor move and rendered as colored badges with initials

### AI Co-Pilot
- Automatically analyzes the active file every 3 seconds after you stop typing
- Returns structured feedback: warnings (yellow), errors (red), suggestions (blue), info (gray)
- Use the **Ask AI** input at the bottom of the AI panel to ask questions about your code
- Responses stream back word-by-word via SSE

### Voice Call
- Click **Join voice** in the bottom bar
- Browser requests microphone permission
- You connect to the Livekit room via WebRTC
- Speaking users are highlighted in green
- Use the mute button to toggle your mic

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
| `POST` | `/api/ai/analyze` | Analyze code, get suggestions |
| `POST` | `/api/ai/ask` | Ask AI a question (SSE stream) |
| `POST` | `/api/voice/token` | Get Livekit JWT for voice call |
| `WS` | `/ws/:code` | WebSocket for real-time events |

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

---

## Testing with Two Users Locally

1. Open `http://localhost:3000` in a normal browser tab → create a room
2. Open `http://localhost:3000` in an **incognito window** → join with the room code
3. Both users will see each other's cursors, code changes, and chat in real time
4. Both must click **Join voice** in the bottom bar for audio to work

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLAlchemy DB URL. Defaults to SQLite |
| `GROQ_API_KEY` | Yes | Groq API key for AI features |
| `LIVEKIT_API_KEY` | For voice | Livekit project API key |
| `LIVEKIT_API_SECRET` | For voice | Livekit project API secret |
| `LIVEKIT_URL` | For voice | Livekit WebSocket URL (`wss://...`) |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS (`http://localhost:3000`) |

---

## Known Limitations

- **No auth** — room codes are the only access control. Anyone with the code can join.
- **SQLite** — fine for local/dev. Switch to PostgreSQL for production by changing `DATABASE_URL`.
- **Code sync** — sends full file content on each change (no OT/CRDT). Works well for small files; for large files consider adding Yjs.
- **Voice** — requires Livekit Cloud or a self-hosted Livekit server.
