import React, { useState } from 'react';
import { Sparkles, Send, Search, HelpCircle, Loader2 } from 'lucide-react';
import { PersonaConfig } from '../types';

export const TUTOR_PERSONAS: PersonaConfig[] = [
  {
    id: 'copilot',
    name: 'Scholar Copilot',
    emoji: '✨',
    title: 'Assistant & Classmate',
    tagline: 'Encouraging, helpful, and provides direct app guidance.'
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    emoji: '👴',
    title: 'Cosmic Theoretical Guru',
    tagline: 'Explains sciences through space-time metaphors, clocks, and curiosity.'
  },
  {
    id: 'newton',
    name: 'Sir Isaac Newton',
    emoji: '🍏',
    title: 'Natural Philosophy Master',
    tagline: 'Applies rigorous gravity concepts, moving bodies, light prisms, and formal laws.'
  }
];

interface ClassroomTutorProps {
  onQueryTutor: (concept: string, persona: 'copilot' | 'einstein' | 'newton') => Promise<void>;
  loading: boolean;
  explanation: string;
  suggestedQuestions: string[];
  initialConcept?: string;
}

export default function ClassroomTutor({ onQueryTutor, loading, explanation, suggestedQuestions, initialConcept }: ClassroomTutorProps) {
  const [concept, setConcept] = useState(initialConcept || '');
  const [selectedPersona, setSelectedPersona] = useState<'copilot' | 'einstein' | 'newton'>('copilot');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || loading) return;
    onQueryTutor(concept, selectedPersona);
  };

  const handleSuggestionClick = (query: string) => {
    setConcept(query);
    onQueryTutor(query, selectedPersona);
  };

  const activePersona = TUTOR_PERSONAS.find(p => p.id === selectedPersona)!;

  return (
    <div id="classroom-tutor-desk" className="space-y-6">
      
      {/* 1. Persona Select Grid */}
      <div className="rounded-2xl border border-indigo-500/20 bg-[#1E293B] shadow-lg p-5 space-y-3">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historical AI Tutor Characters</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TUTOR_PERSONAS.map(persona => {
            const isSelected = selectedPersona === persona.id;
            return (
              <button
                key={persona.id}
                id={`tutor-persona-${persona.id}`}
                onClick={() => setSelectedPersona(persona.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl text-left border transition-all ${
                  isSelected 
                    ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20' 
                    : 'border-[#334155] bg-slate-950/60 hover:bg-[#1E293B]/70'
                }`}
              >
                <span className="text-2xl pt-0.5 shrink-0 select-none animate-pulse">{persona.emoji}</span>
                <div>
                  <h5 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    {persona.name}
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />}
                  </h5>
                  <span className="block text-[10px] text-slate-400 font-medium mt-0.5">{persona.title}</span>
                  <p className="block text-[11px] text-slate-500 mt-1.5 leading-snug">
                    {persona.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Lecture Query Search Desk */}
      <div className="p-5 rounded-2xl border border-indigo-500/30 bg-[#1E293B] shadow-xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              id="tutor-topic-input"
              type="text"
              required
              disabled={loading}
              placeholder={`Ask ${activePersona.name} to explain e.g. "Mitosis" or "Newton's 2nd law"...`}
              value={concept}
              onChange={e => setConcept(e.target.value)}
              className="w-full rounded-xl border border-[#334155] bg-slate-950 pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            id="tutor-lecture-submit-btn"
            type="submit"
            disabled={loading || !concept.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white font-bold px-5 py-3 text-xs transition-colors cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Request Lecture</span>
          </button>
        </form>

        {/* Suggestion Bubbles row */}
        <div id="tutor-suggestions-chips" className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold uppercase text-[10px] mr-1.5">Try suggestions:</span>
          {[
            { label: "🧬 Explain Mitosis VS Meiosis", query: "mitosis vs meiosis cell genetics" },
            { label: "⚛️ Covalent Molecular Bonds", query: "covalent bonding models" },
            { label: "🍏 Sir Isaac on gravity", query: "Newton's universal law of gravity and falling apples" },
            { label: "⏳ Einstein on relativity", query: "Einstein special relativity and space-time clocks" }
          ].map((sug, sidx) => (
            <button
              key={sidx}
              id={`tutor-suggestion-btn-${sidx}`}
              type="button"
              disabled={loading}
              onClick={() => handleSuggestionClick(sug.query)}
              className="rounded-full bg-slate-950 border border-[#334155] hover:border-indigo-500/30 hover:bg-slate-900 text-slate-300 px-3 py-1 text-[11px] transition-colors cursor-pointer"
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Output Lecture Content panel */}
      {loading ? (
        <div id="tutor-loader" className="p-16 rounded-2xl border border-slate-800 bg-slate-900/20 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 text-indigo-400 animate-spin" />
          <h5 className="font-display font-medium text-slate-300 text-sm">
            Tutor {activePersona.name} is formulating explanation...
          </h5>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Structuring historical analogies, simplified textbooks, and custom science definitions for your syllabus.
          </p>
        </div>
      ) : explanation ? (
        <div id="tutor-lecture-board" className="p-6 rounded-2xl border border-indigo-500/30 bg-[#1E293B] shadow-2xl animate-fade-in space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-700/60 pb-3">
            <span className="text-3xl select-none">{activePersona.emoji}</span>
            <div>
              <h4 className="font-display font-bold text-white text-base">Private Lecture with {activePersona.name}</h4>
              <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">SCIENTIFIC CONCEPT EXPLODED</span>
            </div>
          </div>

          {/* Render markdown safely line-by-line */}
          <div className="prose max-w-none text-slate-300 leading-relaxed text-sm space-y-4 max-h-[380px] overflow-y-auto pr-2">
            {explanation.split('\n\n').map((para, idx) => {
              if (para.startsWith('### ')) {
                return <h5 key={idx} className="font-display font-bold text-base text-teal-400 mt-2">{para.replace('### ', '')}</h5>;
              }
              if (para.startsWith('#### ')) {
                return <h6 key={idx} className="font-semibold text-sm text-slate-200 mt-2">{para.replace('#### ', '')}</h6>;
              }
              if (para.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5">
                    {para.split('\n').map((li, lidx) => (
                      <li key={lidx}>{li.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx}>{para}</p>;
            })}
          </div>

          {/* AI generated follow-up suggestions */}
          {suggestedQuestions.length > 0 && (
            <div className="border-t border-slate-700/60 pt-4 space-y-2">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Suggested student follow-ups:</span>
              <div className="flex flex-col sm:flex-row gap-2">
                {suggestedQuestions.map((q, qidx) => (
                  <button
                    key={qidx}
                    id={`tutor-followup-btn-${qidx}`}
                    onClick={() => handleSuggestionClick(q)}
                    className="flex-1 text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-[#334155] hover:border-slate-500 text-xs text-indigo-300 font-medium transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div id="tutor-idle-box" className="p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
          <h5 className="font-display font-medium text-slate-300 text-sm">Awaiting Academic Concept</h5>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            Choose an avatar, search any science/humanities topic, and let our custom AI characters construct amazing lessons!
          </p>
        </div>
      )}

    </div>
  );
}
