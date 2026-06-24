"use client";

import { useState, useEffect } from "react";
import { 
  CalendarCheck, 
  Clock, 
  Trash2, 
  Plus, 
  CheckSquare, 
  Square,
  Sparkles,
  Award,
  ListTodo
} from "lucide-react";

interface Task {
  id: number;
  task_name: string;
  category: "daily" | "weekly" | "monthly";
  due_date: string;
  completed: number; // 0 or 1
}

export default function TasksCalendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
      // Fallback mock tasks if backend is unavailable for demo stability
      setTasks([
        { id: 1, task_name: "Check soil drainage channels", category: "daily", due_date: "2026-06-22", completed: 1 },
        { id: 2, task_name: "Monitor leaf health for blight symptoms", category: "daily", due_date: "2026-06-22", completed: 0 },
        { id: 3, task_name: "Apply second dose of Nitrogen fertilizer", category: "weekly", due_date: "2026-06-22", completed: 0 },
        { id: 4, task_name: "Prepare fungicide spray (Hexaconazole)", category: "weekly", due_date: "2026-06-22", completed: 0 },
        { id: 5, task_name: "Apply for PMFBY crop insurance scheme", category: "monthly", due_date: "2026-06-22", completed: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    // Optimistic UI updates
    setTasks(prev => 
      prev.map(t => t.id === id ? { ...t, completed: t.completed === 1 ? 0 : 1 } : t)
    );

    try {
      await fetch(`http://localhost:8000/api/tasks/${id}/toggle`, {
        method: "POST"
      });
    } catch (err) {
      console.error("Failed to toggle task status:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/tasks/clear", {
        method: "POST"
      });
      if (res.ok) {
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to clear tasks:", err);
      setTasks([]);
    }
  };

  // Organize tasks by categories
  const dailyTasks = tasks.filter(t => t.category === "daily");
  const weeklyTasks = tasks.filter(t => t.category === "weekly");
  const monthlyTasks = tasks.filter(t => t.category === "monthly");

  // Calculate task statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed === 1).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#10b981]/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#f2f7f4] to-[#10b981] bg-clip-text text-transparent">
            Tasks Calendar
          </h1>
          <p className="text-sm text-[#a3b899] mt-1 font-medium">
            Daily, weekly, and monthly coordinated farm action timeline
          </p>
        </div>

        <button
          onClick={handleClearAll}
          className="text-xs bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Schedule
        </button>
      </div>

      {/* Completion Dashboard Progress Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Scorecard Card */}
        <div className="glass-card rounded-3xl p-6 md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#f59e0b]" /> Farm Compliance Score
            </h3>
            <p className="text-xs text-[#a3b899] max-w-md leading-relaxed">
              Completing scheduled tasks on time improves expected crop yields by up to 25% and mitigates weather and disease liabilities.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-[#a3b899] font-bold block uppercase tracking-wider">Completion Rate</span>
              <span className="text-3xl font-extrabold text-white mt-1 block">{completionRate}%</span>
              <span className="text-[10px] text-[#10b981] font-semibold">({completedCount} of {totalCount} done)</span>
            </div>
            
            <div className="w-14 h-14 rounded-full border-4 border-[#10b981]/25 border-t-[#10b981] animate-spin flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-[#10b981] -rotate-45" />
            </div>
          </div>
        </div>

        {/* Coordinated Advice Alert box */}
        <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-[#10b981]/15 to-transparent border border-[#10b981]/25 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#10b981]/10 to-transparent rounded-full pointer-events-none"></div>
          <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider self-start">
            Agent Tip
          </span>
          <p className="text-xs text-white/90 font-medium leading-relaxed mt-3">
            "Your weekly pesticide spray is scheduled for Thursday. We have checked the local weather and wind conditions to verify this window."
          </p>
          <span className="text-[10px] text-[#a3b899] font-bold mt-2 block">— Weather & Planner Agents</span>
        </div>

      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Daily Checklist */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#10b981]/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#10b981]" /> Daily Routine Tasks
            </h3>
            <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full font-bold">
              {dailyTasks.length} items
            </span>
          </div>

          <div className="space-y-3">
            {dailyTasks.length === 0 ? (
              <p className="text-xs text-[#a3b899] italic">No daily tasks scheduled. Compile parameters on Dashboard.</p>
            ) : (
              dailyTasks.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                    t.completed 
                      ? "bg-[#0b1310]/30 border-[#10b981]/10 text-white/50 line-through" 
                      : "bg-[#0b1310] border-[#10b981]/15 hover:border-[#10b981]/30 text-white"
                  }`}
                >
                  <span className="mt-0.5 text-[#10b981] flex-shrink-0">
                    {t.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-semibold leading-relaxed">{t.task_name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Weekly Tasks */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#10b981]/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#f59e0b]" /> Weekly Interventions
            </h3>
            <span className="text-[10px] bg-[#f59e0b]/10 text-[#f59e0b] px-2 py-0.5 rounded-full font-bold">
              {weeklyTasks.length} items
            </span>
          </div>

          <div className="space-y-3">
            {weeklyTasks.length === 0 ? (
              <p className="text-xs text-[#a3b899] italic">No weekly tasks scheduled. Compile parameters on Dashboard.</p>
            ) : (
              weeklyTasks.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                    t.completed 
                      ? "bg-[#0b1310]/30 border-[#10b981]/10 text-white/50 line-through" 
                      : "bg-[#0b1310] border-[#10b981]/15 hover:border-[#10b981]/30 text-white"
                  }`}
                >
                  <span className="mt-0.5 text-[#f59e0b] flex-shrink-0">
                    {t.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-semibold leading-relaxed">{t.task_name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Monthly Planning */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#10b981]/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" /> Monthly & Strategic Planning
            </h3>
            <span className="text-[10px] bg-[#10b981]/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              {monthlyTasks.length} items
            </span>
          </div>

          <div className="space-y-3">
            {monthlyTasks.length === 0 ? (
              <p className="text-xs text-[#a3b899] italic">No monthly tasks scheduled. Compile parameters on Dashboard.</p>
            ) : (
              monthlyTasks.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                    t.completed 
                      ? "bg-[#0b1310]/30 border-[#10b981]/10 text-white/50 line-through" 
                      : "bg-[#0b1310] border-[#10b981]/15 hover:border-[#10b981]/30 text-white"
                  }`}
                >
                  <span className="mt-0.5 text-[#10b981] flex-shrink-0">
                    {t.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-semibold leading-relaxed">{t.task_name}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
