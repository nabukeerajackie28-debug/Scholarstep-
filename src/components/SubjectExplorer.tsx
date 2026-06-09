import React, { useState } from 'react';
import { SUBJECTS_DATA, Subject, Topic } from '../data';
import { BookOpen, Calculator, Atom, Beaker, Dna, PenTool, ChevronRight, GraduationCap } from 'lucide-react';

interface SubjectExplorerProps {
  onStartQuiz: (subjectId: string, topicId: string) => void;
  onAskTutor: (concept: string) => void;
  selectedSubjectId?: string;
  selectedTopicId?: string;
  onSelectTopic?: (subjectId: string, topicId: string) => void;
}

// Map strings to Lucide icon components reliably
const IconMap: Record<string, React.ComponentType<any>> = {
  Calculator,
  Atom,
  Beaker,
  Dna,
  BookOpen,
  PenTool,
};

export default function SubjectExplorer({ onStartQuiz, onAskTutor, selectedSubjectId, selectedTopicId, onSelectTopic }: SubjectExplorerProps) {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(selectedSubjectId || 'mathematics');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(selectedTopicId || null);

  const activeSubject = SUBJECTS_DATA.find(s => s.id === activeSubjectId) || SUBJECTS_DATA[0];

  const handleSelectSubject = (id: string) => {
    setActiveSubjectId(id);
    setActiveTopicId(null);
  };

  const handleSelectTopic = (topic: Topic) => {
    setActiveTopicId(topic.id);
    if (onSelectTopic) {
      onSelectTopic(activeSubjectId, topic.id);
    }
  };

  const activeTopic = activeSubject.topics.find(t => t.id === activeTopicId);

  return (
    <div id="subject-explorer-desk" className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* 1. Subjects Side/Top Selector Row */}
      <div className="md:col-span-4 space-y-4">
        <h4 className="font-display font-bold text-lg text-white mb-2 ml-1">Curriculum Subjects</h4>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
          {SUBJECTS_DATA.map(subject => {
            const IconComponent = IconMap[subject.iconName] || BookOpen;
            const isSelected = activeSubjectId === subject.id;
            return (
              <button
                key={subject.id}
                id={`subject-tab-${subject.id}`}
                onClick={() => handleSelectSubject(subject.id)}
                className={`group flex items-center gap-3.5 p-4 rounded-2xl text-left border transition-all duration-300 ${
                  isSelected 
                    ? 'border-indigo-500 bg-[#1E1B4B]/40 shadow-indigo-500/10 shadow-lg' 
                    : 'border-[#334155] bg-[#1E293B]/60 hover:bg-[#1E293B]/90 hover:border-slate-500'
                }`}
              >
                <div 
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${subject.color} text-white shadow-md transition-transform group-hover:scale-105`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <span className={`block font-display font-semibold text-sm ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {subject.name}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                    {subject.topics.length} core modular topic{subject.topics.length > 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Topics List & Detailed Factsheet View panel */}
      <div className="md:col-span-8 flex flex-col space-y-5">
        
        {/* Topic choice list for active subject */}
        <div id="subject-topics-list" className="p-5 rounded-2xl border border-indigo-500/20 bg-[#1E293B] shadow-lg">
          <div className="flex items-center gap-2.5 mb-4">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <h5 className="font-display font-bold text-base text-white">
              {activeSubject.name} Topic Factsheets
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeSubject.topics.map(topic => {
              const isSelected = activeTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  id={`topic-badge-${topic.id}`}
                  onClick={() => handleSelectTopic(topic)}
                  className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'border-teal-500/60 bg-teal-950/20' 
                      : 'border-[#334155] bg-slate-950 hover:border-[#475569]'
                  }`}
                >
                  <div className="pr-2">
                    <span className={`block text-xs font-bold leading-tight ${isSelected ? 'text-teal-400' : 'text-slate-300'}`}>
                      {topic.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {topic.description}
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 mt-0.5 text-slate-500 transition-transform ${isSelected ? 'translate-x-0.5 text-teal-400' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Topic factsheet markdown display */}
        {activeTopic ? (
          <div id="topic-factsheet-viewer" className="flex-1 p-6 rounded-2xl border border-indigo-500/30 bg-[#1E293B] shadow-2xl flex flex-col space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/60 pb-4 gap-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{activeSubject.name} FACTSHEET</span>
                <h4 className="mt-0.5 font-display font-extrabold text-xl text-white">{activeTopic.name}</h4>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  id={`start-quiz-btn-${activeTopic.id}`}
                  onClick={() => onStartQuiz(activeSubject.id, activeTopic.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 text-xs transition-colors shadow shadow-teal-500/10 cursor-pointer"
                >
                  <span>Launch Practice Quiz</span>
                </button>

                <button
                  id={`ask-tutor-btn-${activeTopic.id}`}
                  onClick={() => onAskTutor(activeTopic!.name)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold px-4 py-2 text-xs transition-colors shadow shadow-indigo-500/10 cursor-pointer"
                >
                  <span>Query Tutor AI</span>
                </button>
              </div>
            </div>

            {/* Custom Factsheet Text Rendering */}
            <div className="Prose max-w-none text-slate-300 leading-relaxed text-sm space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {activeTopic.factsheet.split('\n\n').map((paragraph, idx) => {
                // simple custom mock parse for markdown styling tags in static fields
                if (paragraph.startsWith('### ')) {
                  return <h5 key={idx} className="font-display font-medium text-base text-teal-400 mt-2">{paragraph.replace('### ', '')}</h5>;
                }
                if (paragraph.startsWith('#### ')) {
                  return <h6 key={idx} className="font-semibold text-sm text-slate-200 mt-2">{paragraph.replace('#### ', '')}</h6>;
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1.5">
                      {paragraph.split('\n').map((li, lidx) => (
                        <li key={lidx}>{li.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>

            <div className="rounded-xl bg-slate-950/70 p-4 border border-indigo-500/20">
              <span className="block text-[11px] font-bold uppercase text-slate-500 tracking-wide">💡 Historical Tutor Hint</span>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Want to know how <strong>Albert Einstein</strong> or <strong>Sir Isaac Newton</strong> explains this? Trigger them at the Tutor desk below or talk to our Floating Scholar Copilot anytime!
              </p>
            </div>
          </div>
        ) : (
          <div id="no-topic-selected" className="flex-1 flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10">
            <BookOpen className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h5 className="font-display font-medium text-slate-300 text-sm">Review Curriculum Factsheets</h5>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Select one of the subject topics on the left grid, check out its core facts, and play challenging interactive mock exams.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
