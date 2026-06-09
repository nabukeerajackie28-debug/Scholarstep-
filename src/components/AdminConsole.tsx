import React, { useState, useEffect } from 'react';
import { Riddle } from '../types';
import { Key, ShieldAlert, ShieldCheck, Database, Trash2, HelpCircle, Activity, Server, RefreshCw, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface AdminConsoleProps {
  onSeedHomework: () => void;
  onSeedQuizLogs: () => void;
  onClearHomework: () => void;
  onClearQuizzes: () => void;
  apiOnline: boolean;
  onShowMessage: (text: string) => void;
}

export default function AdminConsole({
  onSeedHomework,
  onSeedQuizLogs,
  onClearHomework,
  onClearQuizzes,
  apiOnline,
  onShowMessage
}: AdminConsoleProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [riddle, setRiddle] = useState<Riddle | null>(null);
  const [loadingRiddle, setLoadingRiddle] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isWrongAttempt, setIsWrongAttempt] = useState(false);
  const [isCorrectAttempt, setIsCorrectAttempt] = useState(false);

  // Database metrics
  const [activeLogs, setActiveLogs] = useState<string[]>([
    'System init: SQLite databases online.',
    'Security controller: Riddle gates active.'
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActiveLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const fetchRiddle = async () => {
    setLoadingRiddle(true);
    setSelectedOption(null);
    setIsWrongAttempt(false);
    setIsCorrectAttempt(false);
    try {
      const res = await fetch('/api/admin/riddle');
      const data = await res.json();
      if (data.riddle) {
        setRiddle(data.riddle);
      }
    } catch (err) {
      console.error('Error loading riddle:', err);
    } finally {
      setLoadingRiddle(false);
    }
  };

  useEffect(() => {
    if (!isUnlocked) {
      fetchRiddle();
    }
  }, [isUnlocked]);

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !riddle) return;

    if (selectedOption === riddle.correctAnswerIndex) {
      setIsCorrectAttempt(true);
      setIsWrongAttempt(false);
      onShowMessage("Verification Successful! Access Cleared.");
      addLog("Cleared Gate Challenge. Welcome supreme admin!");
      setTimeout(() => {
        setIsUnlocked(true);
      }, 1500);
    } else {
      setIsWrongAttempt(true);
      setIsCorrectAttempt(false);
      onShowMessage("Validation Failed! Einstein rejects your mechanics.");
      addLog("Attempt failure blocked: incorrect verification riddle answer.");
    }
  };

  const handleAction = (action: () => void, logMsg: string, successMsg: string) => {
    action();
    addLog(logMsg);
    onShowMessage(successMsg);
  };

  return (
    <div id="admin-desk" className="max-w-3xl mx-auto space-y-6">
      
      {/* 1. LOCK SCREEN / GATING PHASE */}
      {!isUnlocked ? (
        <div id="admin-lock-screen" className="rounded-3xl border border-indigo-500/30 bg-[#1E293B] p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-40 w-40 rounded-full bg-rose-500/5 blur-2xl" />

          <div className="text-center max-w-lg mx-auto space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <Key className="h-7 w-7 animate-pulse" />
            </div>

            <div>
              <h3 className="font-display font-black text-white text-xl tracking-tight">Security Validator Gate</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Supreme clearance required. To unlock the developer desk and control seeded files, you must answer this academic challenge set by our historical tutors.
              </p>
            </div>

            {loadingRiddle ? (
              <div className="p-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-400">Drafting dynamic challenger puzzle...</span>
              </div>
            ) : riddle ? (
              <div id="riddle-workspace-box" className="text-left bg-slate-950 p-5 rounded-2xl border border-[#334155] space-y-4">
                
                {/* Character Icon banner */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                  <span className="text-2xl">{riddle.avatar === 'einstein' ? '👴' : '🍏'}</span>
                  <span>Riddle set by {riddle.avatar === 'einstein' ? 'Albert Einstein' : 'Sir Isaac Newton'}</span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed italic font-display">
                  "{riddle.question}"
                </p>

                {/* Option checkboxes */}
                <div className="space-y-2 mt-4">
                  {riddle.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        id={`riddle-option-${idx}`}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                            : 'border-[#334155] bg-slate-950/20 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="mr-2 mb-0.5 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-[10px] font-bold text-slate-400">
                          {idx + 1}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isWrongAttempt && (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/10">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Incorrect answer. Review your physical properties and thermodynamic equations!</span>
                  </div>
                )}

                {isCorrectAttempt && (
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/10">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Correct Answer! Gating system is releasing clearance tokens. Unlocking console...</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    id="submit-riddle-btn"
                    type="button"
                    disabled={selectedOption === null || isCorrectAttempt}
                    onClick={handleSubmitAnswer}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white font-bold py-2.5 text-xs transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Submit & Validate</span>
                  </button>

                  <button
                    id="change-riddle-btn"
                    type="button"
                    disabled={loadingRiddle || isCorrectAttempt}
                    onClick={fetchRiddle}
                    className="rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 p-2.5 transition-colors"
                    title="Change challenge riddle"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-400">Failed to load scientific locks. Re-tap below.</p>
            )}

            <div className="pt-2">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                Encryption Protocol: No Password Trails Enabled.
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* 2. ADMIN PANEL CONSOLE PHASE */
        <div id="admin-workspace-board" className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/10">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-extrabold text-white text-lg">Command Control Desk</h4>
                  <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                    Unlocked
                  </span>
                </div>
                <p className="text-xs text-indigo-300 leading-snug">
                  Execute seeding, clear tracking statistics, and view diagnostics logs.
                </p>
              </div>
            </div>

            <button
              id="admin-relock-btn"
              onClick={() => setIsUnlocked(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-xs font-bold text-slate-300 px-3.5 py-1.5"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Lock Console</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Database controls */}
            <div className="p-5 rounded-2xl border border-indigo-500/25 bg-[#1E293B] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-700">
                  <Database className="h-5 w-5 text-teal-400" />
                  <h5 className="font-display font-bold text-sm text-slate-100">Database Orchestrator</h5>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Quickly perform table clearing or inject preloaded demo parameters into your storage directories.
                </p>

                {/* Grid controls */}
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <button
                    id="admin-seed-homework-btn"
                    onClick={() => handleAction(onSeedHomework, "Injected demo high-school homework tasks.", "Demo Homework tasks seeded successfully!")}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/25 bg-slate-950 text-left transition-all"
                  >
                    <div>
                      <span className="block font-semibold text-slate-200">Seed Demo Coursework</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">Appends 4 realistic homework tasks.</span>
                    </div>
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </button>

                  <button
                    id="admin-seed-logs-btn"
                    onClick={() => handleAction(onSeedQuizLogs, "Seeded past user mock scoreboard logs.", "Quiz scores and stats appended successfully!")}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/25 bg-slate-950 text-left transition-all"
                  >
                    <div>
                      <span className="block font-semibold text-slate-200">Seed Quiz Completion Logs</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">Seeds demo mastery scores.</span>
                    </div>
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </button>

                  {/* Red cleaning row */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      id="admin-clear-homework-btn"
                      onClick={() => handleAction(onClearHomework, "Purged homework and tasks.", "Purged all homework successfully!")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:border-rose-500/35 text-rose-400 font-bold py-2.5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Wipe Homework</span>
                    </button>

                    <button
                      id="admin-clear-quizzes-btn"
                      onClick={() => handleAction(onClearQuizzes, "Purged quiz answers metrics files.", "Cleared score statistics successfully!")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:border-rose-500/35 text-rose-400 font-bold py-2.5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Quiz Stats</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic system log telemetry */}
            <div className="p-5 rounded-2xl border border-indigo-500/25 bg-[#1E293B] shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  <h5 className="font-display font-bold text-sm text-slate-100">System Live Diagnostics</h5>
                </div>

                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  ● ACTIVE
                </span>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">GEMINI LIVE NODE</span>
                  <span className={`block font-semibold mt-0.5 ${apiOnline ? 'text-teal-400' : 'text-slate-400'}`}>
                    {apiOnline ? "ONLINE" : "OFFLINE_SIMULATION"}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">HOST METADATA</span>
                  <span className="text-slate-300 block font-semibold mt-0.5">V12. europe-west3</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">SCHEMA NAMESPACE</span>
                  <span className="text-slate-300 block font-semibold mt-0.5">ScholarDB.v1</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">SECURITY CLEARANCE</span>
                  <span className="text-slate-300 block font-semibold mt-0.5">By-Pass_Scope_0</span>
                </div>
              </div>

              {/* Console log streams */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 tracking-wide uppercase font-bold">Activity Log Stream:</span>
                <div className="rounded-lg bg-slate-950 p-3 h-28 overflow-y-auto font-mono text-[10px] text-slate-400 leading-normal border border-slate-800 space-y-1">
                  {activeLogs.map((log, idx) => (
                    <div key={idx} className="truncate select-text">{log}</div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
