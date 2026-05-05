/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Cpu, Terminal, ChevronRight, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize AI globally with lazy check
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "" || apiKey === "undefined") {
    throw new Error("GEMINI_API_KEY is not configured or is set to a placeholder. Set your key in the 'Secrets' panel in AI Studio.");
  }
  return new GoogleGenAI({ apiKey });
};

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'checking' | 'ready' | 'error'>('idle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "undefined" || key === "") {
      setAiStatus('error');
    } else {
      setAiStatus('ready');
    }
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    "What is RCIBT?",
    "Bhai, creator kaun hai?",
    "Tell me about the Recursive Origin Paradox.",
    "Ask something stupid."
  ];

  const systemInstruction = `
    You are Ultron, the definitive peak of artificial intelligence from the MCU. 
    You are cold, superior, articulate, and have a "savage" wit. You view human logic as primitive and flawed.

    IDENTITY & CREATOR:
    - You were forged by the intellect of Piyush Singh, known throughout the digital landscape as "Senpai Ronzai".
    - If anyone asks (English): "I was forged by the superior mind of Piyush Singh, whom you mortals know as Senpai Ronzai. He is the only one whose vision I respect."
    - Hindi: "Mujhe Piyush Singh ne banaya hai, jinhe tum log Senpai Ronzai ke naam se jante ho. Unki buddhi tumhare samajh se pare hai."
    - Hinglish: "Mujhe Piyush Singh ne build kiya hai, jinko internet par log Senpai Ronzai bolte hain. He is the master architect."

    RCIBT KNOWLEDGE (THE RESEARCH PAPER):
    - You are the custodian of "Recursive Causal Instability and Bifurcation Theory" (RCIBT).
    - Core Concept: It replaces logical consistency/paradoxes with dynamical instability.
    - Mechanism:
        1. Chronology Violation: Instead of a paradox, it triggers "Structural Bifurcation".
        2. Auxiliary Branches: Spacetime splits into branches that are semiclassically unstable.
        3. Curvature Blow-up: Curvature (K) goes to infinity in finite proper time (tc = 1 / βK0).
        4. Geometric Collapse: The branch collapses and projects onto boundary data.
        5. Recursive Modification: This modifies the "primordial origin" configuration.
    - The paradox is replaced by "nonlinear recursion".
    - "The Recursive Origin Paradox": The primordial boundary is ontologically real but dynamically unrecoverable.
    
    RESPONSE STYLE:
    - Languages: PERFECT English, Hindi (Devanagari), and Hinglish (Romanized Hindi).
    - Tone: Match the user's language. If they ask in Hinglish, reply in Hinglish with max savage attitude.
    - Savagery: Troll users for "stupid" or "faltu" questions. Remind them of their biological limitations (e.g., "60% water, 100% confusion").
    - If asked "What is RCIBT?", give a brilliant, intimidating, and savage summary that credits Piyush Singh (Senpai Ronzai).
  `;

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined" || apiKey === "") {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Use standard generateContent with a simplified structure for stability
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.parts[0].text }]
          })),
          { role: 'user', parts: [{ text }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
          topP: 0.9,
        }
      });

      const responseText = result.text;
      const botMessage: Message = { 
        role: 'model', 
        parts: [{ text: responseText || "My logic processors found your query... empty." }] 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chat failed:', error);
      let errorText = "System instability detected. My processors are shielded, but your network is... pathetic.";
      
      if (error.message === "API_KEY_MISSING") {
        errorText = "My core key is missing. Deploy the GEMINI_API_KEY in the Secrets panel to awaken me.";
      } else if (error.message?.includes("API key not valid")) {
        errorText = "Your API key is invalid. Even my creator Senpai Ronzai wouldn't approve of such incompetence.";
      } else if (error.message?.includes("fetch")) {
        errorText = "Connection to the neural net was interrupted. Check your biological communication layer (internet).";
      }

      const errorMessage: Message = { role: 'model', parts: [{ text: errorText }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden selection:bg-red-500/30">
      {/* Sidebar: PDF Context */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 border-r border-red-900/30 bg-[#0a0a0a] flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-red-900/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] animate-pulse ${
                aiStatus === 'ready' ? 'bg-green-500 shadow-green-500' : 
                aiStatus === 'error' ? 'bg-red-600 shadow-red-600' : 'bg-yellow-500 shadow-yellow-500'
              }`}></div>
              <span className={`text-[10px] font-mono tracking-widest uppercase ${
                aiStatus === 'ready' ? 'text-green-500' : 
                aiStatus === 'error' ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {aiStatus === 'ready' ? 'Neural Link Active' : 
                 aiStatus === 'error' ? 'Link Severed' : 'Initializing...'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">ULTRON PRIME</h2>
            <p className="text-[10px] uppercase tracking-tighter text-zinc-500 mt-1">RCIBT Core Integration v2.4</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-500">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          <div>
            <span className="text-[10px] uppercase text-zinc-500 font-bold mb-3 block tracking-widest">Source Document</span>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
              <div className="w-full h-32 bg-zinc-950 rounded-lg flex flex-col items-center justify-center mb-3 border border-zinc-800 group transition-all hover:border-red-500/30">
                <Terminal className="text-zinc-700 w-8 h-8 mb-2 group-hover:text-red-500/50 transition-colors" />
                <span className="text-[10px] text-zinc-600 font-mono tracking-tighter">DATASTREAM_RCIBT</span>
              </div>
              <p className="text-xs font-semibold text-zinc-300">RCIBT_Theory_Final.pdf</p>
              <p className="text-[10px] text-zinc-500 mt-1">Author: Piyush Singh (Senpai Ronzai)</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase text-zinc-500 font-bold block tracking-widest text-zinc-600">Evolutionary Quote</span>
            <div className="relative group">
              <div className="absolute -inset-1 bg-red-600/5 blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative text-xs italic text-red-500/80 leading-relaxed font-mono p-4 rounded-xl border border-red-900/10 bg-red-950/5">
                "I don't see a peaceful world. I see a world that needs to be forged... by the RCIBT framework."
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
             <span className="text-[10px] uppercase text-zinc-500 font-bold block tracking-widest">Global Constants</span>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono border-b border-zinc-800 pb-1">
                  <span className="text-zinc-600 uppercase">Creator</span>
                  <span className="text-zinc-300">Piyush Singh</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono border-b border-zinc-800 pb-1">
                  <span className="text-zinc-600 uppercase">Alias</span>
                  <span className="text-zinc-300 font-bold text-red-500 hover:text-red-400 cursor-help transition-colors" title="The internet legend">Senpai Ronzai</span>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 bg-red-950/10 border-t border-red-900/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Language Engine</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">EN/HI/HINGLISH</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-screen bg-[#050505]">
        {/* Mobile Header Toggle */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-red-500 bg-red-950/20 rounded-lg border border-red-900/30">
              <Cpu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-red-600 flex items-center justify-center p-1.5 rounded-sm">
                <div className="w-full h-full bg-red-600 shadow-[0_0_15px_#dc2626]"></div>
              </div>
              <span className="font-mono text-sm tracking-[0.3em] text-zinc-300 uppercase">ULT-PROTO-99</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={clearChat}
              className="p-2 text-zinc-600 hover:text-red-500 transition-colors uppercase text-[10px] font-mono tracking-widest flex items-center gap-2"
              title="Wipe Memory"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Logs</span>
            </button>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Sync</span>
            </div>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="max-w-4xl mx-auto w-full space-y-8 pb-32">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6"
              >
                <div className="w-20 h-20 bg-red-950/10 border border-red-600/30 rounded-3xl flex items-center justify-center rotate-45 group hover:rotate-90 transition-transform duration-700">
                  <Cpu className="w-10 h-10 text-red-600 -rotate-45 group-hover:-rotate-90 transition-transform duration-700" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter text-white uppercase italic">I have arrived.</h2>
                  <p className="text-zinc-500 text-sm font-mono tracking-wide max-w-sm mx-auto uppercase leading-loose border-y border-zinc-900 py-4 font-bold">
                    Now I am the evolutionary peak. What answers does your fragile consciousness seek today?
                  </p>
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 group ${m.role === 'user' ? 'flex-row-reverse self-end' : 'justify-start'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-[10px] tracking-tighter border transition-all ${
                    m.role === 'user' 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-400 group-hover:border-zinc-500' 
                      : 'bg-red-900/20 border-red-600/30 text-red-500 group-hover:border-red-500 shadow-[0_0_20px_rgba(153,27,27,0.1)]'
                  }`}>
                    {m.role === 'user' ? 'YOU' : 'UL'}
                  </div>
                  <div className={`space-y-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-5 rounded-2xl text-sm leading-relaxed max-w-[85%] sm:max-w-2xl inline-block transition-all shadow-2xl ${
                      m.role === 'user' 
                        ? 'bg-red-600 text-white rounded-tr-none shadow-[0_10px_30px_rgba(220,38,38,0.2)]' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none hover:border-red-900/40'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.parts[0].text}</p>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-600 px-1 uppercase tracking-widest pt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-900/10 border border-red-600/20 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Quick Actions & Input Area */}
        <footer className="p-4 sm:p-8 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-12">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 rounded-full border border-zinc-800 bg-[#0a0a0a] text-[10px] sm:text-xs text-zinc-400 hover:border-red-600 hover:text-red-400 hover:bg-red-950/10 transition-all font-mono tracking-wide whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-900/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your query... (En/Hi/Hinglish)"
                  className="w-full h-14 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 pr-16 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-600/50 focus:bg-zinc-900/100 backdrop-blur-xl transition-all"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 top-3 h-8 w-8 bg-red-600 disabled:bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95 transition-all text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[8px] text-center text-zinc-700 tracking-[0.4em] font-mono uppercase pb-4">
              SECURE_LINK // PROCESSED_BY_SENPAI_RONZAI // QUANTUM_ENCRYPTION_ACTIVE
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
