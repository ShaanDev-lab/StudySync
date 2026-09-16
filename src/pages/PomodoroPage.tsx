import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { Play, Pause, Square, Timer, Coffee, Moon, CheckCircle2, Clock } from "lucide-react";
import { useCollisionData } from "../contexts/CollisionContext";
import Navbar from "../components/common/Navbar";
import { Show } from "@clerk/react";
import LoginPage from "./LoginPage";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const DEFAULT_DURATIONS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export default function PomodoroPage() {
  const { tasks, logPomodoroSession, weeklyStats } = useCollisionData();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [logNotice, setLogNotice] = useState<string | null>(null);
  
  const [mode, setMode] = useState<TimerMode>("focus");
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.focus * 60);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  // Clear timer when unmounting or stopping
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);

      if (selectedTaskId) {
        void (async () => {
          await logPomodoroSession(Number(selectedTaskId), durations[mode]);
          setLogNotice(`✅ Automatically logged ${durations[mode]}m for this task!`);
          setTimeout(() => setLogNotice(null), 5000);
        })();
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, selectedTaskId, durations, mode, logPomodoroSession]);

  const updateDuration = (newMinutes: number) => {
    const clamped = Math.max(1, Math.min(180, newMinutes));
    setDurations((prev) => ({ ...prev, [mode]: clamped }));
    if (!isActive) {
      setTimeLeft(clamped * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode] * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
  };

  const handleManualLog = async () => {
    if (!selectedTaskId) return;
    const minutes = durations[mode];
    await logPomodoroSession(Number(selectedTaskId), minutes);
    setLogNotice(`✅ Successfully logged ${minutes}m to database!`);
    setTimeout(() => setLogNotice(null), 4000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSeconds = durations[mode] * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status !== "Completed"),
    [tasks],
  );
  const selectedTaskWeeklyMinutes = selectedTaskId ? weeklyStats[Number(selectedTaskId)] || 0 : 0;

  return (
    <>
      <Show when="signed-out">
        <LoginPage />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors flex flex-col">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12">
            
            <header className="mb-8 text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase flex items-center justify-center gap-4">
                <Timer size={64} className="hidden md:block" />
                Pomodoro
              </h1>
              <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400 mt-2">
                Focus on your tasks and avoid burnout.
              </p>
            </header>

            <div className="w-full max-w-2xl bg-white dark:bg-black p-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              
              {/* Task Selector */}
              <div className="mb-8">
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">
                  What are you working on?
                </label>
                <select
                  className="w-full bg-transparent border-2 border-black dark:border-white p-4 font-bold focus:outline-none appearance-none text-black dark:text-white"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  disabled={isActive}
                >
                  <option value="">-- Select a Task (Optional) --</option>
                  {pendingTasks.map((task) => (
                    <option key={task.id} value={task.id.toString()}>
                      {task.title}
                    </option>
                  ))}
                </select>

                {selectedTaskId && (
                  <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
                      <Clock size={16} />
                      Weekly Focus Time: {selectedTaskWeeklyMinutes >= 60 ? `${Math.floor(selectedTaskWeeklyMinutes / 60)}h ${selectedTaskWeeklyMinutes % 60}m` : `${selectedTaskWeeklyMinutes} mins`}
                    </span>
                    <button
                      onClick={handleManualLog}
                      className="px-3 py-1 bg-yellow-400 text-black border-2 border-black font-extrabold text-xs uppercase tracking-widest hover:bg-yellow-300 transition-colors"
                    >
                      Log {durations[mode]}m Now
                    </button>
                  </div>
                )}

                {logNotice && (
                  <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/40 border-2 border-green-500 text-green-900 dark:text-green-200 font-extrabold text-xs uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {logNotice}
                  </div>
                )}
              </div>

              {/* Mode Switcher */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={() => switchMode("focus")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-colors ${
                    mode === "focus"
                      ? "bg-pink-400 text-black dark:bg-pink-400 dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white"
                  }`}
                >
                  <Timer size={18} />
                  Focus
                </button>
                <button
                  onClick={() => switchMode("shortBreak")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-colors ${
                    mode === "shortBreak"
                      ? "bg-cyan-400 text-black dark:bg-cyan-400 dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white"
                  }`}
                >
                  <Coffee size={18} />
                  Short Break
                </button>
                <button
                  onClick={() => switchMode("longBreak")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-colors ${
                    mode === "longBreak"
                      ? "bg-purple-400 text-black dark:bg-purple-400 dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white"
                  }`}
                >
                  <Moon size={18} />
                  Long Break
                </button>
              </div>

              {/* Manual Time Setting Control */}
              <div className="flex flex-col items-center justify-center gap-2 mb-8 bg-neutral-100 dark:bg-neutral-900 p-4 border-2 border-black dark:border-white">
                <label className="text-xs font-extrabold uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
                  Set Custom Time ({mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'})
                </label>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    disabled={isActive}
                    onClick={() => updateDuration(durations[mode] - 5)}
                    className="px-3 py-2 border-2 border-black dark:border-white font-bold text-xs bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    -5m
                  </button>
                  <button
                    disabled={isActive}
                    onClick={() => updateDuration(durations[mode] - 1)}
                    className="px-3 py-2 border-2 border-black dark:border-white font-bold text-xs bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    -1m
                  </button>

                  <div className="flex items-center gap-1 bg-white dark:bg-black border-2 border-black dark:border-white px-3 py-1">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      disabled={isActive}
                      value={durations[mode]}
                      onChange={(e) => updateDuration(parseInt(e.target.value, 10) || 1)}
                      className="w-16 text-center py-1 bg-transparent font-extrabold text-xl focus:outline-none disabled:opacity-50 text-black dark:text-white"
                    />
                    <span className="font-bold uppercase text-xs text-black dark:text-white">min</span>
                  </div>

                  <button
                    disabled={isActive}
                    onClick={() => updateDuration(durations[mode] + 1)}
                    className="px-3 py-2 border-2 border-black dark:border-white font-bold text-xs bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    +1m
                  </button>
                  <button
                    disabled={isActive}
                    onClick={() => updateDuration(durations[mode] + 5)}
                    className="px-3 py-2 border-2 border-black dark:border-white font-bold text-xs bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    +5m
                  </button>
                </div>
              </div>

              {/* Timer Display */}
              <div className="flex flex-col items-center justify-center mb-12 relative">
                {/* Progress bar container */}
                <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white mb-8 overflow-hidden">
                  <motion.div
                    className="h-full bg-black dark:bg-white origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ ease: "linear", duration: 1 }}
                  />
                </div>
                
                <h2 className="text-[6rem] sm:text-[8rem] md:text-[10rem] font-black tracking-tighter leading-none tabular-nums">
                  {formatTime(timeLeft)}
                </h2>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={toggleTimer}
                  className="flex items-center gap-3 px-8 py-4 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-extrabold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  {isActive ? (
                    <>
                      <Pause size={24} /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={24} /> Start
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-black dark:border-white font-extrabold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-black dark:text-white"
                >
                  <Square size={24} />
                  Reset
                </button>
              </div>
            </div>

          </div>
        </div>
      </Show>
    </>
  );
}
