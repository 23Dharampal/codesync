# CodeSync — Feature Reference

## Table of Contents
- [Room Management](#room-management)
- [Real-time Code Editor](#real-time-code-editor)
- [Live Cursors](#live-cursors)
- [File Explorer](#file-explorer)
- [Whiteboard](#whiteboard)
- [AI Co-Pilot](#ai-co-pilot)
- [Code Runner](#code-runner)
- [Voice Call](#voice-call)
- [Chat](#chat)
- [Session Summary](#session-summary)
- [Settings Panel](#settings-panel)
- [WebSocket Event Reference](#websocket-event-reference)
- [Known Limitations & Future Work](#known-limitations--future-work)

---

## Room Management

**Create a Room**
- Click "Create room" on the landing page
- Enter room name (optional) and your display name
- Pick a cursor color from 6 options
- Backend generates a unique 6-character room code
- Share the code with collaborators

**Join a Room**
- Click "Join room" and enter the room code
- Enter your display name and pick a cursor color
- Instantly dropped into the shared editor

**End a Session**
- Click "Leave" in the top bar → "End & summarize"
- AI generates a bullet-point summary of what was built
- Shows duration and list of files modified
- Room is marked inactive in the database

---

## Real-time Code Editor

- **Monaco Editor** — same engine as VS Code
- Syntax highlighting for 20+ languages
- Line numbers, minimap, current line highlight
- All edits broadcast to every user in real time via WebSocket
- Code auto-saved to database every 1 second (debounced)
- Switching files loads the correct content instantly
- File content syncs correctly after delete, rename, or remote change

**Supported Languages (syntax highlighting + run)**

| Language | Syntax | Run |
|---|---|---|
| Python | ✓ | ✓ |
| JavaScript | ✓ | ✓ |
| TypeScript | ✓ | ✓ |
| Java | ✓ | ✓ |
| C | ✓ | ✓ |
| C++ | ✓ | ✓ |
| Go | ✓ | ✓ |
| Rust | ✓ | ✓ |
| Ruby | ✓ | ✓ |
| PHP | ✓ | ✓ |
| Bash | ✓ | ✓ |
| Swift | ✓ | ✓ |
| Kotlin | ✓ | ✓ |
| Scala | ✓ | ✓ |
| R | ✓ | ✓ |
| Perl | ✓ | ✓ |
| Lua | ✓ | ✓ |
| Haskell | ✓ | ✓ |
| Elixir | ✓ | ✓ |
| Erlang | ✓ | ✓ |

---

## Live Cursors

- Every user's cursor position is broadcast over WebSocket on every move
- Each user gets a **colored vertical bar** at their exact cursor position
- A **badge with 2-letter initials** floats above the cursor bar (Excel/Google Docs style)
- Badge color matches the cursor color chosen at join time
- When a user leaves, their cursor and badge disappear immediately
- Cursors stay in sync when scrolling
- All users shown as avatar circles in the top bar

---

## File Explorer

Powered by **react-arborist** — a VS Code-style interactive tree.

- Left panel lists all files in the room
- Click a file to open it in the editor
- **`+` button** in the header to create a new file
- **Folder upload button** (↑ icon) — opens a native folder picker, uploads all text files from the selected directory at once
- Files sync instantly to all users via WebSocket

**Right-click context menu (on any file):**

| Action | Shortcut |
|---|---|
| Rename | Right-click → Rename, or press **F2** |
| Duplicate | Right-click → Duplicate |
| Delete | Right-click → Delete, or press **Del** |

**Inline rename:**
- Click Rename from context menu or press F2
- Edits in-place inside the file row
- **Enter** confirms, **Escape** cancels
- Rename is broadcast to all users via WebSocket

**File icons** change based on extension (`.py`, `.js`, `.ts`, `.md`, `.json`, test files)

**Panel is collapsible** to give more editor space

---

## Whiteboard

A shared **Excalidraw** canvas — one per room, real-time collaborative.

- Toggle between **Code** and **Whiteboard** views using the tab buttons in the editor header
- Both views are kept mounted in the background — switching tabs never loses your work
- All drawing changes are broadcast to every user in the room via WebSocket (debounced)
- Whiteboard state is **persisted to the database** every 2 seconds and loaded when any user opens the room
- Supports all Excalidraw drawing tools: shapes, arrows, text, freehand, images
- **Clear canvas** and **export to PNG/SVG** via the Excalidraw toolbar
- Background color is synced across users

**Use cases:**
- System architecture diagrams alongside code
- Algorithm sketches before writing the implementation
- Bug tracing / state flow diagrams
- Visual onboarding — "here's what I understand so far"

---

## AI Co-Pilot

**Auto Analysis**
- Automatically analyzes the active file every 3 seconds after you stop typing
- Powered by **Groq API** with `llama-3.3-70b-versatile`
- Returns structured feedback displayed in the right panel:
  - 🟡 **Warning** — potential bugs or risks
  - 🔴 **Error** — critical issues
  - 🔵 **Suggestion** — improvement ideas
  - ⚡ **Info** — general observations
- Each suggestion can show an optional code snippet
- **Apply** button to mark a suggestion as applied

**Ask AI**
- Text input at the bottom of the AI panel
- Ask the AI anything about your current code
- Response streams back word-by-word via SSE (Server-Sent Events)
- Press Enter or click Send
- Context-aware — includes current file content and language

**AI Status**
- Pulsing blue dot when AI is active
- Analysis triggers after 3 seconds of no typing

---

## Code Runner

- **Run button** (green, top-right of editor tab bar) executes the current file
- Powered by **Judge0 CE** — free public sandbox, no setup needed
- Output panel slides up from below the editor
- Shows:
  - `stdout` in white text
  - `stderr` in red text
  - Exit code badge (green = success, red = error)
  - Language name and version
- Output panel toggled via "Output" button in the status bar
- Supports all 20 languages listed above

---

## Voice Call

- **Join voice** button in the bottom bar
- Powered by **Livekit WebRTC** — encrypted peer-to-peer audio
- Browser requests microphone permission on first join
- Speaking users highlighted with green pulsing indicator
- Muted users shown with red mic icon
- **Mute/unmute** button toggles your microphone
- **Red phone** button leaves the call
- If browser blocks autoplay, a yellow banner appears — click it to unlock audio
- Multiple users can be in the call simultaneously

---

## Chat

- **Chat button** (message icon) in the top bar or bottom bar
- Slides in as a right panel (224px wide)
- Real-time messages via WebSocket — no page refresh needed
- Shows sender name in their cursor color
- Message count badge on the chat button
- Press Enter to send
- Closing the panel doesn't clear history

---

## Session Summary

Triggered when clicking **"End & summarize"** in the leave modal:
- AI reads all files in the room
- Generates 3–5 bullet points describing what was built
- Shows total session duration (minutes and seconds)
- Lists all files that were created or modified
- Displayed in the leave modal before redirecting home

---

## Settings Panel

Opens from the gear icon in the top bar:
- Room code (read-only)
- Your display name (read-only)
- Current language
- AI suggestions status

---

## WebSocket Event Reference

All real-time events flow through `ws://localhost:8000/ws/:roomCode`

| Event | Sender | Description |
|---|---|---|
| `user_joined` | Server | New user connected, includes updated user list |
| `user_left` | Server | User disconnected, includes updated user list |
| `cursor_move` | Client → Server → Others | Cursor position `{ line, column }` |
| `code_change` | Client → Server → Others | Full file content for a file ID |
| `selection_change` | Client → Server → Others | Selected text range |
| `chat_message` | Client → Server → Others | Chat message with timestamp |
| `language_change` | Client → Server → Others | Room language updated |
| `file_created` | Client → Server → Others | New file object |
| `file_deleted` | Client → Server → Others | Deleted file ID |
| `file_renamed` | Client → Server → Others | File ID and new name |
| `whiteboard_update` | Client → Server → Others | Excalidraw elements + appState snapshot |

---

## Known Limitations & Future Work

| Area | Current | Planned |
|---|---|---|
| Code sync | Full content on every change | Yjs CRDT for conflict-free merging |
| Auth | None — room code is the only access control | GitHub OAuth |
| Voice | Livekit Cloud required | Self-hosted Livekit option |
| AI questions | Personal (only you see the answer) | Shared AI chat for the whole room |
| AI autocomplete | Not implemented | Inline ghost-text suggestions (Copilot style) |
| Whiteboard sync | Last-write-wins via WebSocket | Yjs CRDT for conflict-free drawing |
| Folder tree | Flat file list only | Nested folders with drag-and-drop |
| Deploy | Local only | Docker Compose + Railway/Vercel |
