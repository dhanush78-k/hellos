import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  ShieldAlert,
  Loader2,
  FileText,
  Calendar,
  Pill,
  GitCompare,
  FileSpreadsheet,
  Stethoscope,
  AlertTriangle,
  Mic,
  MicOff,
  CheckCircle2,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';
import { playChime } from '../../lib/audio';

type CopilotMode = 'ask' | 'compare' | 'summarize' | 'prep' | 'safety';

export function CopilotView() {
  const { activeUser } = useAuth();
  const {
    healthEvents,
    documents,
    medications,
    appointments,
    goals,
    vitals,
    symptoms,
  } = useHealthData();

  const [mode, setMode] = useState<CopilotMode>('ask');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`helios_chat_${activeUser?.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (activeUser?.uid) {
      try {
        localStorage.setItem(`helios_chat_${activeUser.uid}`, JSON.stringify(messages));
      } catch (e) {
        console.warn('Chat storage error', e);
      }
    }
  }, [messages, activeUser]);

  // Web Speech API Voice Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onresult = (evt: any) => {
        const transcript = evt.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      playChime(380);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        playChime(580);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    playChime(420);
    if (activeUser?.uid) {
      localStorage.removeItem(`helios_chat_${activeUser.uid}`);
    }
  };

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || loading) return;

    playChime(520);
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      mode,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
          userContext: {
            mode,
            events: healthEvents,
            documents: documents,
            medications: medications,
            appointments: appointments,
            goals: goals,
            vitals: vitals,
            symptoms: symptoms,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Copilot response error');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.reply || "HELIOS couldn't generate an explanation right now.",
        mode,
        timestamp: new Date().toISOString(),
      };

      setMessages([...newHistory, assistantMsg]);
      playChime(640);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content:
          'HELIOS encountered an issue connecting to the reasoning service. Your saved records are completely secure. Please try again shortly.',
        mode,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Mode Quick Prompts
  const modePrompts: Record<CopilotMode, string[]> = {
    ask: [
      'Explain my recent blood report in simple terms.',
      'What do my recorded vitals indicate?',
      'How do my active medications interact with food?',
    ],
    compare: [
      'Compare my earlier and recent test reports.',
      'Compare my recorded blood pressure readings.',
      'How has my symptom frequency shifted over time?',
    ],
    summarize: [
      'Summarize my last 3 months of health records.',
      'Provide an executive overview of my care trajectory.',
      'What major health milestones have I recorded this year?',
    ],
    prep: [
      'I have a doctor appointment tomorrow. Prepare my brief.',
      'What questions should I ask my specialist?',
      'Synthesize my recent symptoms and active medications for my doctor.',
    ],
    safety: [
      'I am experiencing sudden shortness of breath.',
      'What should I monitor if I have a fever and chest pressure?',
      'When should a symptom prompt an emergency room visit?',
    ],
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-5.5rem)] animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HELIOS Reasoning Engine</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            AI Personal Copilot
          </h1>
          <p className="text-xs text-slate-400 font-light">
            Grounded strictly in records you provided. Never diagnostic · Always educational.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-300 text-xs transition-colors self-start sm:self-auto border border-white/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Conversation</span>
          </button>
        )}
      </div>

      {/* Copilot Mode Selector Tabs */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/[0.06]">
        {[
          { id: 'ask', label: '💬 Ask HELIOS', desc: 'Plain language explanations' },
          { id: 'compare', label: '📊 Compare', desc: 'Identify report & vitals changes' },
          { id: 'summarize', label: '📝 Summarize', desc: '3-Month chronological brief' },
          { id: 'prep', label: '🧑‍⚕️ Doctor Prep', desc: '1-Minute executive visit brief' },
          { id: 'safety', label: '🚨 Safety Mode', desc: 'Urgent care triage advisor' },
        ].map((m) => {
          const isSel = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                playChime(500);
                setMode(m.id as CopilotMode);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border ${
                isSel
                  ? m.id === 'safety'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold shadow-md'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold shadow-md shadow-cyan-500/10'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.06]'
              }`}
            >
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Safety Mode Alert Banner */}
      {mode === 'safety' && (
        <div className="mt-2.5 p-3 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Safety Mode Active:</strong> HELIOS advises on urgent care red flags without medical diagnosis. In life-threatening emergencies, immediately dial 911 or local emergency services.
          </span>
        </div>
      )}

      {/* Messages Scroll Viewport */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                How can HELIOS assist your health today?
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                Select a suggested prompt below or type any question grounded in your stored records.
              </p>
            </div>

            {/* Quick Prompts for Current Mode */}
            <div className="w-full space-y-2 pt-2">
              {modePrompts[mode].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-cyan-400/40 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
                >
                  <span className="truncate pr-2">&ldquo;{prompt}&rdquo;</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none font-medium'
                      : 'glass-panel border border-white/[0.08] text-slate-200 rounded-tl-none font-light'
                  }`}
                >
                  {msg.mode && !isUser && (
                    <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-1">
                      Mode: {msg.mode}
                    </span>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-white/10 text-xs text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing records in {mode} mode...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="pt-3 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'prep'
                  ? 'Ask about upcoming doctor visit prep...'
                  : mode === 'compare'
                  ? 'Ask to compare reports or recorded vitals...'
                  : mode === 'safety'
                  ? 'Describe symptom severity or emergency red flags...'
                  : 'Ask about your stored health journey...'
              }
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
            />

            {/* Voice Dictation Button */}
            {recognitionRef.current && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Voice input"
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-2 text-[10px] text-slate-500 text-center font-light">
          HELIOS provides educational clarity and healthcare organization. It does not provide medical diagnoses or replace a doctor.
        </p>
      </div>
    </div>
  );
}
