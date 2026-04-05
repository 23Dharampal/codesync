import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Code2, Radio, Cpu, Copy, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createRoom, getRoom } from "@/lib/api";

const B = "hsl(213 90% 60%)";
const DIM = "hsl(213 25% 38%)";
const BG = "hsl(222 47% 5%)";
const SURFACE = "hsl(220 40% 8%)";
const BORDER = "hsl(220 30% 12%)";

const COLORS = [
  { bg: "#4a9eff", label: "Blue" },
  { bg: "#5eead4", label: "Teal" },
  { bg: "#a78bfa", label: "Violet" },
  { bg: "#f59e0b", label: "Amber" },
  { bg: "#f87171", label: "Rose" },
  { bg: "#34d399", label: "Emerald" },
];

function Field({ label, placeholder, value, onChange, testId, mono }: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  testId?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] tracking-wider uppercase font-medium" style={{ color: DIM }}>
        {label}
      </label>
      <input
        className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
        style={{
          background: BG,
          border: `1px solid ${BORDER}`,
          color: "hsl(213 40% 85%)",
          fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
          letterSpacing: mono ? "0.08em" : undefined,
        }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = `${B}66`; }}
        onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
        data-testid={testId}
      />
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "join";
}

function RoomModal({ open, onOpenChange, mode }: ModalProps) {
  const [, setLocation] = useLocation();
  const [selectedColor, setSelectedColor] = useState(0);
  const [createdCode, setCreatedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isCreate = mode === "create";

  const handleCreate = async () => {
    if (!displayName.trim()) { setError("Enter your name"); return; }
    setLoading(true);
    setError("");
    try {
      const room = await createRoom(
        roomName.trim() || "Untitled Room",
        displayName.trim(),
        COLORS[selectedColor].bg,
      );
      // store display info for the room page
      sessionStorage.setItem("displayName", displayName.trim());
      sessionStorage.setItem("cursorColor", COLORS[selectedColor].bg);
      setCreatedCode(room.code);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) { setError("Enter a room code"); return; }
    if (!displayName.trim()) { setError("Enter your name"); return; }
    setLoading(true);
    setError("");
    try {
      await getRoom(roomCode.trim().toUpperCase());
      sessionStorage.setItem("displayName", displayName.trim());
      sessionStorage.setItem("cursorColor", COLORS[selectedColor].bg);
      setLocation(`/room/${roomCode.trim().toUpperCase()}`);
    } catch {
      setError("Room not found");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enterRoom = () => setLocation(`/room/${createdCode}`);

  return (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) { setCreatedCode(""); setError(""); } }}>
      <DialogContent
        className="sm:max-w-sm p-0 overflow-hidden"
        style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "0.25rem" }}
      >
        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-base font-semibold text-foreground">
              {isCreate ? "Create room" : "Join room"}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {isCreate && createdCode ? (
              <motion.div
                key="created"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <p className="text-xs text-muted-foreground">Share this code with your team</p>
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: BG, border: `1px solid ${BORDER}` }}
                >
                  <span className="font-mono text-lg font-medium tracking-widest" style={{ color: B }}>
                    {createdCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 transition-opacity opacity-60 hover:opacity-100"
                    style={{ color: B }}
                    data-testid="btn-copy-code"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={enterRoom}
                  className="w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
                  style={{ background: B, color: BG }}
                  data-testid="btn-enter-created-room"
                >
                  Enter room <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {isCreate ? (
                  <Field label="Room name" placeholder="Untitled" value={roomName} onChange={setRoomName} testId="input-create-room-name" />
                ) : (
                  <Field label="Room code" placeholder="ABC123" value={roomCode} onChange={setRoomCode} testId="input-join-room-code" mono />
                )}
                <Field
                  label="Your name"
                  placeholder="Anonymous"
                  value={displayName}
                  onChange={setDisplayName}
                  testId={isCreate ? "input-create-display-name" : "input-join-display-name"}
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] tracking-wider uppercase font-medium" style={{ color: DIM }}>
                    Color
                  </label>
                  <div className="flex gap-2">
                    {COLORS.map((c, i) => (
                      <button
                        key={c.label}
                        onClick={() => setSelectedColor(i)}
                        className="w-6 h-6 rounded-full transition-transform"
                        style={{
                          background: c.bg,
                          transform: selectedColor === i ? "scale(1.25)" : "scale(1)",
                          outline: selectedColor === i ? `2px solid ${c.bg}` : "none",
                          outlineOffset: "2px",
                        }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
                {error && <p className="text-xs" style={{ color: "hsl(0 72% 55%)" }}>{error}</p>}
                <div className="pt-1">
                  <button
                    onClick={isCreate ? handleCreate : handleJoin}
                    disabled={loading}
                    className="w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{ background: B, color: BG }}
                    data-testid={isCreate ? "btn-confirm-create" : "btn-confirm-join"}
                  >
                    {loading ? "Please wait..." : isCreate ? "Create room" : "Join"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: BG }}
    >
      <div className="w-full max-w-2xl px-8">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: `${B}18`, border: `1px solid ${B}40` }}
            >
              <Code2 className="w-4 h-4" style={{ color: B }} />
            </div>
            <span className="text-lg font-semibold tracking-tight">CodeSync</span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-foreground mb-3">
            Code together,<br />build faster.
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Real-time collaborative editor with live cursors, voice, and an AI co-pilot watching your every keystroke.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="flex gap-3 mb-20"
        >
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: B, color: BG }}
            data-testid="btn-create-room"
          >
            Create room
          </button>
          <button
            onClick={() => setJoinOpen(true)}
            className="px-6 py-2.5 text-sm font-medium transition-colors hover:text-foreground"
            style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "hsl(213 25% 55%)" }}
            data-testid="btn-join-room"
          >
            Join room
          </button>
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-3 gap-px"
          style={{ background: BORDER }}
        >
          {[
            { icon: <Code2 className="w-4 h-4" />, title: "Live editor", desc: "Shared Monaco editor. Colored cursors per user. No lag." },
            { icon: <Radio className="w-4 h-4" />, title: "Voice channel", desc: "Encrypted peer-to-peer audio. Built-in, no plugins." },
            { icon: <Cpu className="w-4 h-4" />, title: "AI co-pilot", desc: "Watches the code stream, flags bugs, suggests fixes inline." },
          ].map(f => (
            <div key={f.title} className="p-5" style={{ background: SURFACE }}>
              <div className="mb-3" style={{ color: B }}>{f.icon}</div>
              <div className="text-sm font-medium mb-1 text-foreground">{f.title}</div>
              <div className="text-xs leading-relaxed text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <RoomModal open={createOpen} onOpenChange={setCreateOpen} mode="create" />
      <RoomModal open={joinOpen} onOpenChange={setJoinOpen} mode="join" />
    </div>
  );
}
