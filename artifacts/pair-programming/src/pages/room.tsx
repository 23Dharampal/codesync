import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Copy, Mic, MonitorUp, Settings, PhoneOff, Check, ChevronLeft, ChevronRight,
  FileCode2, FileJson, FileText, Plus, MessageSquare, MicOff, Volume2, X,
  Send, Bot, Lightbulb, Zap, AlertTriangle, Info, ShieldAlert
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CYAN = "hsl(186 100% 50%)";
const MAGENTA = "hsl(300 100% 60%)";
const GREEN = "hsl(120 100% 50%)";
const YELLOW = "hsl(55 100% 60%)";
const RED = "hsl(0 100% 60%)";
const BG_DARK = "hsl(240 30% 3%)";
const PANEL = "hsl(240 25% 8%)";
const BAR = "hsl(240 30% 5%)";

const NeonDot = ({ color = GREEN, size = 8 }: { color?: string; size?: number }) => (
  <span
    className="inline-block rounded-full flex-shrink-0"
    style={{
      width: size, height: size,
      background: color,
      boxShadow: `0 0 6px ${color}, 0 0 12px ${color}55`,
      animation: "pulse-green 2s ease-in-out infinite"
    }}
  />
);

const NeonTag = ({ children, color = CYAN }: { children: React.ReactNode; color?: string }) => (
  <span
    className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 border"
    style={{ color, borderColor: `${color}44`, background: `${color}0d` }}
  >
    {children}
  </span>
);

export default function Room() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => {
      toast({
        title: "// OPERATIVE CONNECTED",
        description: "bob_runner has joined the session",
        className: "rounded-none border font-mono text-xs",
        style: {
          background: "hsl(240 25% 8%)",
          borderColor: "hsl(120 100% 50% / 0.5)",
          color: "hsl(120 100% 50%)",
          boxShadow: "0 0 20px hsl(120 100% 50% / 0.2)",
        } as React.CSSProperties,
        duration: 3500,
      });
    }, 800);
    const t2 = setTimeout(() => {
      toast({
        title: "// NEURAL AI SIGNAL",
        description: "Anomaly detected on line 12",
        className: "rounded-none border font-mono text-xs",
        style: {
          background: "hsl(240 25% 8%)",
          borderColor: "hsl(186 100% 50% / 0.5)",
          color: "hsl(186 100% 50%)",
          boxShadow: "0 0 20px hsl(186 100% 50% / 0.2)",
        } as React.CSSProperties,
        duration: 4000,
      });
    }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText("ROOM-7A3X");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const barStyle: React.CSSProperties = {
    background: BAR,
    borderColor: `${CYAN}22`,
  };
  const panelStyle: React.CSSProperties = {
    background: PANEL,
    borderColor: `${CYAN}22`,
  };

  return (
    <div className="flex flex-col h-screen w-full text-foreground overflow-hidden" style={{ background: BG_DARK }}>
      {/* Mobile block */}
      <div
        className="sm:hidden fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center gap-4"
        style={{ background: BG_DARK }}
      >
        <NeonDot color={RED} size={12} />
        <p className="text-sm font-mono text-neon-cyan tracking-widest">// DESKTOP REQUIRED</p>
        <p className="text-xs font-mono text-muted-foreground">This interface requires a large viewport to render correctly.</p>
      </div>

      {/* ── TOP BAR ── */}
      <div className="h-11 flex items-center justify-between px-4 shrink-0 border-b relative" style={barStyle}>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(186_100%_50%_/_0.4)] to-transparent" />

        {/* Left: room name + code */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            defaultValue="Project Alpha"
            className="bg-transparent border-none text-sm font-mono font-bold focus:outline-none focus:ring-1 rounded-none px-1 w-32"
            style={{ color: CYAN, caretColor: CYAN, ringColor: CYAN }}
            data-testid="input-room-name"
          />
          <div
            className="flex items-center gap-2 px-2 py-1 border font-mono text-xs cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: `${CYAN}0d`, borderColor: `${CYAN}44`, color: CYAN }}
          >
            <span className="tracking-widest">ROOM-7A3X</span>
            <button onClick={handleCopy} data-testid="btn-copy-room-code">
              {copied ? <Check className="w-3 h-3" style={{ color: GREEN }} /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <NeonDot color={GREEN} size={6} />
            <span className="text-[10px] font-mono" style={{ color: `${GREEN}aa` }}>SYNCED</span>
          </div>
        </div>

        {/* Center: user avatars */}
        <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {[
            { initials: "AL", color: CYAN, name: "alice_zero" },
            { initials: "BO", color: MAGENTA, name: "bob_runner" },
          ].map((u, i) => (
            <Tooltip key={u.name}>
              <TooltipTrigger>
                <div className="relative w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold cursor-default"
                  style={{
                    background: `${u.color}22`,
                    borderColor: u.color,
                    color: u.color,
                    boxShadow: `0 0 10px ${u.color}66`,
                    marginLeft: i > 0 ? "-6px" : 0
                  }}
                >
                  {u.initials}
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2" style={{ background: GREEN, borderColor: BG_DARK, boxShadow: `0 0 4px ${GREEN}` }} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-xs rounded-none">{u.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          <Select defaultValue="python">
            <SelectTrigger
              className="w-28 h-7 text-[11px] font-mono border rounded-none"
              style={{ background: `${CYAN}0a`, borderColor: `${CYAN}33`, color: CYAN }}
              data-testid="select-language"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="font-mono text-xs rounded-none" style={{ background: PANEL, borderColor: `${CYAN}33` }}>
              {["python", "javascript", "typescript", "go", "rust"].map(l => (
                <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {[
            { icon: <Mic className="w-3.5 h-3.5" />, label: "Voice", testId: "btn-voice-toggle" },
            { icon: <MonitorUp className="w-3.5 h-3.5" />, label: "Share", testId: "btn-screen-share" },
          ].map(btn => (
            <button
              key={btn.label}
              className="w-7 h-7 flex items-center justify-center border transition-all"
              style={{ borderColor: `${CYAN}33`, color: `${CYAN}88`, background: "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; (e.currentTarget as HTMLElement).style.borderColor = `${CYAN}77`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${CYAN}33`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = `${CYAN}88`; (e.currentTarget as HTMLElement).style.borderColor = `${CYAN}33`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              data-testid={btn.testId}
            >
              {btn.icon}
            </button>
          ))}

          <button
            className="w-7 h-7 flex items-center justify-center border transition-all"
            style={{ borderColor: `${MAGENTA}33`, color: `${MAGENTA}88`, background: "transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = MAGENTA; (e.currentTarget as HTMLElement).style.borderColor = `${MAGENTA}77`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${MAGENTA}33`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = `${MAGENTA}88`; (e.currentTarget as HTMLElement).style.borderColor = `${MAGENTA}33`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            onClick={() => setSettingsOpen(true)}
            data-testid="btn-settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            className="px-3 h-7 text-[11px] font-mono tracking-wider border transition-all"
            style={{ background: `${RED}0d`, borderColor: `${RED}66`, color: RED, boxShadow: `0 0 8px ${RED}22` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${RED}22`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${RED}44`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${RED}0d`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${RED}22`; }}
            onClick={() => setEndOpen(true)}
            data-testid="btn-end-session"
          >
            TERMINATE
          </button>
        </div>
      </div>

      {/* ── MIDDLE ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: File Tree */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 210, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 flex flex-col border-r overflow-hidden"
              style={panelStyle}
            >
              <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: `${CYAN}22` }}>
                <span className="text-[9px] font-mono tracking-widest" style={{ color: `${CYAN}66` }}>// FILE_SYSTEM</span>
                <div className="flex gap-1">
                  <button
                    className="p-1 transition-colors"
                    style={{ color: `${CYAN}66` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = CYAN}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${CYAN}66`}
                    data-testid="btn-new-file"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1 transition-colors"
                    style={{ color: `${CYAN}66` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = CYAN}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${CYAN}66`}
                    onClick={() => setLeftOpen(false)}
                    data-testid="btn-collapse-left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2 space-y-0.5 text-xs font-mono overflow-y-auto">
                {[
                  { name: "main.py", icon: <FileCode2 className="w-3.5 h-3.5" />, color: CYAN, active: true },
                  { name: "utils.py", icon: <FileCode2 className="w-3.5 h-3.5" />, color: CYAN, active: false },
                  { name: "test_main.py", icon: <FileCode2 className="w-3.5 h-3.5" />, color: GREEN, active: false },
                  { name: "README.md", icon: <FileText className="w-3.5 h-3.5" />, color: MAGENTA, active: false },
                  { name: "config.json", icon: <FileJson className="w-3.5 h-3.5" />, color: YELLOW, active: false },
                ].map(f => (
                  <div
                    key={f.name}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-all"
                    style={f.active
                      ? { background: `${CYAN}15`, color: CYAN, borderLeft: `2px solid ${CYAN}`, boxShadow: `inset 0 0 10px ${CYAN}08` }
                      : { color: "hsl(220 30% 50%)" }
                    }
                    onMouseEnter={e => { if (!f.active) { (e.currentTarget as HTMLElement).style.background = `${CYAN}08`; (e.currentTarget as HTMLElement).style.color = "hsl(195 80% 80%)"; } }}
                    onMouseLeave={e => { if (!f.active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "hsl(220 30% 50%)"; } }}
                    data-testid={`file-${f.name.replace(".", "-")}`}
                  >
                    <span style={{ color: f.color }}>{f.icon}</span>
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!leftOpen && (
          <div className="w-9 shrink-0 flex flex-col items-center py-2 border-r" style={panelStyle}>
            <button
              className="p-1.5 transition-colors"
              style={{ color: `${CYAN}66` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = CYAN}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${CYAN}66`}
              onClick={() => setLeftOpen(true)}
              data-testid="btn-expand-left"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* CENTER: Editor */}
        <div className="flex-1 flex flex-col min-w-0 relative" style={{ background: BG_DARK }}>
          {/* Editor tabs */}
          <div className="flex h-8 border-b shrink-0" style={{ background: PANEL, borderColor: `${CYAN}22` }}>
            <div
              className="px-3 flex items-center gap-2 border-r border-b-2 text-xs font-mono cursor-pointer"
              style={{ background: BG_DARK, borderRightColor: `${CYAN}22`, borderBottomColor: CYAN, color: CYAN }}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              main.py
              <button className="ml-1 opacity-50 hover:opacity-100">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <div
              className="px-3 flex items-center gap-2 border-r text-xs font-mono cursor-pointer transition-colors"
              style={{ borderRightColor: `${CYAN}22`, color: "hsl(220 30% 50%)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "hsl(195 80% 80%)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "hsl(220 30% 50%)"}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              utils.py
            </div>
          </div>

          {/* Code area */}
          <div className="flex-1 flex overflow-hidden font-mono text-sm relative">
            {/* Line numbers */}
            <div
              className="w-12 shrink-0 border-r text-right pr-3 py-4 select-none flex flex-col text-xs"
              style={{ background: `${BG_DARK}dd`, borderColor: `${CYAN}15`, color: "hsl(220 25% 30%)" }}
            >
              {[...Array(28)].map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>

            {/* Minimap */}
            <div
              className="absolute right-0 top-0 bottom-0 w-14 border-l z-10 pointer-events-none hidden md:block opacity-60"
              style={{ background: `${BG_DARK}cc`, borderColor: `${CYAN}15` }}
            >
              {[8, 12, 16, 20, 25, 30, 40, 48, 55, 65, 80, 90].map((top, i) => (
                <div key={i} className="absolute left-2 h-0.5 rounded" style={{ top, width: `${40 + (i % 5) * 8}%`, background: i % 3 === 0 ? `${CYAN}30` : i % 3 === 1 ? `${MAGENTA}25` : `${GREEN}20` }} />
              ))}
              <div className="absolute left-1 right-1 h-10 border rounded-none" style={{ top: 22, borderColor: `${CYAN}40`, background: `${CYAN}08` }} />
            </div>

            {/* Code content */}
            <div className="flex-1 py-4 pl-4 pr-16 overflow-auto leading-6 relative">

              {/* Line 1 */}
              <div><span style={{ color: MAGENTA }}>def</span> <span style={{ color: CYAN }}>fibonacci</span>(<span style={{ color: "hsl(195 80% 92%)" }}>n</span>: <span style={{ color: YELLOW }}>int</span>) -&gt; <span style={{ color: YELLOW }}>int</span>:</div>
              {/* Line 2 */}
              <div style={{ color: GREEN }}>{"    "}"""Calculate the nth Fibonacci number."""</div>
              {/* Line 3 */}
              <div className="relative">
                {"    "}<span style={{ color: MAGENTA }}>if</span> n &lt;= <span style={{ color: YELLOW }}>0</span>:
                {/* Bob cursor */}
                <span
                  className="absolute cursor-blink"
                  style={{ left: 120, top: 0, bottom: 0, width: 2, background: MAGENTA, boxShadow: `0 0 8px ${MAGENTA}` }}
                >
                  <span
                    className="absolute -top-5 -left-1 px-1.5 py-0.5 text-[9px] font-mono font-bold whitespace-nowrap"
                    style={{ background: MAGENTA, color: "#000", boxShadow: `0 0 10px ${MAGENTA}` }}
                  >
                    BOB
                  </span>
                </span>
              </div>
              {/* Line 4 - Bob selection */}
              <div style={{ background: `${MAGENTA}18` }}>
                {"        "}<span style={{ color: MAGENTA }}>return</span> <span style={{ color: YELLOW }}>0</span>
              </div>
              {/* Line 5 */}
              <div>{"    "}<span style={{ color: MAGENTA }}>elif</span> n == <span style={{ color: YELLOW }}>1</span>:</div>
              {/* Line 6 */}
              <div>{"        "}<span style={{ color: MAGENTA }}>return</span> <span style={{ color: YELLOW }}>1</span></div>
              {/* Line 7 */}
              <div>{"    "}<span style={{ color: MAGENTA }}>else</span>:</div>
              {/* Line 8 - AI suggestion + Alice cursor */}
              <div className="relative" style={{ background: `${CYAN}10` }}>
                {/* AI lightbulb */}
                <div className="absolute -left-5 top-1">
                  <button
                    onClick={() => setShowAISuggestion(!showAISuggestion)}
                    data-testid="btn-ai-lightbulb"
                    style={{ color: YELLOW, filter: `drop-shadow(0 0 6px ${YELLOW})` }}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                  </button>
                </div>
                {"        "}<span style={{ color: MAGENTA }}>return</span> fibonacci(n-<span style={{ color: YELLOW }}>1</span>) + fibonacci(n-<span style={{ color: YELLOW }}>2</span>)

                {/* Alice cursor */}
                <span
                  className="absolute cursor-blink"
                  style={{ left: 390, top: 0, bottom: 0, width: 2, background: CYAN, boxShadow: `0 0 8px ${CYAN}` }}
                >
                  <span
                    className="absolute -top-5 -left-1 px-1.5 py-0.5 text-[9px] font-mono font-bold whitespace-nowrap"
                    style={{ background: CYAN, color: "#000", boxShadow: `0 0 10px ${CYAN}` }}
                  >
                    ALICE
                  </span>
                </span>

                {/* AI suggestion popup */}
                <AnimatePresence>
                  {showAISuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute z-30 left-8 -top-24 w-72 p-3 border text-[11px]"
                      style={{ background: PANEL, borderColor: `${YELLOW}55`, boxShadow: `0 0 20px ${YELLOW}22` }}
                    >
                      <div className="font-mono mb-1" style={{ color: YELLOW }}>// NEURAL_AI :: OPTIMIZATION</div>
                      <p className="font-mono text-muted-foreground mb-2">Use memoization via <code style={{ color: CYAN }}>@lru_cache</code> to avoid redundant recursive calls.</p>
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-0.5 text-[10px] font-mono border"
                          style={{ borderColor: `${CYAN}55`, color: CYAN, background: `${CYAN}0d` }}
                          onClick={() => setShowAISuggestion(false)}
                        >
                          APPLY
                        </button>
                        <button
                          className="px-2 py-0.5 text-[10px] font-mono border"
                          style={{ borderColor: `${RED}44`, color: `${RED}aa`, background: "transparent" }}
                          onClick={() => setShowAISuggestion(false)}
                        >
                          DISMISS
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Line 9 */}
              <div className="mt-4"></div>
              {/* Line 10 */}
              <div style={{ color: "hsl(220 25% 40%)" }}># ── runtime test ──</div>
              {/* Line 11 */}
              <div><span style={{ color: MAGENTA }}>if</span> __name__ == <span style={{ color: GREEN }}>"__main__"</span>:</div>
              {/* Line 12 */}
              <div style={{ background: `${RED}10` }}>
                {"    "}<span style={{ color: MAGENTA }}>for</span> i <span style={{ color: MAGENTA }}>in</span> <span style={{ color: CYAN }}>range</span>(<span style={{ color: YELLOW }}>10</span>):
                {/* Warning indicator */}
                <span className="ml-2 text-[10px] font-mono px-1" style={{ color: RED, background: `${RED}15`, borderLeft: `2px solid ${RED}` }}>!</span>
              </div>
              {/* Line 13 */}
              <div>{"        "}<span style={{ color: CYAN }}>print</span>(<span style={{ color: GREEN }}>{`f"fibonacci({"{i}"}) = "`}</span>, fibonacci(i))</div>
              {[...Array(14)].map((_, i) => <div key={i} className="leading-6" />)}
            </div>
          </div>

          {/* Status bar */}
          <div
            className="h-6 flex items-center justify-between px-4 text-[10px] font-mono shrink-0 border-t"
            style={{ background: `${CYAN}0a`, borderColor: `${CYAN}22`, color: "hsl(220 30% 45%)" }}
          >
            <div className="flex gap-3">
              <span style={{ color: YELLOW }}>1 warning</span>
              <span style={{ color: RED }}>0 errors</span>
            </div>
            <div className="flex gap-4">
              <span>Ln 8, Col 42</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <span style={{ color: CYAN }}>PYTHON</span>
            </div>
          </div>
        </div>

        {/* RIGHT: AI Panel */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 290, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 flex flex-col border-l overflow-hidden"
              style={panelStyle}
            >
              {/* Header */}
              <div className="px-3 py-2 border-b flex items-center justify-between shrink-0" style={{ borderColor: `${CYAN}22` }}>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" style={{ color: CYAN, filter: `drop-shadow(0 0 6px ${CYAN})` }} />
                  <span className="text-xs font-mono tracking-widest" style={{ color: CYAN }}>NEURAL AI</span>
                  <NeonDot color={CYAN} size={6} />
                </div>
                <button
                  className="p-1 transition-colors"
                  style={{ color: `${CYAN}55` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = CYAN}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${CYAN}55`}
                  onClick={() => setRightOpen(false)}
                  data-testid="btn-collapse-right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI status */}
              <div className="px-3 py-1.5 text-[10px] font-mono flex items-center gap-2 border-b shrink-0" style={{ borderColor: `${CYAN}15`, color: `${CYAN}88`, background: `${CYAN}06` }}>
                <div className="w-2.5 h-2.5 rounded-full border-2 animate-spin" style={{ borderColor: `${CYAN}44`, borderTopColor: CYAN }} />
                ANALYZING STREAM...
              </div>

              {/* Suggestions feed */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {[
                  {
                    type: "WARNING",
                    icon: <AlertTriangle className="w-3 h-3" />,
                    color: YELLOW,
                    label: "ANOMALY DETECTED",
                    time: "3m ago",
                    body: "Line 12: Potential division by zero in loop iteration. Integrity check recommended.",
                    code: null,
                  },
                  {
                    type: "OPT",
                    icon: <Zap className="w-3 h-3" />,
                    color: CYAN,
                    label: "OPTIMIZATION VECTOR",
                    time: "1m ago",
                    body: "fibonacci() executes O(2^n) calls. Inject memoization to achieve O(n).",
                    code: "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fibonacci(n: int) -> int:\n    ...",
                  },
                  {
                    type: "INFO",
                    icon: <Info className="w-3 h-3" />,
                    color: "hsl(220 30% 55%)",
                    label: "SCAN COMPLETE",
                    time: "now",
                    body: "3 functions indexed. All have docstrings. Coverage: 87%.",
                    code: null,
                  },
                  {
                    type: "CRITICAL",
                    icon: <ShieldAlert className="w-3 h-3" />,
                    color: RED,
                    label: "TYPE VIOLATION",
                    time: "5m ago",
                    body: "Missing return type annotation on recursive branch (line 8). Type safety compromised.",
                    code: null,
                  },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className="border border-l-2 p-2.5"
                    style={{
                      background: `${msg.color}08`,
                      borderColor: `${msg.color}25`,
                      borderLeftColor: msg.color,
                    }}
                    data-testid={`ai-msg-${i}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: msg.color }}>{msg.icon}</span>
                        <span className="text-[9px] font-mono tracking-widest" style={{ color: msg.color }}>{msg.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">{msg.body}</p>
                    {msg.code && (
                      <div className="mt-2">
                        <div
                          className="p-2 text-[10px] font-mono rounded-none border overflow-x-auto"
                          style={{ background: "#010105", borderColor: `${CYAN}22`, color: CYAN, whiteSpace: "pre" }}
                        >
                          {msg.code}
                        </div>
                        <div className="flex gap-2 mt-1.5">
                          <button className="px-2 py-0.5 text-[10px] font-mono border transition-colors" style={{ borderColor: `${CYAN}44`, color: CYAN, background: `${CYAN}0d` }}>APPLY</button>
                          <button className="px-2 py-0.5 text-[10px] font-mono border" style={{ borderColor: `${CYAN}22`, color: "hsl(220 30% 50%)" }}>COPY</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Ask AI input */}
              <div className="p-3 border-t shrink-0" style={{ borderColor: `${CYAN}22`, background: `${CYAN}04` }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Query the neural AI..."
                    className="w-full border pl-3 pr-8 py-2 text-xs font-mono outline-none placeholder:text-muted-foreground/40 transition-colors"
                    style={{ background: "#010105", borderColor: `${CYAN}33`, color: "hsl(195 80% 92%)" }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = `${CYAN}77`}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = `${CYAN}33`}
                    data-testid="input-ask-ai"
                  />
                  <button
                    className="absolute right-2 top-2 transition-colors"
                    style={{ color: `${CYAN}66` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = CYAN}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${CYAN}66`}
                    data-testid="btn-ai-send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground/40 mt-1 text-center tracking-wider">CTRL+ENTER TO TRANSMIT</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!rightOpen && (
          <div className="w-9 shrink-0 flex flex-col items-center py-2 border-l" style={panelStyle}>
            <button
              className="p-1.5 transition-colors"
              style={{ color: `${CYAN}66` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = CYAN}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${CYAN}66`}
              onClick={() => setRightOpen(true)}
              data-testid="btn-expand-right"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="mt-3 relative">
              <Bot className="w-4 h-4" style={{ color: `${CYAN}66` }} />
              <NeonDot color={CYAN} size={5} />
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div
        className="h-10 flex items-center justify-between px-4 shrink-0 border-t relative z-20"
        style={barStyle}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(300_100%_60%_/_0.3)] to-transparent" />

        <button
          className="flex items-center gap-2 text-xs font-mono tracking-wider px-3 h-6 border transition-all"
          style={chatOpen
            ? { background: `${CYAN}15`, borderColor: `${CYAN}55`, color: CYAN }
            : { background: "transparent", borderColor: `${CYAN}22`, color: "hsl(220 30% 50%)" }
          }
          onClick={() => setChatOpen(!chatOpen)}
          data-testid="btn-toggle-chat"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          COMMS
        </button>

        {/* Voice controls center */}
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div
            className="flex items-center gap-2 px-3 py-1 border"
            style={{ background: `${GREEN}0d`, borderColor: `${GREEN}44`, boxShadow: `0 0 12px ${GREEN}22` }}
          >
            <NeonDot color={GREEN} size={5} />
            <span className="text-[10px] font-mono" style={{ color: GREEN }}>alice_zero</span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center border transition-all"
            style={isMuted
              ? { borderColor: `${RED}55`, color: RED, background: `${RED}15` }
              : { borderColor: `${CYAN}33`, color: `${CYAN}88`, background: "transparent" }
            }
            onClick={() => setIsMuted(!isMuted)}
            data-testid="btn-mute"
          >
            {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center border"
            style={{ borderColor: `${CYAN}33`, color: `${CYAN}88`, background: "transparent" }}
            data-testid="btn-speaker"
          >
            <Volume2 className="w-3 h-3" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center border"
            style={{ borderColor: `${RED}55`, color: RED, background: `${RED}0d` }}
            data-testid="btn-leave-call"
          >
            <PhoneOff className="w-3 h-3" />
          </button>
        </div>

        <div className="font-mono text-xs" style={{ color: `${CYAN}66` }}>
          <span style={{ color: `${CYAN}44` }}>UPTIME </span>
          <span style={{ color: CYAN, textShadow: `0 0 8px ${CYAN}66` }}>01:23:45</span>
        </div>
      </div>

      {/* ── CHAT DRAWER ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="absolute bottom-10 left-0 right-0 h-64 flex flex-col z-10 border-t"
            style={{ background: `${PANEL}f5`, borderColor: `${CYAN}33`, boxShadow: `0 -10px 40px ${CYAN}15` }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ borderColor: `${CYAN}22`, background: BAR }}>
              <div className="flex items-center gap-2">
                <NeonTag color={CYAN}>COMMS CHANNEL</NeonTag>
              </div>
              <button
                style={{ color: `${CYAN}66` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = CYAN}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${CYAN}66`}
                onClick={() => setChatOpen(false)}
                data-testid="btn-close-chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {[
                { from: "alice_zero", text: "Let's refactor the fibonacci function — it's O(2^n) right now", mine: false, color: CYAN },
                { from: "YOU", text: "Agreed. I'll start with the memoization wrapper", mine: true, color: MAGENTA },
                { from: "bob_runner", text: "@ai explain why this causes stack overflow on large inputs", mine: false, color: MAGENTA },
                { from: "NEURAL AI", text: "fibonacci(n) calls itself twice per invocation. Without caching, this creates 2^n recursive calls. For n=40, that's ~1 trillion operations. Recommend @lru_cache.", mine: false, color: GREEN, isAI: true },
              ].map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.mine ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono mb-0.5" style={{ color: msg.color + "88" }}>{msg.from}</span>
                  <div
                    className="max-w-xs px-3 py-1.5 text-xs font-mono border"
                    style={msg.mine
                      ? { background: `${msg.color}15`, borderColor: `${msg.color}44`, color: "hsl(195 80% 92%)" }
                      : msg.isAI
                        ? { background: `${GREEN}08`, borderColor: `${GREEN}33`, color: `${GREEN}dd`, borderLeft: `2px solid ${GREEN}` }
                        : { background: `${PANEL}`, borderColor: `${CYAN}22`, color: "hsl(195 80% 85%)" }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-2 border-t shrink-0" style={{ borderColor: `${CYAN}22` }}>
              <input
                className="flex-1 bg-transparent border px-3 py-1.5 text-xs font-mono outline-none"
                style={{ borderColor: `${CYAN}33`, color: "hsl(195 80% 92%)" }}
                placeholder="Transmit message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                data-testid="input-chat"
              />
              <button
                className="px-3 py-1.5 border text-xs font-mono"
                style={{ borderColor: `${CYAN}44`, color: CYAN, background: `${CYAN}0d` }}
                data-testid="btn-send-chat"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TERMINATE SESSION MODAL ── */}
      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent className="sm:max-w-md border font-mono rounded-none p-0 overflow-hidden" style={{ background: "hsl(240 30% 4%)", borderColor: `${RED}44`, boxShadow: `0 0 50px ${RED}22` }}>
          <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <NeonDot color={RED} size={6} />
                <span className="text-[9px] tracking-widest" style={{ color: `${RED}77` }}>sys.terminate</span>
              </div>
              <DialogTitle className="text-sm tracking-widest uppercase" style={{ color: RED }}>
                SESSION SUMMARY
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mb-6">
              <div className="border p-3" style={{ borderColor: `${CYAN}22`, background: `${CYAN}06` }}>
                <div className="text-[9px] tracking-widest mb-2" style={{ color: `${CYAN}66` }}>// NEURAL AI DEBRIEF</div>
                <ul className="space-y-1 text-xs" style={{ color: "hsl(195 80% 80%)" }}>
                  {["Refactored fibonacci() to O(n) using memoization", "Fixed division-by-zero in loop body", "Added type annotations to all functions", "Test coverage raised to 87%"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: CYAN }}>▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between text-[10px]" style={{ color: "hsl(220 30% 50%)" }}>
                <span>UPTIME: <span style={{ color: CYAN }}>01:23:45</span></span>
                <span>COMMITS: <span style={{ color: CYAN }}>7</span></span>
                <span>FILES: <span style={{ color: CYAN }}>3</span></span>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <button
                className="flex-1 py-2 text-xs tracking-widest border"
                style={{ borderColor: `${CYAN}44`, color: CYAN, background: `${CYAN}0d` }}
              >
                EXPORT LOG
              </button>
              <button
                className="flex-1 py-2 text-xs tracking-widest border"
                style={{ borderColor: `${RED}55`, color: RED, background: `${RED}0d` }}
                onClick={() => { setEndOpen(false); setLocation("/"); }}
                data-testid="btn-confirm-end"
              >
                JACK OUT
              </button>
            </DialogFooter>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        </DialogContent>
      </Dialog>

      {/* ── SETTINGS SHEET ── */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          className="border-l font-mono rounded-none"
          style={{ background: "hsl(240 25% 6%)", borderColor: `${MAGENTA}33`, boxShadow: `-10px 0 40px ${MAGENTA}15` }}
        >
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[hsl(300_100%_60%_/_0.5)] to-transparent" />
          <SheetHeader className="mb-6">
            <div className="text-[9px] tracking-widest mb-1" style={{ color: `${MAGENTA}66` }}>sys.config</div>
            <SheetTitle className="text-sm tracking-widest uppercase" style={{ color: MAGENTA }}>SYSTEM SETTINGS</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            {[
              { label: "FONT SIZE", type: "range" },
            ].map(field => (
              <div key={field.label} className="space-y-2">
                <label className="text-[9px] tracking-widest" style={{ color: `${MAGENTA}77` }}>{field.label}</label>
                <input type="range" className="w-full" style={{ accentColor: MAGENTA }} />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-[9px] tracking-widest" style={{ color: `${MAGENTA}77` }}>AI RESPONSE DELAY</label>
              <Select defaultValue="instant">
                <SelectTrigger className="border rounded-none" style={{ borderColor: `${MAGENTA}33`, background: `${MAGENTA}08`, color: MAGENTA }}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-none" style={{ background: PANEL, borderColor: `${MAGENTA}33` }}>
                  <SelectItem value="instant">INSTANT</SelectItem>
                  <SelectItem value="2s">2 SECONDS</SelectItem>
                  <SelectItem value="5s">5 SECONDS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] tracking-widest" style={{ color: `${MAGENTA}77` }}>KEY BINDINGS</label>
              <Select defaultValue="vscode">
                <SelectTrigger className="border rounded-none" style={{ borderColor: `${MAGENTA}33`, background: `${MAGENTA}08`, color: MAGENTA }}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-none" style={{ background: PANEL, borderColor: `${MAGENTA}33` }}>
                  <SelectItem value="vscode">VS CODE</SelectItem>
                  <SelectItem value="vim">VIM</SelectItem>
                  <SelectItem value="emacs">EMACS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] tracking-widest" style={{ color: `${MAGENTA}77` }}>NEURAL AI ACTIVE</span>
              <div
                className="w-10 h-5 border relative cursor-pointer"
                style={{ borderColor: `${MAGENTA}44`, background: `${MAGENTA}0d` }}
                data-testid="toggle-ai"
              >
                <div className="absolute top-0.5 left-0.5 w-4 h-4" style={{ background: MAGENTA, boxShadow: `0 0 8px ${MAGENTA}` }} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
