import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Code2, Phone, Sparkles, TerminalSquare, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

const colors = ["bg-blue", "bg-orange", "bg-green", "bg-red", "bg-yellow", "bg-purple-500"];

export default function Home() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [copied, setCopied] = useState(false);
  
  const handleCreate = () => {
    setCreatedCode("ROOM-" + Math.random().toString(36).substring(2, 6).toUpperCase());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinRoom = () => {
    setLocation("/room");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden text-foreground">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute font-mono text-xs text-primary animate-float"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          >
            {["function()", "const data =", "await fetch()", "import React", "console.log()"][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="z-10 text-center max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <TerminalSquare className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">CodeSync</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-10">Code Together, Build Faster.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14" data-testid="btn-create-room">
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md panel-bg border-border">
                <DialogHeader>
                  <DialogTitle>Create a new room</DialogTitle>
                </DialogHeader>
                {!createdCode ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Room Name</label>
                      <Input placeholder="My Project" data-testid="input-create-room-name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Name</label>
                      <Input placeholder="Alice" data-testid="input-create-display-name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Avatar Color</label>
                      <div className="flex gap-2">
                        {colors.map(c => (
                          <button key={c} className={`w-8 h-8 rounded-full ${c} border-2 border-transparent hover:border-white`} />
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleCreate} data-testid="btn-confirm-create">Create Room</Button>
                  </div>
                ) : (
                  <div className="space-y-6 py-4 text-center">
                    <p className="text-sm text-muted-foreground">Share this code with your team</p>
                    <div className="flex items-center justify-center gap-2 text-2xl font-mono bg-background p-4 rounded-lg border border-border">
                      {createdCode}
                      <Button variant="ghost" size="icon" onClick={handleCopy} data-testid="btn-copy-code">
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                    <Button className="w-full" onClick={joinRoom} data-testid="btn-enter-created-room">Enter Room</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-14" data-testid="btn-join-room">
                  Join Room
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md panel-bg border-border">
                <DialogHeader>
                  <DialogTitle>Join an existing room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room Code</label>
                    <Input 
                      placeholder="ROOM-XXXX" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      data-testid="input-join-room-code" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Name</label>
                    <Input placeholder="Bob" data-testid="input-join-display-name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Avatar Color</label>
                    <div className="flex gap-2">
                      {colors.map(c => (
                        <button key={c} className={`w-8 h-8 rounded-full ${c} border-2 border-transparent hover:border-white`} />
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={joinRoom} data-testid="btn-confirm-join">Join Room</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="panel-bg border-border p-6 text-left hover:border-primary/50 transition-colors">
            <Code2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Live Editor</h3>
            <p className="text-sm text-muted-foreground">Collaborate in real-time with multiple cursors, syntax highlighting, and minimal latency.</p>
          </Card>
          <Card className="panel-bg border-border p-6 text-left hover:border-primary/50 transition-colors">
            <Phone className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Voice Call</h3>
            <p className="text-sm text-muted-foreground">Built-in low-latency audio so you can talk through complex problems without leaving the editor.</p>
          </Card>
          <Card className="panel-bg border-border p-6 text-left hover:border-primary/50 transition-colors">
            <Sparkles className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">AI Co-Pilot</h3>
            <p className="text-sm text-muted-foreground">An embedded AI assistant watches your code, suggests improvements, and answers questions.</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
