import { useState } from "react";
import { useLocation } from "wouter";
import {
  Mic, MicOff, PhoneOff, Volume2, Settings, MessageSquare,
  ChevronRight, ChevronLeft, Plus, X, Send, AlertTriangle,
  Lightbulb, Zap, FileCode, FileText, FlaskConical, ChevronDown,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const B      = "hsl(213 90% 60%)";
const BG     = "hsl(222 47% 5%)";
const EDGE   = "hsl(222 50% 4%)";
const SURF   = "hsl(220 40% 8%)";
const BAR    = "hsl(220 40% 7%)";
const BORDER = "hsl(220 30% 12%)";
const DIM    = "hsl(213 25% 38%)";
const TEXT   = "hsl(213 40% 85%)";

const AI_LOG = [
  {
    id: 1, time: "3m ago", icon: AlertTriangle, color: "hsl(38 85% 55%)",
    title: "Potential division by zero",
    body: "Line 12: loop may pass denominator = 0. Add a guard check.",
  },
  {
    id: 2, time: "1m ago", icon: Lightbulb, color: B,
    title: "Optimization available",
    body: "fibonacci() is O(2\u207F). Wrap with @lru_cache for O(n).",
    code: "@lru_cache(maxsize=None)\ndef fibonacci(n: int) -> int:",
  },
  {
    id: 3, time: "now", icon: Zap, color: "hsl(142 60% 45%)",
    title: "Scan complete",
    body: "3 functions indexed. All have docstrings. Coverage 87%.",
  },
];

const CHAT = [
  { id: 1, name: "Alice", color: "#4a9eff", msg: "Found the bug — line 12, check the edge case." },
  { id: 2, name: "Bob",   color: "#a78bfa", msg: "On it. Also the AI flagged a memoization opportunity." },
  { id: 3, name: "Alice", color: "#4a9eff", msg: "Applying the lru_cache now." },
];

const FILES = [
  { id: 1, name: "main.py",      icon: FileCode },
  { id: 2, name: "utils.py",     icon: FileCode },
  { id: 3, name: "test_main.py", icon: FlaskConical },
  { id: 4, name: "README.md",    icon: FileText },
  { id: 5, name: "config.json",  icon: FileText },
];

const CODE = [
  "def fibonacci(n: int) -> int:",
  '    """Calculate the nth Fibonacci number."""',
  "    if n <= 0:",
  "        return 0",
  "    elif n == 1:",
  "        return 1",
  "    else:",
  "        return fibonacci(n-1) + fibonacci(n-2)",
  "",
  "# —— runtime test ——",
  'if __name__ == "__main__":',
  "    for i in range(10):",
  '        print(f"fibonacci({i}) = ", fibonacci(i))',
];

const LANGS = ["Python", "TypeScript", "Rust", "Go", "Java"];

type Pill = { name: string; color: string; short: string };
const PILLS: Pill[] = [
  { name: "Alice", color: "#4a9eff", short: "AL" },
  { name: "Bob",   color: "#a78bfa", short: "BO" },
];

function Avatar({ pill, size = 26 }: { pill: Pill; size?: number }) {
  return (
    <div
      className="flex items-center justify-center text-[10px] font-bold rounded-full select-none"
      style={{
        width: size, height: size,
        background: pill.color + "28",
        border: `1.5px solid ${pill.color}60`,
        color: pill.color,
      }}
    >
      {pill.short}
    </div>
  );
}

function colorize(line: string): string {
  const t = line.trimStart();
  if (t.startsWith("#") || t.startsWith('"""') || t.endsWith('"""'))
    return "hsl(213 25% 40%)";
  if (/\b(def|if|elif|else|return|for|in|import|from|print)\b/.test(line))
    return "hsl(200 60% 72%)";
  return "hsl(213 35% 68%)";
}

export default function Room() {
  const [, setLocation] = useLocation();
  const [muted, setMuted] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [lang, setLang] = useState("Python");
  const [langOpen, setLangOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(true);
  const [activeFile, setActiveFile] = useState(1);
  const [appliedAI, setAppliedAI] = useState<number[]>([]);
  const cursorLine = 8;

  return (
    <div className="flex flex-col h-screen text-sm" style={{ background: BG, color: TEXT }}>

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 h-11 shrink-0"
        style={{ background: BAR, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm text-foreground">Project Alpha</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono"
            style={{ background: `${B}18`, border: `1px solid ${B}30` }}>
            <span style={{ color: B }}>ROOM-7A3X</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full status-dot-green" />
            <span className="text-xs text-muted-foreground">Synced</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {PILLS.map(p => <Avatar key={p.name} pill={p} />)}
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs hover:text-foreground transition-colors"
              style={{ color: DIM }}
            >
              {lang} <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-28 z-50 overflow-hidden"
                style={{ background: SURF, border: `1px solid ${BORDER}` }}>
                {LANGS.map(l => (
                  <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:text-foreground transition-colors"
                    style={{ color: l === lang ? B : DIM }}>
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
                <button className="transition-colors hover:text-foreground" style={{ color: DIM }}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-1">
                {FILES.map(f => (
                  <button key={f.id} onClick={() => setActiveFile(f.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
                    style={{
                      color: f.id === activeFile ? B : "hsl(213 35% 65%)",
                      background: f.id === activeFile ? `${B}12` : "transparent",
                    }}>
                    <f.icon className="w-3.5 h-3.5 shrink-0" style={{ opacity: 0.6 }} />
                    <span className="font-mono">{f.name}</span>
                  </button>
                ))}
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
        <div className="flex flex-col flex-1 min-w-0">
          {/* File tabs */}
          <div className="flex items-center h-9 shrink-0"
            style={{ background: SURF, borderBottom: `1px solid ${BORDER}` }}>
            {FILES.slice(0, 2).map(f => (
              <button key={f.id} onClick={() => setActiveFile(f.id)}
                className="flex items-center gap-1.5 px-4 h-full text-xs font-mono border-r transition-colors"
                style={{
                  borderColor: BORDER,
                  color: f.id === activeFile ? TEXT : DIM,
                  borderBottom: f.id === activeFile ? `1px solid ${B}` : "1px solid transparent",
                  background: f.id === activeFile ? EDGE : "transparent",
                }}>
                <f.icon className="w-3 h-3" />
                {f.name}
              </button>
            ))}
          </div>

          {/* Code area */}
          <div className="flex-1 overflow-auto" style={{ background: EDGE }}>
            <div className="min-h-full py-4"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: "22px" }}>
              {CODE.map((line, i) => {
                const num = i + 1;
                const isCursor = num === cursorLine;
                return (
                  <div key={i} className="flex items-start group relative"
                    style={{ background: isCursor ? `${B}08` : "transparent" }}>
                    <span className="w-12 text-right pr-4 select-none shrink-0 text-xs"
                      style={{ color: isCursor ? `${B}80` : "hsl(213 20% 28%)", paddingTop: 1 }}>
                      {num}
                    </span>
                    <span className="flex-1 pr-6" style={{ color: colorize(line) }}>
                      {line || " "}
                      {isCursor && (
                        <span className="inline-block relative" style={{ marginLeft: 2 }}>
                          <span className="absolute -top-5 left-0 text-[9px] px-1 whitespace-nowrap"
                            style={{ background: "#4a9eff", color: "#fff", borderRadius: 2 }}>
                            Alice
                          </span>
                          <span className="cursor-blink inline-block w-0.5 h-4 align-middle"
                            style={{ background: "#4a9eff" }} />
                        </span>
                      )}
                    </span>
                    {num === 2 && (
                      <span className="absolute right-4 top-0 flex items-center gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ color: B }}>
                        <Lightbulb className="w-3 h-3" /> AI hint
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 h-7 text-[11px] shrink-0"
            style={{ background: SURF, borderTop: `1px solid ${BORDER}`, color: DIM, fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="flex items-center gap-4">
              <span style={{ color: "hsl(38 85% 55%)" }}>1 warning</span>
              <span>0 errors</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Ln {cursorLine}, Col 42</span>
              <span>UTF-8</span>
              <span style={{ color: B }}>{lang.toUpperCase()}</span>
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
                  <div className="w-1.5 h-1.5 rounded-full status-dot-blue" />
                  <span className="text-xs font-medium">AI Co-Pilot</span>
                </div>
                <button onClick={() => setAiOpen(false)}
                  className="transition-colors hover:text-foreground" style={{ color: DIM }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {AI_LOG.map(item => (
                  <div key={item.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div className="flex items-start gap-2 mb-1.5">
                      <item.icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{item.title}</span>
                          <span className="text-[10px] ml-2 shrink-0" style={{ color: DIM }}>{item.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed mb-2" style={{ color: DIM, paddingLeft: "1.375rem" }}>
                      {item.body}
                    </p>
                    {item.code && (
                      <pre className="text-[10px] p-2 leading-relaxed overflow-x-auto mb-2"
                        style={{ background: EDGE, fontFamily: "'JetBrains Mono', monospace", color: "hsl(213 40% 70%)", marginLeft: "1.375rem" }}>
                        {item.code}
                      </pre>
                    )}
                    {item.code && !appliedAI.includes(item.id) && (
                      <div className="flex gap-2" style={{ paddingLeft: "1.375rem" }}>
                        <button onClick={() => setAppliedAI(a => [...a, item.id])}
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
                    {appliedAI.includes(item.id) && (
                      <div style={{ paddingLeft: "1.375rem" }}>
                        <span className="text-[10px]" style={{ color: "hsl(142 60% 45%)" }}>Applied</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${BORDER}` }} className="p-3">
                <div className="flex items-center gap-2"
                  style={{ background: EDGE, border: `1px solid ${BORDER}`, padding: "6px 8px" }}>
                  <input className="flex-1 text-xs outline-none bg-transparent"
                    style={{ color: TEXT }} placeholder="Ask the AI..." />
                  <button className="transition-colors hover:text-foreground" style={{ color: DIM }}>
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
                {CHAT.map(c => (
                  <div key={c.id}>
                    <span className="text-[10px] font-medium" style={{ color: c.color }}>{c.name}</span>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "hsl(213 35% 65%)" }}>{c.msg}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}` }} className="p-3">
                <div className="flex items-center gap-2"
                  style={{ background: EDGE, border: `1px solid ${BORDER}`, padding: "6px 8px" }}>
                  <input className="flex-1 text-xs outline-none bg-transparent"
                    style={{ color: TEXT }} placeholder="Message..."
                    value={chatMsg} onChange={e => setChatMsg(e.target.value)} />
                  <button className="transition-colors hover:text-foreground" style={{ color: DIM }}>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM BAR */}
      <div className="flex items-center justify-between px-4 h-10 shrink-0"
        style={{ background: BAR, borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => setChatOpen(v => !v)}
          className="flex items-center gap-2 text-xs transition-colors hover:text-foreground"
          style={{ color: DIM }}>
          <MessageSquare className="w-3.5 h-3.5" /> Chat
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setMuted(v => !v)}
            className="p-2 transition-colors hover:text-foreground"
            style={{ color: muted ? "hsl(0 72% 55%)" : DIM }}>
            {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button className="p-2 transition-colors hover:text-foreground" style={{ color: DIM }}>
            <Volume2 className="w-4 h-4" />
          </button>
          <button onClick={() => setEndOpen(true)} className="ml-1 p-2 transition-colors"
            style={{ color: "hsl(0 72% 55%)" }}>
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
        <span className="text-[11px] font-mono" style={{ color: DIM }}>UPTIME 01:23:45</span>
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
                { label: "Font size", value: "13px" },
                { label: "Tab size", value: "4 spaces" },
                { label: "Word wrap", value: "Off" },
                { label: "AI suggestions", value: "On" },
                { label: "Voice quality", value: "HD" },
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
              <div className="w-full max-w-xs p-6" style={{ background: SURF, border: `1px solid ${BORDER}` }}>
                <div className="mb-1 flex items-center gap-2">
                  <LogOut className="w-4 h-4" style={{ color: "hsl(0 72% 55%)" }} />
                  <span className="font-medium text-sm">Leave session?</span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  Your changes are auto-saved. Others can continue without you.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setLocation("/")}
                    className="flex-1 py-2 text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ background: "hsl(0 72% 55%)", color: "#fff" }}>
                    Leave
                  </button>
                  <button onClick={() => setEndOpen(false)}
                    className="flex-1 py-2 text-xs transition-colors hover:text-foreground"
                    style={{ border: `1px solid ${BORDER}`, color: DIM }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
