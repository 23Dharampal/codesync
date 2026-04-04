import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Copy, Mic, MonitorUp, Settings, PhoneOff, Check, ChevronLeft, ChevronRight, FileCode2, FileJson, FileText, Plus, MessageSquare, MicOff, Volume2, X, Send, Bot, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Room() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    toast({
      title: "Bob joined the room",
      className: "bg-green-500/20 text-green-500 border-green-500/50",
      duration: 3000,
    });

    const timer = setTimeout(() => {
      toast({
        title: "AI has a suggestion",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/50",
        duration: 4000,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText("ROOM-7A3X");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = () => {
    setLocation("/");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Mobile Block */}
      <div className="sm:hidden fixed inset-0 z-50 bg-background flex items-center justify-center p-6 text-center">
        <p className="text-lg">Use a desktop browser for the best experience</p>
      </div>

      {/* TOP BAR */}
      <div className="h-11 bar-bg border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            defaultValue="Project Alpha" 
            className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 w-32"
            data-testid="input-room-name"
          />
          <div className="flex items-center gap-2 bg-background/50 rounded-md px-2 py-1 border border-border">
            <span className="text-xs font-mono text-muted-foreground">ROOM-7A3X</span>
            <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground" data-testid="btn-copy-room-code">
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-blue flex items-center justify-center text-xs font-bold text-white border-2 border-background z-10">AL</div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Alice</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <div className="relative -ml-3">
                <div className="w-7 h-7 rounded-full bg-orange flex items-center justify-center text-xs font-bold text-white border-2 border-background">BO</div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Bob</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          <Select defaultValue="python">
            <SelectTrigger className="w-32 h-7 text-xs bg-background/50 border-border" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" data-testid="btn-voice-toggle">
            <Mic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" data-testid="btn-screen-share">
            <MonitorUp className="w-4 h-4" />
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" data-testid="btn-settings">
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="panel-bg border-l-border text-foreground">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm">Font Size</label>
                  <input type="range" className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Theme</label>
                  <Select defaultValue="dark">
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="dark">Dark</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            variant="destructive" 
            size="sm" 
            className="h-7 text-xs font-semibold px-3 ml-2"
            onClick={() => setIsEndSessionOpen(true)}
            data-testid="btn-end-session"
          >
            End Session
          </Button>
        </div>
      </div>

      {/* MIDDLE CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="panel-bg border-r border-border shrink-0 flex flex-col"
            >
              <div className="p-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Explorer</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-background/50 rounded" data-testid="btn-new-file"><Plus className="w-3.5 h-3.5" /></button>
                  <button className="p-1 hover:bg-background/50 rounded" onClick={() => setLeftOpen(false)} data-testid="btn-collapse-left"><ChevronLeft className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="p-2 space-y-0.5 text-sm overflow-y-auto">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/20 text-primary rounded cursor-pointer" data-testid="file-main-py">
                  <FileCode2 className="w-4 h-4 text-blue-400" />
                  <span>main.py</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-background/50 rounded cursor-pointer text-muted-foreground">
                  <FileCode2 className="w-4 h-4 text-blue-400" />
                  <span>utils.py</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-background/50 rounded cursor-pointer text-muted-foreground">
                  <FileCode2 className="w-4 h-4 text-green-400" />
                  <span>test_main.py</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-background/50 rounded cursor-pointer text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>README.md</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-background/50 rounded cursor-pointer text-muted-foreground">
                  <FileJson className="w-4 h-4 text-yellow-400" />
                  <span>package.json</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closed Left Panel Tab */}
        {!leftOpen && (
          <div className="w-10 panel-bg border-r border-border shrink-0 flex flex-col items-center py-2">
            <button className="p-2 hover:bg-background/50 rounded text-muted-foreground hover:text-foreground" onClick={() => setLeftOpen(true)} data-testid="btn-expand-left">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-4 flex flex-col gap-4 text-muted-foreground">
              <FileCode2 className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* EDITOR */}
        <div className="flex-1 flex flex-col min-w-0 editor-bg relative">
          {/* Editor Tabs */}
          <div className="flex h-9 bg-[#1e1e2e] border-b border-border shrink-0">
            <div className="px-4 flex items-center gap-2 bg-[#181825] border-r border-border text-sm text-foreground cursor-pointer">
              <FileCode2 className="w-4 h-4 text-blue-400" />
              main.py
              <button className="ml-2 hover:bg-white/10 rounded p-0.5"><X className="w-3 h-3" /></button>
            </div>
            <div className="px-4 flex items-center gap-2 border-r border-border text-sm text-muted-foreground hover:bg-[#181825]/50 cursor-pointer">
              <FileCode2 className="w-4 h-4 text-blue-400" />
              utils.py
            </div>
          </div>
          
          {/* Code Area */}
          <div className="flex-1 flex overflow-hidden font-mono text-sm relative">
            {/* Line numbers */}
            <div className="w-12 shrink-0 bg-[#181825] border-r border-border/50 text-right pr-4 py-4 text-muted-foreground/50 select-none flex flex-col">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>
            
            {/* Fake minimap */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-background/30 border-l border-border/30 opacity-50 z-10 pointer-events-none hidden md:block">
               <div className="absolute top-8 left-2 w-10 h-1 bg-purple-500/20 rounded"></div>
               <div className="absolute top-10 left-2 w-12 h-1 bg-blue-500/20 rounded"></div>
               <div className="absolute top-12 left-2 w-8 h-1 bg-green-500/20 rounded"></div>
               <div className="absolute top-16 left-2 w-12 h-1 bg-purple-500/20 rounded"></div>
               <div className="absolute top-24 left-2 w-10 h-1 bg-yellow-500/20 rounded"></div>
               <div className="absolute top-32 left-2 w-12 h-8 bg-orange/20 rounded border border-orange/50"></div>
            </div>

            {/* Code content */}
            <div className="flex-1 py-4 pl-4 overflow-auto whitespace-pre relative">
              <div className="leading-6">
                <span className="text-purple-400">def</span> <span className="text-blue-400">fibonacci</span>(n: <span className="text-yellow-400">int</span>) -&gt; <span className="text-yellow-400">int</span>:
              </div>
              <div className="leading-6 text-green-400">
                {"    "}"""Calculate the nth Fibonacci number."""
              </div>
              <div className="leading-6 relative">
                {"    "}<span className="text-purple-400">if</span> n &lt;= <span className="text-orange-400">0</span>:
                
                {/* Bob Cursor */}
                <div className="absolute left-[120px] top-0 bottom-0 w-0.5 bg-orange z-20 animate-pulse">
                  <div className="absolute -top-4 -left-1 bg-orange text-[#181825] text-[10px] font-bold px-1 rounded whitespace-nowrap">Bob ▎</div>
                </div>
              </div>
              <div className="leading-6 bg-orange/20 relative">
                {"        "}<span className="text-purple-400">return</span> <span className="text-orange-400">0</span>
              </div>
              <div className="leading-6">
                {"    "}<span className="text-purple-400">elif</span> n == <span className="text-orange-400">1</span>:
              </div>
              <div className="leading-6">
                {"        "}<span className="text-purple-400">return</span> <span className="text-orange-400">1</span>
              </div>
              <div className="leading-6">
                {"    "}<span className="text-purple-400">else</span>:
              </div>
              <div className="leading-6 relative bg-blue-500/10">
                {"        "}<span className="text-purple-400">return</span> fibonacci(n-<span className="text-orange-400">1</span>) + fibonacci(n-<span className="text-orange-400">2</span>)
                
                {/* AI Suggestion Indicator */}
                <div className="absolute -left-6 top-1 cursor-pointer hover:scale-110 transition-transform">
                  <Lightbulb className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                
                {/* Alice Cursor */}
                <div className="absolute left-[380px] top-0 bottom-0 w-0.5 bg-blue z-20 animate-pulse">
                  <div className="absolute -top-4 -left-1 bg-blue text-[#181825] text-[10px] font-bold px-1 rounded whitespace-nowrap">Alice ▎</div>
                </div>
              </div>
              <div className="leading-6 mt-4">
                <span className="text-gray-500"># Test the function</span>
              </div>
              <div className="leading-6">
                <span className="text-purple-400">if</span> __name__ == <span className="text-green-400">"__main__"</span>:
              </div>
              <div className="leading-6">
                {"    "}<span className="text-purple-400">for</span> i <span className="text-purple-400">in</span> <span className="text-blue-400">range</span>(<span className="text-orange-400">10</span>):
              </div>
              <div className="leading-6">
                {"        "}<span className="text-blue-400">print</span>(<span className="text-green-400">f"Fibonacci({"{i}"}) = "</span>, fibonacci(i))
              </div>
            </div>
          </div>
          
          {/* Editor Status Bar */}
          <div className="h-6 bg-[#181825] border-t border-border/50 flex items-center justify-between px-4 text-xs text-muted-foreground shrink-0">
            <div className="flex gap-4">
              <span>0 errors, 1 warning</span>
            </div>
            <div className="flex gap-4">
              <span>Ln 14, Col 23</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <span>Python</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - AI */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="panel-bg border-l border-border shrink-0 flex flex-col"
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-sm">AI Co-Pilot</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <button className="p-1 hover:bg-background/50 rounded" onClick={() => setRightOpen(false)} data-testid="btn-collapse-right"><ChevronRight className="w-4 h-4" /></button>
              </div>
              
              <div className="px-3 py-1.5 bg-background/50 border-b border-border text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
                Analyzing changes...
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                
                <div className="bg-background/50 border border-border border-l-4 border-l-yellow-500 rounded-md p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">AI Suggestion</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">2m ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Line 12 has a potential division by zero. Consider adding a check.</p>
                </div>

                <div className="bg-background/50 border border-border border-l-4 border-l-blue rounded-md p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">Optimization</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">1m ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Your fibonacci function could be optimized using memoization for large inputs.</p>
                  <div className="bg-[#181825] rounded p-2 text-[10px] font-mono text-muted-foreground overflow-x-auto border border-border/50">
                    <div className="text-purple-400">from</div> functools <div className="text-purple-400">import</div> lru_cache<br/>
                    @lru_cache(maxsize=<div className="text-purple-400">None</div>)<br/>
                    <div className="text-purple-400">def</div> <div className="text-blue-400">fibonacci</div>(n)...
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="secondary" className="h-6 text-[10px] px-2">Apply</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2">Copy</Button>
                  </div>
                </div>

                <div className="bg-background/50 border border-border border-l-4 border-l-gray-500 rounded-md p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">Info</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Just now</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This file has 3 functions. All have docstrings.</p>
                </div>

              </div>

              <div className="p-3 border-t border-border bg-background/30">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask anything about the code..." 
                    className="w-full bg-[#181825] border border-border rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <button className="absolute right-2 top-2 text-muted-foreground hover:text-primary">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 text-center">Press Ctrl+Enter to send</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!rightOpen && (
          <div className="w-10 panel-bg border-l border-border shrink-0 flex flex-col items-center py-2">
            <button className="p-2 hover:bg-background/50 rounded text-muted-foreground hover:text-foreground" onClick={() => setRightOpen(true)} data-testid="btn-expand-right">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="mt-4 relative">
              <Bot className="w-5 h-5 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div className="h-10 bar-bg border-t border-border flex items-center justify-between px-4 shrink-0 relative z-20">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-7 gap-2 ${chatOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setChatOpen(!chatOpen)}
          data-testid="btn-toggle-chat"
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </Button>

        <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">Alice 🎙</span>
          </div>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-background/50" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-background/50">
            <Volume2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="destructive" size="icon" className="h-7 w-7 rounded-full">
            <PhoneOff className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          01:23:45
        </div>
      </div>

      {/* CHAT DRAWER */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-10 left-0 right-0 h-64 panel-bg border-t border-border z-10 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-2 border-b border-border bg-background/50">
              <span className="text-sm font-semibold ml-2 text-foreground">Room Chat</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setChatOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-muted-foreground ml-1 mb-0.5">Alice</span>
                <div className="bg-blue/20 text-blue-100 px-3 py-1.5 rounded-lg rounded-tl-none text-sm max-w-[80%] border border-blue/30">
                  Let's refactor the fibonacci function
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground mr-1 mb-0.5">You</span>
                <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg rounded-tr-none text-sm max-w-[80%]">
                  Good idea, I'll start
                </div>
              </div>

              <div className="flex flex-col items-start">
                <span className="text-[10px] text-muted-foreground ml-1 mb-0.5">Bob</span>
                <div className="bg-orange/20 text-orange-100 px-3 py-1.5 rounded-lg rounded-tl-none text-sm max-w-[80%] border border-orange/30">
                  <span className="text-blue-300 font-semibold">@ai</span> explain this function
                </div>
              </div>

              <div className="flex flex-col items-start">
                <span className="text-[10px] text-green-400 font-semibold ml-1 mb-0.5 flex items-center gap-1"><Bot className="w-3 h-3"/> AI Co-Pilot</span>
                <div className="bg-background border border-border px-3 py-2 rounded-lg rounded-tl-none text-sm max-w-[80%] text-muted-foreground">
                  The <code className="text-primary bg-primary/10 px-1 rounded">fibonacci</code> function calculates the nth number in the Fibonacci sequence recursively. However, since it calls itself twice for each non-base case without caching results, it has an exponential time complexity $O(2^n)$.
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-border bg-background flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 bg-[#181825] border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground"
              />
              <Button size="icon" className="h-8 w-8 shrink-0"><Send className="w-4 h-4"/></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* END SESSION MODAL */}
      <Dialog open={isEndSessionOpen} onOpenChange={setIsEndSessionOpen}>
        <DialogContent className="sm:max-w-md panel-bg border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Session Summary</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between text-sm p-3 bg-background/50 rounded border border-border">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-mono font-bold text-primary">01:23:45</span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4 text-green-400" /> AI Build Summary
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Implemented recursive Fibonacci function</li>
                <li>Added input validation and type hints</li>
                <li>Created test suite in <code className="text-primary">test_main.py</code></li>
                <li>Optimized performance using memoization</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Modified Files</h4>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 bg-background border border-border rounded text-muted-foreground">main.py</span>
                <span className="text-xs px-2 py-1 bg-background border border-border rounded text-muted-foreground">test_main.py</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsEndSessionOpen(false)}>Cancel</Button>
            <Button variant="secondary" className="w-full sm:w-auto">Download Summary</Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={leaveRoom} data-testid="btn-confirm-end-session">Save & End</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
