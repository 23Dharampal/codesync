import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import {
  Mic, MicOff, PhoneOff, Settings, MessageSquare,
  ChevronRight, ChevronLeft, Plus, X, Send, AlertTriangle,
  Lightbulb, Zap, FileCode, FileText, FlaskConical, ChevronDown,
  LogOut, Phone, Play, Square, ChevronUp, ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import {
  getRoom, listFiles, createFile, deleteFile, updateFile, endSession,
  updateRoom, analyzeCode, askAIStream, runCode,
  type Room, type RoomFile, type AIMessage, type RunResult,
} from "@/lib/api";
import { useWebSocket, type WSUser, type WSEvent } from "@/hooks/use-websocket";
import { useVoice } from "@/hooks/use-voice";

const B      = "hsl(213 90% 60%)";
const BG     = "hsl(222 47% 5%)";
const EDGE   = "hsl(222 50% 4%)";
const SURF   = "hsl(220 40% 8%)";
const BAR    = "hsl(220 40% 7%)";
const BORDER = "hsl(220 30% 12%)";
const DIM    = "hsl(213 25% 38%)";
const TEXT   = "hsl(213 40% 85%)";

const LANGS = [
  "Python", "JavaScript", "TypeScript",
  "Java", "C", "C++",
  "Go", "Rust", "Ruby",
  "PHP", "Bash", "Swift",
  "Kotlin", "Scala", "R",
  "Perl", "Lua", "Haskell",
  "Elixir", "Erlang",
];

function langToMonaco(lang: string): string {
  const map: Record<string, string> = {
    python: "python",
    typescript: "typescript",
    javascript: "javascript",
    rust: "rust",
    go: "go",
    java: "java",
    "c++": "cpp",
    cpp: "cpp",
    c: "c",
    ruby: "ruby",
    php: "php",
    bash: "shell",
    swift: "swift",
    kotlin: "kotlin",
    scala: "scala",
    r: "r",
    perl: "perl",
    lua: "lua",
    haskell: "haskell",
    elixir: "elixir",
    erlang: "erlang",
  };
  return map[lang.toLowerCase()] ?? "plaintext";
}

function fileIcon(name: string) {
  if (name.endsWith(".md")) return FileText;
  if (name.endsWith(".json") || name.endsWith(".yaml") || name.endsWith(".yml")) return FileText;
  if (name.match(/test/i)) return FlaskConical;
  return FileCode;
}

function Avatar({ user, size = 26 }: { user: WSUser; size?: number }) {
  const short = user.name.slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center text-[10px] font-bold rounded-full select-none"
      title={user.name}
      style={{
        width: size, height: size,
        background: user.color + "28",
        border: `1.5px solid ${user.color}60`,
        color: user.color,
      }}
    >
      {short}
    </div>
  );
}

function aiIcon(type: AIMessage["type"]) {
  if (type === "warning") return { Icon: AlertTriangle, color: "hsl(38 85% 55%)" };
  if (type === "error")   return { Icon: AlertTriangle, color: "hsl(0 72% 55%)" };
  if (type === "suggestion") return { Icon: Lightbulb, color: B };
  return { Icon: Zap, color: "hsl(142 60% 45%)" };
}

export default function Room() {
  const params = useParams<{ code: string }>();
  const roomCode = params.code ?? "";
  const [, setLocation] = useLocation();

  const displayName = sessionStorage.getItem("displayName") || "Anonymous";
  const cursorColor = sessionStorage.getItem("cursorColor") || "#7aa2f7";

  // Room state
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Files
  const [files, setFiles] = useState<RoomFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const activeFile = files.find(f => f.id === activeFileId) ?? null;

  // Users
  const [users, setUsers] = useState<WSUser[]>([]);

  // Voice
  const voice = useVoice(roomCode, displayName);

  // Monaco editor ref + remote cursors
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  // flag to skip onChange when we apply a remote change
  const isRemoteChange = useRef(false);
  // identity → cursor data
  const remoteCursors = useRef<Map<string, { line: number; column: number; color: string; name: string }>>(new Map());
  // pixel positions for overlay badges (React state so they re-render)
  const [cursorOverlays, setCursorOverlays] = useState<{ id: string; x: number; y: number; color: string; initials: string }[]>([]);

  // UI state
  const [aiOpen, setAiOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(true);
  const [appliedAI, setAppliedAI] = useState<number[]>([]);

  // AI
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Code runner
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState<{ user: WSUser; message: string; timestamp: string }[]>([]);

  // Session summary
  const [summary, setSummary] = useState<{ duration_seconds: number; files_modified: string[]; ai_summary: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Load room + files on mount
  useEffect(() => {
    if (!roomCode) return;
    (async () => {
      try {
        const [r, f] = await Promise.all([getRoom(roomCode), listFiles(roomCode)]);
        setRoom(r);
        setFiles(f);
        if (f.length > 0) setActiveFileId(f[0].id);
      } catch {
        setLocation("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [roomCode]);

  // Compute pixel positions for all remote cursors and update overlay state
  const redrawCursors = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const overlays: { id: string; x: number; y: number; color: string; initials: string }[] = [];

    remoteCursors.current.forEach((pos, identity) => {
      const { line, column, color, name } = pos;
      // getScrolledVisiblePosition returns px coords relative to editor DOM node
      const px = editor.getScrolledVisiblePosition({ lineNumber: line, column });
      if (!px) return;
      overlays.push({
        id: identity,
        x: px.left,
        y: px.top,
        color,
        initials: name.slice(0, 2).toUpperCase(),
      });
    });

    setCursorOverlays(overlays);
  }, []);

  // WebSocket events
  const handleWSEvent = (event: WSEvent) => {
    if (event.type === "user_joined" || event.type === "user_left") {
      setUsers(event.users);
      if (event.type === "user_left") {
        remoteCursors.current.delete(event.user.name);
        redrawCursors();
      }
    } else if (event.type === "cursor_move") {
      const pos = event.position as { line: number; column: number };
      remoteCursors.current.set(event.user.name, {
        line: pos.line,
        column: pos.column,
        color: event.user.color,
        name: event.user.name,
      });
      redrawCursors();
    } else if (event.type === "chat_message") {
      setChatMessages(prev => [...prev, { user: event.user, message: event.message, timestamp: event.timestamp }]);
    } else if (event.type === "language_change") {
      setRoom(prev => prev ? { ...prev, language: event.language } : prev);
    } else if (event.type === "file_created") {
      setFiles(prev => [...prev, event.file as RoomFile]);
    } else if (event.type === "file_deleted") {
      setFiles(prev => prev.filter(f => f.id !== event.file_id));
    } else if (event.type === "file_renamed") {
      setFiles(prev => prev.map(f => f.id === event.file_id ? { ...f, name: event.name } : f));
    } else if (event.type === "code_change") {
      // update files state
      setFiles(prev => prev.map(f =>
        f.id === event.file_id ? { ...f, content: event.delta } : f
      ));
      // if this file is currently open in Monaco, push content directly
      if (activeFileRef.current?.id === event.file_id && editorRef.current) {
        const editor = editorRef.current;
        const currentValue = editor.getValue();
        if (currentValue !== event.delta) {
          isRemoteChange.current = true;
          // preserve cursor position
          const pos = editor.getPosition();
          editor.setValue(event.delta);
          if (pos) editor.setPosition(pos);
          isRemoteChange.current = false;
        }
      }
    }
  };

  const ws = useWebSocket({
    roomCode,
    displayName,
    cursorColor,
    onEvent: handleWSEvent,
    enabled: !loading,
  });

  // Analyze code when active file changes
  const analyzeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!activeFile || !room) return;
    if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);
    analyzeTimeout.current = setTimeout(async () => {
      try {
        const result = await analyzeCode(activeFile.content, room.language, activeFile.name);
        setAiMessages(result.messages);
      } catch {
        // silently ignore
      }
    }, 3000);
    return () => { if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current); };
  }, [activeFile?.content, room?.language]);

  const handleAddFile = async () => {
    const name = prompt("File name:");
    if (!name?.trim()) return;
    try {
      const file = await createFile(roomCode, name.trim());
      setFiles(prev => [...prev, file]);
      setActiveFileId(file.id);
      ws.sendFileCreated(file);
    } catch { /* ignore */ }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(roomCode, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (activeFileId === fileId) setActiveFileId(files.find(f => f.id !== fileId)?.id ?? null);
      ws.sendFileDeleted(fileId);
    } catch { /* ignore */ }
  };

  const codeChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeFileRef = useRef(activeFile);
  activeFileRef.current = activeFile;

  const handleCodeChange = useCallback((content: string) => {
    if (isRemoteChange.current) return; // skip — this was triggered by remote setValue
    const file = activeFileRef.current;
    if (!file) return;
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, content } : f));
    ws.sendCodeChange(file.id, content);
    if (codeChangeTimer.current) clearTimeout(codeChangeTimer.current);
    codeChangeTimer.current = setTimeout(() => {
      updateFile(roomCode, file.id, { content }).catch(() => {});
    }, 1000);
  }, [roomCode, ws]);

  const handleLangChange = async (lang: string) => {
    try {
      await updateRoom(roomCode, { language: lang });
      setRoom(prev => prev ? { ...prev, language: lang } : prev);
      ws.sendLanguageChange(lang);
      setLangOpen(false);
    } catch { /* ignore */ }
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    ws.sendChatMessage(chatMsg.trim());
    setChatMessages(prev => [...prev, {
      user: { name: displayName, color: cursorColor },
      message: chatMsg.trim(),
      timestamp: new Date().toISOString(),
    }]);
    setChatMsg("");
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      let answer = "";
      for await (const delta of askAIStream(aiQuestion, activeFile?.content ?? "", room?.language ?? "")) {
        answer += delta;
        setAiAnswer(answer);
      }
    } finally {
      setAiLoading(false);
      setAiQuestion("");
    }
  };

  const handleRun = async () => {
    if (!activeFile || !room) return;
    setRunning(true);
    setOutputOpen(true);
    setRunResult(null);
    try {
      const result = await runCode(activeFile.content, room.language, activeFile.name);
      setRunResult(result);
    } catch (e: unknown) {
      setRunResult({
        stdout: "",
        stderr: e instanceof Error ? e.message : "Failed to run code",
        exit_code: 1,
        language: room.language,
        version: "",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleEndSession = async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const s = await endSession(roomCode);
      setSummary(s);
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: BG, color: TEXT }}>
        <span className="text-sm" style={{ color: DIM }}>Connecting to room...</span>
      </div>
    );
  }

  const lang = room?.language ?? "python";
  const displayLang = lang.charAt(0).toUpperCase() + lang.slice(1);

  return (
    <div className="flex flex-col h-screen text-sm" style={{ background: BG, color: TEXT }}>

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 h-11 shrink-0"
        style={{ background: BAR, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm text-foreground">{room?.name ?? "Room"}</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono"
            style={{ background: `${B}18`, border: `1px solid ${B}30` }}>
            <span style={{ color: B }}>{roomCode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(142 60% 45%)" }} />
            <span className="text-xs text-muted-foreground">Synced</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Always show self first */}
          <Avatar user={{ name: displayName, color: cursorColor }} />
          {/* Then remote users */}
          {users.filter(u => u.name !== displayName).map(u => <Avatar key={u.name} user={u} />)}
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs hover:text-foreground transition-colors"
              style={{ color: DIM }}
            >
              {displayLang} <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 z-50 overflow-y-auto"
                style={{ background: SURF, border: `1px solid ${BORDER}`, maxHeight: 280 }}>
                {LANGS.map(l => (
                  <button key={l} onClick={() => handleLangChange(l.toLowerCase())}
                    className="w-full text-left px-3 py-2 text-xs hover:text-foreground transition-colors"
                    style={{ color: l.toLowerCase() === lang ? B : DIM }}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ width: 1, height: 16, background: BORDER }} />
          <button onClick={() => setChatOpen(v => !v)}
            className="p-2 transition-colors hover:text-foreground"
            style={{ color: chatOpen ? B : DIM }}>
            <MessageSquare className="w-4 h-4" />
          </button>
          <button onClick={() => setSettingsOpen(v => !v)}
            className="p-2 transition-colors hover:text-foreground"
            style={{ color: settingsOpen ? B : DIM }}>
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => setEndOpen(true)}
            className="ml-1 px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ background: "hsl(0 72% 55%)", color: "#fff" }}>
            Leave
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 min-h-0">

        {/* FILE TREE */}
        <AnimatePresence initial={false}>
          {treeOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 168, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="shrink-0 overflow-hidden"
              style={{ background: SURF, borderRight: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between px-3 h-9"
                style={{ borderBottom: `1px solid ${BORDER}` }}>
                <span className="text-[10px] tracking-wider uppercase" style={{ color: DIM }}>Files</span>
                <button onClick={handleAddFile} className="transition-colors hover:text-foreground" style={{ color: DIM }}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-1">
                {files.length === 0 && (
                  <p className="px-3 py-4 text-[10px] text-center" style={{ color: DIM }}>
                    Create your first file →
                  </p>
                )}
                {files.map(f => {
                  const Icon = fileIcon(f.name);
                  return (
                    <div key={f.id} className="group flex items-center gap-2 px-3 py-1.5 text-xs"
                      style={{
                        color: f.id === activeFileId ? B : "hsl(213 35% 65%)",
                        background: f.id === activeFileId ? `${B}12` : "transparent",
                      }}>
                      <button className="flex items-center gap-2 flex-1 text-left min-w-0"
                        onClick={() => setActiveFileId(f.id)}>
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ opacity: 0.6 }} />
                        <span className="font-mono truncate">{f.name}</span>
                      </button>
                      <button onClick={() => handleDeleteFile(f.id)}
                        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                        style={{ color: "hsl(0 72% 55%)" }}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TREE TOGGLE */}
        <div className="flex flex-col items-center justify-center w-5 shrink-0"
          style={{ borderRight: `1px solid ${BORDER}` }}>
          <button onClick={() => setTreeOpen(v => !v)}
            className="p-0.5 transition-colors hover:text-foreground" style={{ color: DIM }}>
            {treeOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>

        {/* EDITOR COLUMN */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {/* File tabs + Run button */}
          <div className="flex items-center h-9 shrink-0"
            style={{ background: SURF, borderBottom: `1px solid ${BORDER}` }}>
            <div className="flex items-center flex-1 overflow-hidden">
              {files.slice(0, 3).map(f => {
                const Icon = fileIcon(f.name);
                return (
                  <button key={f.id} onClick={() => setActiveFileId(f.id)}
                    className="flex items-center gap-1.5 px-4 h-full text-xs font-mono border-r transition-colors shrink-0"
                    style={{
                      borderColor: BORDER,
                      color: f.id === activeFileId ? TEXT : DIM,
                      borderBottom: f.id === activeFileId ? `1px solid ${B}` : "1px solid transparent",
                      background: f.id === activeFileId ? EDGE : "transparent",
                    }}>
                    <Icon className="w-3 h-3" />
                    {f.name}
                  </button>
                );
              })}
            </div>
            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={running || !activeFile}
              className="flex items-center gap-1.5 px-3 h-full text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40 shrink-0"
              style={{ background: "hsl(142 60% 45%)", color: "#fff" }}
            >
              {running
                ? <><Square className="w-3 h-3" /> Running...</>
                : <><Play className="w-3 h-3" /> Run</>}
            </button>
          </div>

          {/* Code area — Monaco Editor */}
          <div ref={editorContainerRef} className="flex-1 relative min-h-0" style={{ background: EDGE }}>
            {activeFile ? (
              <>
                <Editor
                  height="100%"
                  language={langToMonaco(lang)}
                  defaultValue={activeFile.content}
                  theme="vs-dark"
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    cursorBlinking: "smooth",
                    renderLineHighlight: "line",
                    padding: { top: 12 },
                    automaticLayout: true,
                  }}
                  onMount={(editor) => {
                    editorRef.current = editor;
                    // set correct content when switching files
                    const content = activeFileRef.current?.content ?? "";
                    if (editor.getValue() !== content) {
                      isRemoteChange.current = true;
                      editor.setValue(content);
                      isRemoteChange.current = false;
                    }
                    editor.onDidScrollChange(() => redrawCursors());
                    editor.onDidChangeCursorPosition(e => {
                      ws.sendCursorMove({
                        line: e.position.lineNumber,
                        column: e.position.column,
                      });
                    });
                  }}
                  onChange={value => handleCodeChange(value ?? "")}
                />

                {/* Cursor overlay — one badge per remote user */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
                  {cursorOverlays.map(c => (
                    <div
                      key={c.id}
                      style={{
                        position: "absolute",
                        left: c.x,
                        top: c.y,
                        transform: "translateY(-100%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Initials badge */}
                      <div style={{
                        background: c.color,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: "sans-serif",
                        padding: "1px 5px",
                        borderRadius: "3px 3px 3px 0",
                        whiteSpace: "nowrap",
                        lineHeight: "16px",
                        marginBottom: 1,
                      }}>
                        {c.initials}
                      </div>
                      {/* Cursor bar */}
                      <div style={{
                        width: 2,
                        height: 18,
                        background: c.color,
                      }} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: DIM }}>Create your first file →</p>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <AnimatePresence initial={false}>
            {outputOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 180, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 overflow-hidden flex flex-col"
                style={{ background: EDGE, borderTop: `1px solid ${BORDER}` }}
              >
                {/* Output header */}
                <div className="flex items-center justify-between px-4 h-8 shrink-0"
                  style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium" style={{ color: DIM }}>OUTPUT</span>
                    {runResult && (
                      <>
                        <span className="text-[10px] font-mono" style={{ color: DIM }}>
                          {runResult.language} {runResult.version}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 font-mono"
                          style={{
                            background: runResult.exit_code === 0 ? "hsl(142 60% 45%)22" : "hsl(0 72% 55%)22",
                            color: runResult.exit_code === 0 ? "hsl(142 60% 45%)" : "hsl(0 72% 55%)",
                            border: `1px solid ${runResult.exit_code === 0 ? "hsl(142 60% 45%)" : "hsl(0 72% 55%)"}`,
                          }}
                        >
                          exit {runResult.exit_code}
                        </span>
                      </>
                    )}
                    {running && (
                      <span className="text-[10px] animate-pulse" style={{ color: "hsl(38 85% 55%)" }}>
                        Running...
                      </span>
                    )}
                  </div>
                  <button onClick={() => setOutputOpen(false)} style={{ color: DIM }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Output content */}
                <div className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-5">
                  {running && (
                    <span style={{ color: DIM }}>Executing code...</span>
                  )}
                  {runResult && (
                    <>
                      {runResult.stdout && (
                        <pre style={{ color: TEXT, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                          {runResult.stdout}
                        </pre>
                      )}
                      {runResult.stderr && (
                        <pre style={{ color: "hsl(0 72% 65%)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                          {runResult.stderr}
                        </pre>
                      )}
                      {!runResult.stdout && !runResult.stderr && (
                        <span style={{ color: DIM }}>No output.</span>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 h-7 text-[11px] shrink-0"
            style={{ background: SURF, borderTop: `1px solid ${BORDER}`, color: DIM, fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="flex items-center gap-4">
              <span style={{ color: "hsl(38 85% 55%)" }}>
                {aiMessages.filter(m => m.type === "warning").length} warning{aiMessages.filter(m => m.type === "warning").length !== 1 ? "s" : ""}
              </span>
              <span>{aiMessages.filter(m => m.type === "error").length} errors</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setOutputOpen(v => !v)}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                style={{ color: outputOpen ? B : DIM }}
              >
                {outputOpen ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                Output
              </button>
              <span>UTF-8</span>
              <span style={{ color: B }}>{displayLang.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* AI PANEL */}
        <AnimatePresence initial={false}>
          {aiOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="shrink-0 flex flex-col overflow-hidden"
              style={{ background: SURF, borderLeft: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between px-4 h-9 shrink-0"
                style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: B, boxShadow: `0 0 4px ${B}` }} />
                  <span className="text-xs font-medium">AI Co-Pilot</span>
                </div>
                <button onClick={() => setAiOpen(false)}
                  className="transition-colors hover:text-foreground" style={{ color: DIM }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {aiMessages.length === 0 && !aiAnswer && (
                  <p className="px-4 py-6 text-[11px] text-center" style={{ color: DIM }}>
                    AI is watching your code. Start typing...
                  </p>
                )}
                {aiMessages.map((item, i) => {
                  const { Icon, color } = aiIcon(item.type);
                  return (
                    <div key={i} className="px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <div className="flex items-start gap-2 mb-1.5">
                        <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-foreground">{item.type}</span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed mb-2" style={{ color: DIM, paddingLeft: "1.375rem" }}>
                        {item.message}
                      </p>
                      {item.code_snippet && (
                        <pre className="text-[10px] p-2 leading-relaxed overflow-x-auto mb-2"
                          style={{ background: EDGE, fontFamily: "'JetBrains Mono', monospace", color: "hsl(213 40% 70%)", marginLeft: "1.375rem" }}>
                          {item.code_snippet}
                        </pre>
                      )}
                      {item.code_snippet && !appliedAI.includes(i) && (
                        <div className="flex gap-2" style={{ paddingLeft: "1.375rem" }}>
                          <button onClick={() => setAppliedAI(a => [...a, i])}
                            className="text-[10px] px-2 py-1 font-medium transition-opacity hover:opacity-80"
                            style={{ background: B, color: BG }}>
                            Apply
                          </button>
                          <button className="text-[10px] px-2 py-1 transition-colors hover:text-foreground"
                            style={{ color: DIM, border: `1px solid ${BORDER}` }}>
                            Dismiss
                          </button>
                        </div>
                      )}
                      {appliedAI.includes(i) && (
                        <div style={{ paddingLeft: "1.375rem" }}>
                          <span className="text-[10px]" style={{ color: "hsl(142 60% 45%)" }}>Applied</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {aiAnswer && (
                  <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-3.5 h-3.5" style={{ color: B }} />
                      <span className="text-xs font-medium text-foreground">AI Answer</span>
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: DIM, paddingLeft: "1.375rem" }}>
                      {aiAnswer}
                      {aiLoading && <span className="animate-pulse">▌</span>}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ borderTop: `1px solid ${BORDER}` }} className="p-3">
                <div className="flex items-center gap-2"
                  style={{ background: EDGE, border: `1px solid ${BORDER}`, padding: "6px 8px" }}>
                  <input
                    className="flex-1 text-xs outline-none bg-transparent"
                    style={{ color: TEXT }}
                    placeholder="Ask the AI..."
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAskAI()}
                  />
                  <button onClick={handleAskAI} disabled={aiLoading}
                    className="transition-colors hover:text-foreground disabled:opacity-40" style={{ color: DIM }}>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!aiOpen && (
          <button onClick={() => setAiOpen(true)}
            className="flex flex-col items-center justify-center w-7 shrink-0 transition-colors hover:text-foreground"
            style={{ background: SURF, borderLeft: `1px solid ${BORDER}`, color: DIM }}>
            <ChevronLeft className="w-3 h-3" />
          </button>
        )}

        {/* CHAT DRAWER */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 224, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="shrink-0 flex flex-col overflow-hidden"
              style={{ background: SURF, borderLeft: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between px-4 h-9 shrink-0"
                style={{ borderBottom: `1px solid ${BORDER}` }}>
                <span className="text-xs font-medium">Chat</span>
                <button onClick={() => setChatOpen(false)} style={{ color: DIM }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 space-y-3 px-4">
                {chatMessages.length === 0 && (
                  <p className="text-[10px] text-center py-4" style={{ color: DIM }}>
                    No messages yet. Say hi!
                  </p>
                )}
                {chatMessages.map((c, i) => (
                  <div key={i}>
                    <span className="text-[10px] font-medium" style={{ color: c.user.color }}>{c.user.name}</span>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "hsl(213 35% 65%)" }}>{c.message}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}` }} className="p-3">
                <div className="flex items-center gap-2"
                  style={{ background: EDGE, border: `1px solid ${BORDER}`, padding: "6px 8px" }}>
                  <input className="flex-1 text-xs outline-none bg-transparent"
                    style={{ color: TEXT }} placeholder="Message..."
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendChat()}
                  />
                  <button onClick={handleSendChat}
                    className="transition-colors hover:text-foreground" style={{ color: DIM }}>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AUDIO UNLOCK BANNER — shown when browser blocks autoplay */}
      {voice.needsAudioUnlock && (
        <div className="flex items-center justify-center gap-3 py-2 text-xs"
          style={{ background: "hsl(38 85% 55%)", color: "#000" }}>
          <span>Browser blocked audio playback.</span>
          <button
            onClick={voice.unlockAudio}
            className="px-3 py-0.5 font-medium"
            style={{ background: "#000", color: "hsl(38 85% 55%)" }}
          >
            Click to enable sound
          </button>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="flex items-center justify-between px-4 h-10 shrink-0"
        style={{ background: BAR, borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => setChatOpen(v => !v)}
          className="flex items-center gap-2 text-xs transition-colors hover:text-foreground"
          style={{ color: DIM }}>
          <MessageSquare className="w-3.5 h-3.5" /> Chat
          {chatMessages.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: B, color: BG }}>
              {chatMessages.length}
            </span>
          )}
        </button>

        {/* Voice controls */}
        <div className="flex items-center gap-1">
          {!voice.connected ? (
            <button
              onClick={voice.join}
              disabled={voice.connecting}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: "hsl(142 60% 45%)", color: "#fff" }}
            >
              <Phone className="w-3.5 h-3.5" />
              {voice.connecting ? "Joining..." : "Join voice"}
            </button>
          ) : (
            <>
              <button
                onClick={voice.toggleMute}
                className="p-2 transition-colors hover:text-foreground"
                style={{ color: voice.muted ? "hsl(0 72% 55%)" : "hsl(142 60% 45%)" }}
                title={voice.muted ? "Unmute" : "Mute"}
              >
                {voice.muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-1 px-2">
                {voice.participants.map(p => (
                  <div
                    key={p.identity}
                    className="flex items-center gap-1 text-[10px] px-1.5 py-0.5"
                    style={{
                      background: p.isSpeaking ? "hsl(142 60% 45%)22" : "transparent",
                      border: `1px solid ${p.isSpeaking ? "hsl(142 60% 45%)" : BORDER}`,
                      color: p.isSpeaking ? "hsl(142 60% 45%)" : DIM,
                      transition: "all 0.15s",
                    }}
                  >
                    {p.isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                    {p.identity}{p.isLocal ? " (you)" : ""}
                  </div>
                ))}
              </div>
              <button
                onClick={voice.leave}
                className="p-2 transition-colors"
                style={{ color: "hsl(0 72% 55%)" }}
                title="Leave call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </>
          )}
          {voice.error && (
            <span className="text-[10px]" style={{ color: "hsl(0 72% 55%)" }}>{voice.error}</span>
          )}
        </div>

        <span className="text-[11px] font-mono" style={{ color: DIM }}>
          {users.length} online
        </span>
      </div>

      {/* SETTINGS PANEL */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setSettingsOpen(false)} />
            <motion.div initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
              className="fixed right-0 top-0 bottom-0 w-72 z-50 p-6 flex flex-col gap-5 overflow-y-auto"
              style={{ background: SURF, borderLeft: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Settings</span>
                <button onClick={() => setSettingsOpen(false)} style={{ color: DIM }}><X className="w-4 h-4" /></button>
              </div>
              {[
                { label: "Room code", value: roomCode },
                { label: "Your name", value: displayName },
                { label: "Language", value: displayLang },
                { label: "AI suggestions", value: "On" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs font-mono" style={{ color: B }}>{s.value}</span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LEAVE MODAL */}
      <AnimatePresence>
        {endOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.7)" }}
              onClick={() => setEndOpen(false)} />
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm p-6" style={{ background: SURF, border: `1px solid ${BORDER}` }}>
                {summaryLoading ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: B, borderTopColor: "transparent" }} />
                    <p className="text-xs" style={{ color: DIM }}>Generating session summary...</p>
                  </div>
                ) : summary ? (
                  <>
                    <p className="font-medium text-sm mb-4">Session Summary</p>
                    <div className="flex gap-4 mb-3">
                      <div className="text-xs" style={{ color: DIM }}>
                        <span className="block text-[10px] uppercase tracking-wider mb-0.5">Duration</span>
                        <span style={{ color: TEXT }}>{Math.floor(Math.abs(summary.duration_seconds) / 60)}m {Math.abs(summary.duration_seconds) % 60}s</span>
                      </div>
                      <div className="text-xs" style={{ color: DIM }}>
                        <span className="block text-[10px] uppercase tracking-wider mb-0.5">Files</span>
                        <span style={{ color: TEXT }}>{summary.files_modified.length || 0}</span>
                      </div>
                    </div>
                    {summary.files_modified.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {summary.files_modified.map(f => (
                          <span key={f} className="text-[10px] px-1.5 py-0.5 font-mono"
                            style={{ background: `${B}18`, border: `1px solid ${B}30`, color: B }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[11px] leading-relaxed mb-5 whitespace-pre-wrap" style={{ color: DIM }}>
                      {summary.ai_summary}
                    </div>
                    <button onClick={() => setLocation("/")}
                      className="w-full py-2 text-xs font-medium"
                      style={{ background: B, color: BG }}>
                      Back to home
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-1 flex items-center gap-2">
                      <LogOut className="w-4 h-4" style={{ color: "hsl(0 72% 55%)" }} />
                      <span className="font-medium text-sm">Leave session?</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Your changes are auto-saved. Others can continue without you.
                    </p>
                    {summaryError && (
                      <p className="text-[11px] mb-3 px-2 py-1.5" style={{ color: "hsl(0 72% 65%)", background: "hsl(0 72% 55%)15", border: "1px solid hsl(0 72% 55%)30" }}>
                        {summaryError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={handleEndSession}
                        disabled={summaryLoading}
                        className="flex-1 py-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                        style={{ background: "hsl(0 72% 55%)", color: "#fff" }}>
                        End & summarize
                      </button>
                      <button onClick={() => setLocation("/")}
                        className="flex-1 py-2 text-xs font-medium"
                        style={{ background: "hsl(220 30% 15%)", color: TEXT }}>
                        Just leave
                      </button>
                      <button onClick={() => setEndOpen(false)}
                        className="px-3 py-2 text-xs transition-colors hover:text-foreground"
                        style={{ border: `1px solid ${BORDER}`, color: DIM }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
