import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Play, Calendar, ShieldAlert } from 'lucide-react';
import { AIChatMessage, PersonaConfig } from '../types';

interface CopilotOrbProps {
  onNavigateTo: (screenName: string, subTopic?: { subjectId: string; topicId: string }) => void;
  onAskTutorDirect: (concept: string) => void;
  currentPersona: 'copilot' | 'einstein' | 'newton';
  onPersonaChange: (p: 'copilot' | 'einstein' | 'newton') => void;
  apiOnline: boolean;
  onShowMessage: (text: string) => void;
}

export default function CopilotOrb({
  onNavigateTo,
  onAskTutorDirect,
  currentPersona,
  onPersonaChange,
  apiOnline,
  onShowMessage
}: CopilotOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Floating chat state
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: "Hello! I am your AI Scholar Companion. I can help explain difficult topics OR navigate the application for you! Try saying 'take me to the homework planner' or 'start a biology quiz'.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: 'copilot'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: AIChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: currentPersona
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat-navigate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          persona: currentPersona,
          chatHistory: messages
        })
      });

      const data = await response.json();
      
      const assistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I am processing. How else can I assist?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: currentPersona
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Check Navigation Trigger actions output by AI model
      if (data.actionType === 'navigate' && data.actionTarget) {
        const target = data.actionTarget;
        addSystemActionMessage(`Navigating screen view: ${target}`);
        
        // Handle target parsing
        setTimeout(() => {
          if (target.startsWith('QUIZ:')) {
            const subjectId = target.replace('QUIZ:', '');
            // Start default quiz for subject
            let topicId = 'quadratic-equations';
            if (subjectId === 'physics') topicId = 'newtons-laws';
            else if (subjectId === 'chemistry') topicId = 'chemical-bonding';
            else if (subjectId === 'biology') topicId = 'cell-biology';
            else if (subjectId === 'history') topicId = 'french-revolution';
            else if (subjectId === 'english-literature') topicId = 'rhetorical-devices';
            
            onNavigateTo('quiz', { subjectId, topicId });
            onShowMessage(`Launching ${subjectId} challenge quiz!`);
          } else if (target.startsWith('EXPLAIN:')) {
            const concept = target.replace('EXPLAIN:', '');
            onNavigateTo('tutor');
            onAskTutorDirect(concept);
            onShowMessage(`Synthesizing textbook explanation for ${concept}`);
          } else if (target === 'PLANNER') {
            onNavigateTo('planner');
            onShowMessage("Homework schedules opened.");
          } else if (target === 'ADMIN') {
            onNavigateTo('admin');
            onShowMessage("Opening Gated Command Deck.");
          } else if (target === 'DASHBOARD' || target === 'SUBJECTS') {
            onNavigateTo(target.toLowerCase());
          }
        }, 1200);
      }

    } catch (err) {
      console.error('Chat companion navigation error:', err);
      // fallback
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "My apologies, scholar. Cloud particles are fluctuating. Please review factsheets or search other tabs locally!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: currentPersona
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const addSystemActionMessage = (desc: string) => {
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      sender: 'action',
      text: desc,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: currentPersona
    }]);
  };

  const handleSuggestedPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <>
      {/* 1. FLOATING COPILOT BULB ORB */}
      <button
        id="floating-copilot-orb-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-amber-500 via-yellow-400 to-indigo-600 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 duration-200 outline-none ring-4 ring-indigo-500/30 cursor-pointer animate-pulse"
        title="Scholar Copilot Navigation chat"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white stroke-[2.5]" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-slate-900 stroke-[2.5]" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* 2. CHAT POP WINDOW COMPANION */}
      {isOpen && (
        <div id="copilot-chat-popup" className="fixed bottom-24 right-6 z-40 w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#1E293B] shadow-2xl text-slate-200 flex flex-col h-[480px] animate-fade-in">
          
          {/* Pop Head */}
          <div className="p-4 bg-gradient-to-r from-indigo-950 via-[#1E293B] to-slate-900 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">
                {currentPersona === 'einstein' ? '👴' : currentPersona === 'newton' ? '🍏' : '✨'}
              </span>
              <div>
                <h5 className="font-display font-bold text-xs text-slate-100 uppercase tracking-wide">
                  {currentPersona === 'einstein' ? 'Albert Einstein' : currentPersona === 'newton' ? 'Sir Isaac Newton' : 'Scholar Copilot'}
                </h5>
                <span className="text-[10px] text-indigo-400 block font-medium">Scholar Navigate Companion</span>
              </div>
            </div>

            {/* Avatar picker in popup */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
              <button 
                id="copilot-avatar-picker-copilot"
                onClick={() => onPersonaChange('copilot')} 
                title="Tutor Copilot" 
                className={`p-1 rounded text-xs ${currentPersona === 'copilot' ? 'bg-indigo-600' : 'hover:bg-slate-900'}`}
              >
                ✨
              </button>
              <button 
                id="copilot-avatar-picker-einstein"
                onClick={() => onPersonaChange('einstein')} 
                title="Albert Einstein" 
                className={`p-1 rounded text-xs ${currentPersona === 'einstein' ? 'bg-indigo-600' : 'hover:bg-slate-900'}`}
              >
                👴
              </button>
              <button 
                id="copilot-avatar-picker-newton"
                onClick={() => onPersonaChange('newton')} 
                title="Sir Isaac Newton" 
                className={`p-1 rounded text-xs ${currentPersona === 'newton' ? 'bg-indigo-600' : 'hover:bg-slate-900'}`}
              >
                🍏
              </button>
            </div>
          </div>

          {/* Scrolling messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/40">
            {messages.map((m) => {
              if (m.sender === 'action') {
                return (
                  <div key={m.id} className="mx-auto text-center py-1.5 px-3 rounded-lg bg-indigo-500/15 border border-indigo-500/25 max-w-[280px]">
                    <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest block font-bold">ROUTE OPERATION</span>
                    <span className="text-[11px] text-slate-200 mt-0.5 block">{m.text}</span>
                  </div>
                );
              }

              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                  {/* Sender title if assistant */}
                  {!isUser && (
                    <span className="text-[9px] text-slate-500 font-bold mb-1 ml-1">
                      {m.persona === 'einstein' ? 'ALBERT EINSTEIN' : m.persona === 'newton' ? 'ISAAC NEWTON' : 'STUDY COPILOT'}
                    </span>
                  )}
                  
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50'
                  }`}>
                    {m.text}
                  </div>

                  <span className="text-[8px] text-slate-400 mt-1 ml-1 font-mono">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono ml-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Horizontal suggested trigger bubble row */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/60 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {[
              { label: "🔬 Explain bonds", prompt: "Explain covalent bonds" },
              { label: "🗓️ Open Planner", prompt: "Take me to my homework planner" },
              { label: "🧬 Cell organelles", prompt: "Explain cellular organelles" },
              { label: "🚀 Gravity quiz", prompt: "Start my physics quiz" },
              { label: "🛡️ Developer desk", prompt: "Go to admin command console" }
            ].map((p, pidx) => (
              <button
                key={pidx}
                id={`copilot-trigger-chip-${pidx}`}
                onClick={() => handleSuggestedPrompt(p.prompt)}
                className="inline-block p-1.5 px-3 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-indigo-300 font-medium hover:border-slate-700 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input field footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900">
            <div className="flex gap-2">
              <input
                id="copilot-text-input"
                type="text"
                disabled={loading}
                placeholder="Ask to navigate or explain e.g. 'Go home'..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendMessage(inputValue);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
              />
              <button
                id="copilot-send-btn"
                disabled={loading || !inputValue.trim()}
                onClick={() => handleSendMessage(inputValue)}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white p-2 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
