import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { Calendar, Trash2, CheckCircle2, Circle, AlertTriangle, Plus, ClipboardList } from 'lucide-react';

interface StudyPlannerProps {
  tasks: Task[];
  onAddTask: (title: string, subject: string, priority: Priority, dueDate: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  subjects: string[];
}

export default function StudyPlanner({ tasks, onAddTask, onToggleTask, onDeleteTask, subjects }: StudyPlannerProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0] || 'Mathematics');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDueDate, setNewDueDate] = useState('2026-06-01');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle, newSubject, newPriority, newDueDate);
    setNewTitle('');
  };

  const filteredTasks = tasks.filter(task => {
    // Completion filter
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Subject filter
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;
    
    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    return true;
  });

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          indicator: 'bg-rose-500'
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          indicator: 'bg-amber-500'
        };
      case 'low':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          indicator: 'bg-emerald-500'
        };
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div id="study-planner-section" className="space-y-6">
      {/* 1. Header Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-indigo-500/25 bg-[#1E293B] shadow p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Homework</span>
            <h3 className="text-2xl font-bold text-white mt-1">
              {tasks.filter(t => !t.completed).length} items
            </h3>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-indigo-500/25 bg-[#1E293B] shadow p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Completion Rate</span>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
            </h3>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-indigo-500/25 bg-[#1E293B] shadow p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Urgent (High Priority)</span>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">
              {tasks.filter(t => !t.completed && t.priority === 'high').length} items
            </h3>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Add New Task Desk Form */}
        <div className="p-6 rounded-2xl border border-indigo-500/30 bg-[#1E293B] shadow-lg h-fit animate-fade-in">
          <h4 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" />
            <span>Add Study Task</span>
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Task Description</label>
              <input
                id="task-title-input"
                type="text"
                required
                placeholder="e.g. Solve physics conservation equations"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-[#334155] bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Subject</label>
                <select
                  id="task-subject-select"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full rounded-xl border border-[#334155] bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
                >
                  {subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-455 uppercase mb-1.5">Priority</label>
                <select
                  id="task-priority-select"
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as Priority)}
                  className="w-full rounded-xl border border-[#334155] bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Due Date</label>
              <input
                id="task-due-input"
                type="date"
                required
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full rounded-xl border border-[#334155] bg-slate-950 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              id="add-task-submit-btn"
              type="submit"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 text-xs transition-colors shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record New Task</span>
            </button>
          </form>
        </div>

        {/* 3. Filter and Task Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-indigo-500/20 bg-[#1E293B]">
            {/* Completion Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-[#334155]">
              <button
                id="filter-pending"
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Pending
              </button>
              <button
                id="filter-completed"
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${filter === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Completed ({completedCount})
              </button>
              <button
                id="filter-all"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
            </div>

            {/* Subject/Priority Filter selectors */}
            <div className="flex items-center gap-2">
              <select
                id="filter-subject"
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="rounded-lg border border-[#334155] bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                id="filter-priority"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-[#334155] bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Tasks Stack */}
          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <div id="no-tasks-state" className="text-center py-12 rounded-2xl border border-dashed border-[#334155] bg-slate-900/10">
                <ClipboardList className="mx-auto h-10 w-10 text-slate-600 stroke-[1.5]" />
                <h5 className="mt-3 font-display font-medium text-slate-300 text-sm">No tasks match criteria</h5>
                <p className="mt-1 text-xs text-slate-500">Add a new homework entry or clear your search filters!</p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const style = getPriorityStyle(task.priority);
                return (
                  <div
                    key={task.id}
                    id={`task-item-${task.id}`}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${task.completed ? 'border-slate-800 bg-slate-900/20 opacity-60' : 'border-[#334155] bg-[#1E293B]/80 hover:border-indigo-500/30'}`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox */}
                      <button
                        _id={`toggle-${task.id}`}
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 shrink-0 text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                        ) : (
                          <Circle className="h-5 w-5 hover:scale-115 transition-transform" />
                        )}
                      </button>

                      <div>
                        {/* Title */}
                        <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                          {task.title}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {/* Subject Tag */}
                          <span className="inline-flex items-center rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                            {task.subject}
                          </span>

                          {/* Priority tag */}
                          <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${style.bg}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${style.indicator}`} />
                            <span className="capitalize">{task.priority}</span>
                          </span>

                          {/* Due Date */}
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="h-3.5 w-3.5 stroke-[1.5]" />
                            <span>Due {task.dueDate}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      _id={`delete-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-500 hover:text-rose-400 rounded p-1 hover:bg-white/5 transition-all"
                      title="Delete assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
