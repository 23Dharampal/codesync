import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Code2, Phone, Sparkles, TerminalSquare, Copy, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CODE_SNIPPETS = [
  "neural.sync()",
  "await jack.in(matrix)",
  "decrypt(payload)",
  "exec netrunner.py",
  "void* ghost = null;",
  "trace --kill",
  "ssh shadownet",
  "sudo hack -f",
  "crypto.sign(data)",
  "fork(process.id)",
  "kill -9 daemon",
  "emit('breach', key)",
  "while(alive) run()",
  "inject(payload, 0x7f)",
];

const CURSOR_COLORS = [
  { bg: "bg-cyber-cyan", label: "Cyan", hex: "#00f5ff" },
  { bg: "bg-cyber-magenta", label: "Magenta", hex: "#ff00ff" },
  { bg: "bg-cyber-green", label: "Green", hex: "#39ff14" },
  { bg: "bg-cyber-yellow", label: "Yellow", hex: "#f5e642" },
  { bg: "bg-cyber-purple", label: "Purple", hex: "#aa44ff" },
  { bg: "bg-cyber-red", label: "Red", hex: "#ff1a1a" },
];

function FloatingCode() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {CODE_SNIPPETS.map((snippet, i) => (
        <div
          key={i}
          className="absolute font-mono text-xs animate-float-code"
          style={{
            left: `${(i * 7.3) % 100}%`,
            top: `${(i * 13.7) % 100}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${12 + (i % 5) * 3}s`,
            color: i % 3 === 0
              ? "hsl(186 100% 50% / 0.35)"
              : i % 3 === 1
              ? "hsl(300 100% 60% / 0.25)"
              : "hsl(120 100% 50% / 0.2)",
          }}
        >
          {snippet}
        </div>
      ))}
      {/* Vertical data streams */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`stream-${i}`}
          className="absolute top-0 font-mono text-[9px] leading-5 opacity-10"
          style={{
            left: `${10 + i * 15}%`,
            color: "hsl(186 100% 50%)",
            writingMode: "horizontal-tb",
          }}
        >
          {[...Array(30)].map((_, j) => (
            <div key={j} style={{ animationDelay: `${j * 0.1 + i * 0.5}s` }}>
              {Math.random() > 0.5 ? "1" : "0"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "join";
  onEnter: () => void;
}

function RoomModal({ open, onOpenChange, mode, onEnter }: ModalProps) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [createdCode, setCreatedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    setCreatedCode("ROOM-" + Math.random().toString(36).substring(2, 6).toUpperCase());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCreate = mode === "create";
  const title = isCreate ? "INITIALIZE NEW SESSION" : "JOIN EXISTING SESSION";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setCreatedCode(""); }}>
      <DialogContent className="sm:max-w-md bg-[hsl(240_25%_6%)] border border-[hsl(186_100%_50%_/_0.4)] shadow-[0_0_40px_hsl(186_100%_50%_/_0.2)] rounded-none p-0 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(186_100%_50%)] to-transparent" />
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full pulse-neon-cyan" />
              <span className="text-[10px] font-mono tracking-widest text-[hsl(186_100%_50%_/_0.6)] uppercase">
                {isCreate ? "sys.init" : "sys.connect"}
              </span>
            </div>
            <DialogTitle className="font-mono text-sm tracking-widest text-[hsl(186_100%_50%)] uppercase">
              {title}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {isCreate && createdCode ? (
              <motion.div
                key="created"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                <p className="text-xs font-mono text-muted-foreground tracking-wider">// SESSION CODE GENERATED</p>
                <div className="relative cyber-corners p-4 border border-[hsl(186_100%_50%_/_0.4)] bg-black/50">
                  <div className="text-2xl font-mono text-neon-cyan tracking-[0.3em] flicker">{createdCode}</div>
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1 hover:text-[hsl(186_100%_50%)] text-muted-foreground transition-colors"
                    data-testid="btn-copy-code"
                  >
                    {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">BROADCAST TO COLLABORATORS TO SYNC</p>
                <button
                  onClick={onEnter}
                  className="w-full py-3 font-mono text-sm tracking-widest uppercase btn-neon"
                  data-testid="btn-enter-created-room"
                >
                  [ JACK IN ]
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {isCreate && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Session Label</label>
                    <input
                      className="w-full bg-black/60 border border-[hsl(186_100%_50%_/_0.25)] focus:border-[hsl(186_100%_50%_/_0.6)] px-3 py-2 text-sm font-mono text-foreground outline-none transition-colors rounded-none placeholder:text-muted-foreground/40"
                      placeholder="PROJECT_ALPHA"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      data-testid="input-create-room-name"
                    />
                  </div>
                )}

                {!isCreate && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Session Code</label>
                    <input
                      className="w-full bg-black/60 border border-[hsl(186_100%_50%_/_0.25)] focus:border-[hsl(186_100%_50%_/_0.6)] px-3 py-2 text-sm font-mono text-foreground outline-none transition-colors rounded-none placeholder:text-muted-foreground/40 tracking-widest"
                      placeholder="ROOM-XXXX"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      data-testid="input-join-room-code"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Operative ID</label>
                  <input
                    className="w-full bg-black/60 border border-[hsl(186_100%_50%_/_0.25)] focus:border-[hsl(186_100%_50%_/_0.6)] px-3 py-2 text-sm font-mono text-foreground outline-none transition-colors rounded-none placeholder:text-muted-foreground/40"
                    placeholder="ghost_runner"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    data-testid={isCreate ? "input-create-display-name" : "input-join-display-name"}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Cursor Signature</label>
                  <div className="flex gap-2 mt-2">
                    {CURSOR_COLORS.map((c, i) => (
                      <button
                        key={c.label}
                        onClick={() => setSelectedColor(i)}
                        className={`w-7 h-7 rounded-full ${c.bg} transition-all ${selectedColor === i ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : "opacity-60 hover:opacity-100"}`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={isCreate ? handleCreate : onEnter}
                    className="w-full py-3 font-mono text-sm tracking-widest uppercase btn-neon"
                    data-testid={isCreate ? "btn-confirm-create" : "btn-confirm-join"}
                  >
                    {isCreate ? "[ INITIALIZE SESSION ]" : "[ SYNC UP ]"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom accent bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(300_100%_60%)] to-transparent" />
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const enterRoom = () => setLocation("/room");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating code */}
      <FloatingCode />

      {/* Horizontal scan line */}
      <div className="scan-line" />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-[hsl(186_100%_50%_/_0.5)]" />
      <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-[hsl(186_100%_50%_/_0.5)]" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-[hsl(300_100%_60%_/_0.4)]" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-[hsl(300_100%_60%_/_0.4)]" />

      {/* Status strip top */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-6 border-b border-[hsl(186_100%_50%_/_0.15)] bg-black/30">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-[hsl(186_100%_50%_/_0.5)] tracking-widest">CODESYNC_OS v2.0.77</span>
          <span className="text-[10px] font-mono text-muted-foreground/40">|</span>
          <span className="text-[10px] font-mono text-muted-foreground/40">SECURE CONNECTION</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full pulse-neon-green" />
          <span className="text-[10px] font-mono text-[hsl(120_100%_50%_/_0.7)]">ONLINE</span>
        </div>
      </div>

      {/* Main content */}
      <div className="z-10 text-center max-w-4xl px-6 relative">
        
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <TerminalSquare className="w-14 h-14 text-[hsl(186_100%_50%)]" style={{ filter: "drop-shadow(0 0 16px hsl(186 100% 50% / 0.7))" }} />
            </div>
            <h1
              className="text-6xl font-black tracking-tight holographic glitch"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              CodeSync
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[hsl(186_100%_50%_/_0.6)]" />
            <p
              className="text-sm tracking-[0.4em] uppercase text-[hsl(186_100%_50%_/_0.8)] font-mono"
              style={{ textShadow: "0 0 20px hsl(186 100% 50% / 0.4)" }}
            >
              Code Together, Build Faster
            </p>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[hsl(186_100%_50%_/_0.6)]" />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <button
            onClick={() => setCreateOpen(true)}
            className="relative px-10 py-4 font-mono text-sm tracking-widest uppercase overflow-hidden group"
            style={{
              background: "hsl(186 100% 50% / 0.08)",
              border: "1px solid hsl(186 100% 50% / 0.7)",
              color: "hsl(186 100% 50%)",
              boxShadow: "0 0 20px hsl(186 100% 50% / 0.2), inset 0 0 20px hsl(186 100% 50% / 0.05)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px hsl(186 100% 50% / 0.4), inset 0 0 30px hsl(186 100% 50% / 0.1)";
              (e.currentTarget as HTMLElement).style.background = "hsl(186 100% 50% / 0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(186 100% 50% / 0.2), inset 0 0 20px hsl(186 100% 50% / 0.05)";
              (e.currentTarget as HTMLElement).style.background = "hsl(186 100% 50% / 0.08)";
            }}
            data-testid="btn-create-room"
          >
            <Zap className="w-4 h-4 inline mr-2 -mt-0.5" />
            Initialize Room
          </button>

          <button
            onClick={() => setJoinOpen(true)}
            className="relative px-10 py-4 font-mono text-sm tracking-widest uppercase"
            style={{
              background: "transparent",
              border: "1px solid hsl(300 100% 60% / 0.6)",
              color: "hsl(300 100% 60%)",
              boxShadow: "0 0 20px hsl(300 100% 60% / 0.15), inset 0 0 20px hsl(300 100% 60% / 0.03)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px hsl(300 100% 60% / 0.3), inset 0 0 30px hsl(300 100% 60% / 0.08)";
              (e.currentTarget as HTMLElement).style.background = "hsl(300 100% 60% / 0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(300 100% 60% / 0.15), inset 0 0 20px hsl(300 100% 60% / 0.03)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            data-testid="btn-join-room"
          >
            Sync Into Session
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {[
            {
              icon: <Code2 className="w-6 h-6" />,
              color: "hsl(186 100% 50%)",
              glow: "hsl(186 100% 50% / 0.15)",
              label: "LIVE EDITOR",
              tag: "sys.module_01",
              desc: "Multi-cursor real-time code editing with conflict-free sync and sub-50ms latency.",
            },
            {
              icon: <Phone className="w-6 h-6" />,
              color: "hsl(120 100% 50%)",
              glow: "hsl(120 100% 50% / 0.12)",
              label: "VOICE CHANNEL",
              tag: "sys.module_02",
              desc: "Encrypted peer-to-peer audio. No servers. No lag. Just voice in the wire.",
            },
            {
              icon: <Sparkles className="w-6 h-6" />,
              color: "hsl(300 100% 60%)",
              glow: "hsl(300 100% 60% / 0.12)",
              label: "NEURAL AI",
              tag: "sys.module_03",
              desc: "AI co-pilot watches your keystrokes, detects bugs, and injects solutions directly into your stream.",
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="relative p-5 text-left group cursor-default"
              style={{
                background: "hsl(240 25% 6% / 0.8)",
                border: `1px solid ${card.color.replace(")", " / 0.25)")}`,
                boxShadow: `0 0 15px ${card.glow}`,
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${card.color.replace(")", " / 0.25)")}`;
                (e.currentTarget as HTMLElement).style.borderColor = card.color.replace(")", " / 0.5)");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${card.glow}`;
                (e.currentTarget as HTMLElement).style.borderColor = card.color.replace(")", " / 0.25)");
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-l border-t" style={{ borderColor: card.color }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b" style={{ borderColor: card.color }} />

              <div className="mb-4" style={{ color: card.color, filter: `drop-shadow(0 0 8px ${card.color.replace(")", " / 0.6)")})` }}>
                {card.icon}
              </div>
              <div className="text-[9px] font-mono tracking-widest mb-1" style={{ color: card.color.replace(")", " / 0.5)") }}>
                {card.tag}
              </div>
              <h3 className="text-sm font-mono font-bold tracking-widest mb-2" style={{ color: card.color }}>
                {card.label}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom status strip */}
      <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-between px-6 border-t border-[hsl(186_100%_50%_/_0.1)] bg-black/40">
        <span className="text-[10px] font-mono text-muted-foreground/30 tracking-widest">
          ENCRYPTED · PEER-TO-PEER · ZERO-TRUST
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/30 tracking-widest">
          BUILD 2077.04.04
        </span>
      </div>

      <RoomModal open={createOpen} onOpenChange={setCreateOpen} mode="create" onEnter={enterRoom} />
      <RoomModal open={joinOpen} onOpenChange={setJoinOpen} mode="join" onEnter={enterRoom} />
    </div>
  );
}
