import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calculator, Atom, Beaker, Dna, PenTool, 
  HelpCircle, Calendar, ClipboardList, Award, Share2, 
  Key, ShieldAlert, Sparkles, Clock, ListChecks, ArrowRight,
  RefreshCw, CheckCircle2, ChevronRight, Zap, AlertCircle
} from 'lucide-react';
import SubjectExplorer from './components/SubjectExplorer';
import QuizEngine from './components/QuizEngine';
import ClassroomTutor from './components/ClassroomTutor';
import StudyPlanner from './components/StudyPlanner';
import AdminConsole from './components/AdminConsole';
import KwagalaJovanBadge from './components/KwagalaJovanBadge';
import QRShare, { QRShareDashboardCard } from './components/QRShare';
import CopilotOrb from './components/CopilotOrb';
import { SUBJECTS_DATA, INITIAL_TASKS } from './data';
import { Task, QuizQuestion, Priority } from './types';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'quiz' | 'tutor' | 'planner' | 'admin'>('dashboard');
  const [appUrl, setAppUrl] = useState('');
  const [apiOnline, setApiOnline] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Time stamp
  const [utcTime, setUtcTime] = useState<string>('');

  // Coursework / Planner State
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Custom Seeding metrics
  const [quizScores, setQuizScores] = useState<{ subject: string; score: number; total: number; timestamp: string }[]>([]);

  // Quiz State
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizSubject, setQuizSubject] = useState<string>('Physics');
  const [quizTopic, setQuizTopic] = useState<string>("Newton's Laws");
  const [quizSubjectId, setQuizSubjectId] = useState<string>('physics');
  const [quizTopicId, setQuizTopicId] = useState<string>('newtons-laws');
  const [isQuizAiGenerated, setIsQuizAiGenerated] = useState(false);
  const [loadingAiQuiz, setLoadingAiQuiz] = useState(false);

  // Classroom AI Tutor Explainer State
  const [tutorExplanation, setTutorExplanation] = useState<string>('');
  const [tutorSuggestedQuestions, setTutorSuggestedQuestions] = useState<string[]>([]);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [tutorInitialConcept, setTutorInitialConcept] = useState<string>('');
  const [activeTutorPersona, setActiveTutorPersona] = useState<'copilot' | 'einstein' | 'newton'>('copilot');

  // Trigger brief visual Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Run initial checks and storage reading
  useEffect(() => {
    // Check Server API Connection
    const verifyConnection = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setApiOnline(data.online);
        setAppUrl(data.appUrl);
      } catch (err) {
        setApiOnline(false);
        setAppUrl(window.location.origin);
      }
    };
    verifyConnection();

    // Setup live UTC clock
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    // Read coursework/tasks from localStorage
    const savedTasks = localStorage.getItem('scholarstep_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('scholarstep_tasks', JSON.stringify(INITIAL_TASKS));
    }

    // Read saved quiz score logs
    const savedScores = localStorage.getItem('scholarstep_quiz_logs');
    if (savedScores) {
      try {
        setQuizScores(JSON.parse(savedScores));
      } catch (e) {
        setQuizScores([]);
      }
    }

    // Prepare default quiz questions (Physics - Newton's Laws)
    const defSubject = SUBJECTS_DATA.find(s => s.id === 'physics')!;
    const defTopic = defSubject.topics.find(t => t.id === 'newtons-laws')!;
    setActiveQuizQuestions(defTopic.quizQuestions);

    return () => clearInterval(interval);
  }, []);

  // Sync tasks state to LocalStorage
  const updateTasksWithStorage = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('scholarstep_tasks', JSON.stringify(newTasks));
  };

  // 1. Planner State managers
  const handleAddTask = (title: string, subject: string, priority: Priority, dueDate: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      subject,
      priority,
      dueDate,
      completed: false
    };
    const updated = [newTask, ...tasks];
    updateTasksWithStorage(updated);
    showToast(`Added assignment: "${title.slice(0, 20)}..."`);
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTasksWithStorage(updated);
    const targetTask = tasks.find(t => t.id === id);
    if (targetTask) {
      showToast(targetTask.completed ? "Assignment reactivated." : "Homework check-off complete!");
    }
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(task => task.id !== id);
    updateTasksWithStorage(updated);
    showToast("Homework task deleted.");
  };

  // 2. Start specific quiz session (triggered by Explorer or Dashboard)
  const handleSelectQuiz = (subjectId: string, topicId: string) => {
    const sub = SUBJECTS_DATA.find(s => s.id === subjectId);
    const top = sub?.topics.find(t => t.id === topicId);
    
    if (sub && top) {
      setQuizSubject(sub.name);
      setQuizTopic(top.name);
      setQuizSubjectId(subjectId);
      setQuizTopicId(topicId);
      setActiveQuizQuestions(top.quizQuestions);
      setIsQuizAiGenerated(false);
      setActiveTab('quiz');
      showToast(`Reviewing ${top.name} Practice Session.`);
    }
  };

  // 3. Request Dynamic AI Quiz from backend server using Gemini models
  const handleGenerateAiQuiz = async () => {
    setLoadingAiQuiz(true);
    showToast("Contacting AI Scholar system to generate MCQ options...");
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectId: quizSubjectId,
          topicId: quizTopicId
        })
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setActiveQuizQuestions(data.questions);
        setIsQuizAiGenerated(!data.offline);
        showToast(data.offline ? "No server key. Falling back to offline exam." : "Custom AI Quiz synthesized successfully!");
      } else {
        showToast("Error generating. Loading standard curriculum quiz.");
      }
    } catch (e) {
      showToast("Connection failed. Offline backup curriculum serves instead.");
    } finally {
      setLoadingAiQuiz(false);
    }
  };

  // 4. Handle completed quiz grade recording
  const handleQuizCompleted = (score: number) => {
    const newLog = {
      subject: `${quizSubject} - ${quizTopic}`,
      score,
      total: activeQuizQuestions.length,
      timestamp: new Date().toLocaleDateString()
    };
    const updatedLogs = [newLog, ...quizScores];
    setQuizScores(updatedLogs);
    localStorage.setItem('scholarstep_quiz_logs', JSON.stringify(updatedLogs));
  };

  // 5. Query Scholar AI classroom explaining lectures
  const handleQueryTutor = async (concept: string, persona: 'copilot' | 'einstein' | 'newton') => {
    setLoadingTutor(true);
    setTutorInitialConcept(concept);
    setActiveTutorPersona(persona);
    showToast(`Tutor ${persona === 'einstein' ? 'Einstein' : persona === 'newton' ? 'Newton' : 'Copilot'} is formulating lesson...`);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          concept,
          persona
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setTutorExplanation(data.explanation);
        setTutorSuggestedQuestions(data.suggestedQuestions || []);
        setActiveTab('tutor');
      } else {
        showToast("Formulation issue. Please retype query.");
      }
    } catch (e) {
      showToast("Formulations failed. Check server node connectivity.");
    } finally {
      setLoadingTutor(false);
    }
  };

  // 6. Navigate directly via AI Copilot intent triggers
  const handleCopilotNavigation = (screenName: string, subTopic?: { subjectId: string; topicId: string }) => {
    if (subTopic) {
      handleSelectQuiz(subTopic.subjectId, subTopic.topicId);
    } else {
      setActiveTab(screenName as any);
    }
  };

  const handleAskTutorDirectly = (conceptQuery: string) => {
    handleQueryTutor(conceptQuery, activeTutorPersona);
  };

  // 7. Administrative DB Seeds and Clears
  const handleSeedHomework = () => {
    const demoItems: Task[] = [
      {
        id: `seed-t-${Date.now()}-1`,
        title: 'Formulate ionic lattice structures draft',
        subject: 'Chemistry',
        priority: 'high',
        dueDate: '2026-06-03',
        completed: false
      },
      {
        id: `seed-t-${Date.now()}-2`,
        title: 'Review French estates-general voting stalemate causes',
        subject: 'History',
        priority: 'medium',
        dueDate: '2026-06-03',
        completed: false
      },
      {
        id: `seed-t-${Date.now()}-3`,
        title: 'Identify metaphorical devices in Romeo & Juliet',
        subject: 'English Literature',
        priority: 'low',
        dueDate: '2026-06-09',
        completed: false
      },
      {
        id: `seed-t-${Date.now()}-4`,
        title: 'Pythagorean length formulas practice 1-5',
        subject: 'Mathematics',
        priority: 'medium',
        dueDate: '2026-06-11',
        completed: true
      }
    ];
    const combined = [...demoItems, ...tasks];
    updateTasksWithStorage(combined);
  };

  const handleSeedQuizLogs = () => {
    const demoScores = [
      {
        subject: 'Mathematics - Quadratic Equations',
        score: 2,
        total: 2,
        timestamp: '2026-05-28'
      },
      {
        subject: 'Physics - Newton\'s Laws of Motion',
        score: 1,
        total: 2,
        timestamp: '2026-05-27'
      },
      {
        subject: 'Chemistry - Chemical Bonding Models',
        score: 2,
        total: 2,
        timestamp: '2026-05-26'
      }
    ];
    setQuizScores(demoScores);
    localStorage.setItem('scholarstep_quiz_logs', JSON.stringify(demoScores));
  };

  const handleClearHomework = () => {
    updateTasksWithStorage([]);
  };

  const handleClearQuizzes = () => {
    setQuizScores([]);
    localStorage.setItem('scholarstep_quiz_logs', JSON.stringify([]));
  };

  // Extract subjects strings list for select form
  const subjectNamesList = SUBJECTS_DATA.map(s => s.name);

  const subStyleMap: Record<string, { border: string, hover: string, glow: string, bg: string }> = {
    mathematics: { border: 'border-indigo-500/20', hover: 'hover:border-indigo-500/50', glow: 'hover:shadow-indigo-500/10', bg: 'bg-indigo-600' },
    physics: { border: 'border-teal-500/20', hover: 'hover:border-teal-500/50', glow: 'hover:shadow-teal-500/10', bg: 'bg-teal-600' },
    chemistry: { border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/50', glow: 'hover:shadow-emerald-500/10', bg: 'bg-emerald-600' },
    biology: { border: 'border-amber-500/20', hover: 'hover:border-amber-500/50', glow: 'hover:shadow-amber-500/10', bg: 'bg-amber-600' },
    history: { border: 'border-fuchsia-500/20', hover: 'hover:border-fuchsia-500/50', glow: 'hover:shadow-fuchsia-500/10', bg: 'bg-fuchsia-600' },
    'english-literature': { border: 'border-violet-500/20', hover: 'hover:border-violet-500/50', glow: 'hover:shadow-violet-500/10', bg: 'bg-violet-600' }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* 1. VISUAL TOAST ALERT BAR */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-indigo-950/95 border border-indigo-500/45 shadow-2xl px-5 py-3 text-xs text-indigo-200 backdrop-blur-md animate-fade-in"
        >
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 2. TOP BANNER HEADER */}
      <header className="border-b border-indigo-500/30 bg-[#1E1B4B] sticky top-0 z-30 px-4 sm:px-6 py-4 shadow-md backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo & app clock */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg text-white ring-2 ring-indigo-500/20">
              <BookOpen className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-display font-black text-white text-base tracking-tight flex items-center gap-1.5 animate-pulse">
                ScholarStep Study Companion
              </h1>
              <p className="text-[10px] text-slate-300 font-medium tracking-wide flex items-center gap-1">
                <Clock className="h-3 w-3 inline text-indigo-400" />
                <span>Local Target: {utcTime || "UTC"}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & API telemetry */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            
            {/* Share button */}
            <button
              id="top-action-share-btn"
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-bold px-3 py-1.5 text-xs transition-colors cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share App</span>
            </button>

            {/* API Online Badge description */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 border border-slate-800">
              <span className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-mono font-medium text-slate-400">
                {apiOnline ? "GEMINI NODE" : "LOCAL BACKUP"}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* 3. APP NAVIGATION SYSTEM */}
      <nav className="bg-[#1E293B]/60 backdrop-blur border-b border-indigo-500/20 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center overflow-x-auto gap-1 whitespace-nowrap scrollbar-none">
          {[
            { id: 'dashboard', label: 'Study Hub', icon: Zap },
            { id: 'subjects', label: 'Curriculum Factsheets', icon: BookOpen },
            { id: 'quiz', label: 'Practice Quiz', icon: Award },
            { id: 'tutor', label: 'Classroom Tutor', icon: Sparkles },
            { id: 'planner', label: 'Homework Planner', icon: ListChecks },
            { id: 'admin', label: 'Command Desk', icon: Key }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 outline-none cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. MAIN WORKSPACE CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* VIEW: STUDY HUB DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div id="view-dashboard" className="space-y-8 animate-fade-in">
            
            {/* Header prompt banner */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#1E1B4B]/85 via-[#1E293B]/90 to-[#0F172A] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div className="absolute top-0 right-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-indigo-500/5 blur-2xl" />
              
              <div className="space-y-2">
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-indigo-400">Welcome to Scholarstep</span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-white leading-tight">Empower Your STEM Studies</h2>
                <p className="text-sm text-slate-350 max-w-xl leading-relaxed">
                  Your offline-ready companion for secondary curriculum learning. Open subject factsheets, build custom dynamic quizzes, or talk with virtual tutors!
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="dash-explore-subjects-btn"
                  onClick={() => setActiveTab('subjects')}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 text-xs transition-colors shadow-md shadow-indigo-600/15"
                >
                  Explore Curriculum
                </button>
                <button
                  id="dash-open-t_planner-btn"
                  onClick={() => setActiveTab('planner')}
                  className="rounded-xl border border-[#334155] bg-[#1E293B] hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 text-xs font-bold transition-colors"
                >
                  View Tasks
                </button>
              </div>
            </div>

            {/* Quick Curriculum subject summary grid */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-lg text-white ml-1 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-400 stroke-[2]" />
                <span>Primary Subject Areas</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUBJECTS_DATA.map(sub => {
                  const subTheme = subStyleMap[sub.id] || { border: 'border-[#334155]', hover: 'hover:border-indigo-500/30', glow: 'hover:shadow-indigo-500/5', bg: 'bg-indigo-600' };
                  return (
                    <div
                      key={sub.id}
                      id={`dash-subject-card-${sub.id}`}
                      className={`group border ${subTheme.border} ${subTheme.hover} bg-[#1E293B]/80 rounded-2xl p-5 hover:shadow-xl ${subTheme.glow} transition-all duration-300 flex flex-col justify-between`}
                    >
                      <div>
                        <div className={`p-2 w-9 h-9 flex items-center justify-center rounded-xl text-white bg-gradient-to-tr ${sub.color}`}>
                          {sub.id === 'mathematics' && <Calculator className="h-5 w-5" />}
                          {sub.id === 'physics' && <Atom className="h-5 w-5" />}
                          {sub.id === 'chemistry' && <Beaker className="h-5 w-5" />}
                          {sub.id === 'biology' && <Dna className="h-5 w-5" />}
                          {sub.id === 'history' && <BookOpen className="h-5 w-5" />}
                          {sub.id === 'english-literature' && <PenTool className="h-5 w-5" />}
                        </div>

                        <h5 className="mt-3.5 font-display font-bold text-[15px] text-white tracking-tight">{sub.name}</h5>
                        <span className="text-[10px] text-indigo-300 font-semibold tracking-wider uppercase block mt-1">Modular Syllabus</span>
                        
                        <div className="mt-2.5 space-y-1">
                          {sub.topics.map(topic => (
                            <button
                              key={topic.id}
                              id={`dash-topic-trigger-${topic.id}`}
                              onClick={() => {
                                setQuizSubjectId(sub.id);
                                setQuizTopicId(topic.id);
                                setQuizSubject(sub.name);
                                setQuizTopic(topic.name);
                                setActiveQuizQuestions(topic.quizQuestions);
                                setActiveTab('subjects');
                              }}
                              className="flex items-center justify-between w-full text-left text-xs text-slate-350 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                            >
                              <span>{topic.name}</span>
                              <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover:translate-x-0.5 duration-200" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-700/60 pt-3 mt-4 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Practice modules loaded</span>
                        <button
                          _id={`dash-subject-test-${sub.id}`}
                          onClick={() => handleSelectQuiz(sub.id, sub.topics[0].id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 group-hover:underline"
                        >
                          <span>Take Challenge</span>
                          <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats / pending items panel widget and Past Scores list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Task list quick checkoff widget */}
              <div className="p-5 rounded-2xl border border-indigo-500/25 bg-[#1E293B] shadow-lg space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-indigo-400" />
                    <h5 className="font-display font-bold text-sm text-slate-100">Pending Assignment Snippets</h5>
                  </div>
                  <button 
                    id="dash-expand-planner-trigger"
                    onClick={() => setActiveTab('planner')}
                    className="text-xs text-indigo-400 hover:underline font-bold cursor-pointer"
                  >
                    Open Planner
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {tasks.filter(t => !t.completed).slice(0, 3).length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No pending homework assignments. You are fully up to date!</p>
                  ) : (
                    tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-[#334155]">
                        <div className="flex items-center gap-2 max-w-[70%]">
                          <button 
                            _id={`toggle-dash-${task.id}`}
                            onClick={() => handleToggleTask(task.id)} 
                            className="text-slate-400 hover:text-indigo-450 shrink-0 cursor-pointer"
                          >
                            <Circle className="h-4.5 w-4.5" />
                          </button>
                          <span className="text-xs font-medium text-slate-300 truncate" title={task.title}>{task.title}</span>
                        </div>
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' : task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Past score logs completed summaries */}
              <div className="p-5 rounded-2xl border border-indigo-500/25 bg-[#1E293B] shadow-lg space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-400" />
                  <h5 className="font-display font-bold text-sm text-slate-100">Cumulative Quiz Analytics</h5>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {quizScores.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-500">No completed sessions logged yet.</p>
                      <button
                        id="dash-launch-quiz-trigger-idx"
                        onClick={() => handleSelectQuiz('physics', 'newtons-laws')}
                        className="mt-2 text-xs text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Start Newtonian Motion quiz now
                      </button>
                    </div>
                  ) : (
                    quizScores.slice(0, 3).map((log, idx) => {
                      const ratio = log.score / log.total;
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-[#334155]">
                          <div className="max-w-[70%]">
                            <span className="block text-xs font-bold text-slate-200 truncate">{log.subject}</span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">Attempted on {log.timestamp}</span>
                          </div>
                          
                          <div className={`text-right ${
                            ratio >= 0.8 ? 'text-emerald-400' : ratio >= 0.5 ? 'text-indigo-400' : 'text-slate-400'
                          }`}>
                            <span className="font-mono text-xs font-bold">{log.score} / {log.total} Correct</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Invitations QR-Code trigger widget banner representation */}
            <QRShareDashboardCard appUrl={appUrl} onOpenModal={() => setInviteModalOpen(true)} />

            {/* Contributor Honor tributing Banner for Kwagala Jovan */}
            <KwagalaJovanBadge />

          </div>
        )}

        {/* VIEW: CURRICULUM EXPLORER */}
        {activeTab === 'subjects' && (
          <div id="view-subjects" className="animate-fade-in">
            <SubjectExplorer 
              onStartQuiz={handleSelectQuiz} 
              onAskTutor={handleAskTutorDirectly}
              selectedSubjectId={quizSubjectId}
              selectedTopicId={quizTopicId}
              onSelectTopic={(subId, topId) => {
                setQuizSubjectId(subId);
                setQuizTopicId(topId);
                const sub = SUBJECTS_DATA.find(s => s.id === subId);
                const top = sub?.topics.find(t => t.id === topId);
                if (sub && top) {
                  setQuizSubject(sub.name);
                  setQuizTopic(top.name);
                }
              }}
            />
          </div>
        )}

        {/* VIEW: PRACTICE QUIZ WORKSPACE */}
        {activeTab === 'quiz' && (
          <div id="view-quiz" className="animate-fade-in py-4">
            <QuizEngine 
              questions={activeQuizQuestions}
              subjectName={quizSubject}
              topicName={quizTopic}
              isAiGenerated={isQuizAiGenerated}
              onGenerateAiQuiz={handleGenerateAiQuiz}
              loadingAiQuiz={loadingAiQuiz}
              onCompletedQuiz={handleQuizCompleted}
            />
          </div>
        )}

        {/* VIEW: CLASSROOM TUTOR LECTURER DESK */}
        {activeTab === 'tutor' && (
          <div id="view-tutor" className="animate-fade-in">
            <ClassroomTutor 
              onQueryTutor={handleQueryTutor}
              loading={loadingTutor}
              explanation={tutorExplanation}
              suggestedQuestions={tutorSuggestedQuestions}
              initialConcept={tutorInitialConcept}
            />
          </div>
        )}

        {/* VIEW: HOMEWORK PLANNERS MANAGER */}
        {activeTab === 'planner' && (
          <div id="view-planner" className="animate-fade-in">
            <StudyPlanner 
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              subjects={subjectNamesList}
            />
          </div>
        )}

        {/* VIEW: ADMINISTRATIVE GATE desk */}
        {activeTab === 'admin' && (
          <div id="view-admin" className="animate-fade-in">
            <AdminConsole 
              onSeedHomework={handleSeedHomework}
              onSeedQuizLogs={handleSeedQuizLogs}
              onClearHomework={handleClearHomework}
              onClearQuizzes={handleClearQuizzes}
              apiOnline={apiOnline}
              onShowMessage={showToast}
            />
          </div>
        )}

      </main>

      {/* 5. FLOATING AUTOMATED COPILOT COMPANION ORB */}
      <CopilotOrb 
        onNavigateTo={handleCopilotNavigation}
        onAskTutorDirect={handleAskTutorDirectly}
        currentPersona={activeTutorPersona}
        onPersonaChange={setActiveTutorPersona}
        apiOnline={apiOnline}
        onShowMessage={showToast}
      />

      {/* 6. MODAL SYSTEM Sharing dialog */}
      <QRShare 
        appUrl={appUrl} 
        isOpen={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-800 bg-[#07090f]/75 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p>© 2026 ScholarStep Study Companion. Developed to support high-school academic success.</p>
          <div className="flex gap-4 justify-center sm:justify-end">
            <button _id="footer-back-home" onClick={() => setActiveTab('dashboard')} className="hover:text-slate-300">Home Lounge</button>
            <span>&middot;</span>
            <button _id="footer-open-admin" onClick={() => setActiveTab('admin')} className="hover:text-slate-300">Secure Admin Portal</button>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Simple local Circle replacement helper to prevent type clashing
function Circle({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
