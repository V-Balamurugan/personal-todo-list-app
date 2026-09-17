import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, X } from 'lucide-react';
import { soundService } from '../../services/sound';

interface PomodoroTimerProps {
  onClose?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      soundService.playTaskCompleteSound();
      if (mode === 'work') {
        setCompletedSessions((prev) => prev + 1);
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = (newMode: 'work' | 'break' = mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Mode and info */}
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div
          className={`p-3 rounded-2xl flex-shrink-0 ${
            mode === 'work'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
          }`}
        >
          {mode === 'work' ? <Flame className="w-5 h-5 animate-pulse" /> : <Coffee className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {mode === 'work' ? 'Study & Coding Focus' : 'Short Break'}
            </span>
            {completedSessions > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                {completedSessions} {completedSessions === 1 ? 'session' : 'sessions'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {mode === 'work' ? '25 minutes distraction-free focus' : '5 minutes rest & recharge'}
          </p>
        </div>
      </div>

      {/* Clock display & Controls */}
      <div className="flex items-center gap-4">
        <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
          {formattedTime}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTimer}
            className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => resetTimer(mode)}
            title="Reset timer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mode switch pills */}
          <button
            type="button"
            onClick={() => resetTimer(mode === 'work' ? 'break' : 'work')}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2"
          >
            {mode === 'work' ? 'Switch to Break' : 'Switch to Focus'}
          </button>
        </div>
      </div>
    </div>
  );
};
