import React, { useEffect, useState } from 'react';
import { Database, ShieldCheck, ChevronDown, ChevronUp, ExternalLink, Flame, CheckCircle2 } from 'lucide-react';
import { type DbStatusDetail } from '../../services/todoService';
import { getFirebaseConfig } from '../../services/firebase';

export const DatabaseStatusBanner: React.FC = () => {
  const [statusDetail, setStatusDetail] = useState<DbStatusDetail>({
    status: 'local_fallback',
    message: 'Initializing storage...',
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const config = getFirebaseConfig();
  const projectId = config?.projectId || 'todo-app-d8285';

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const customEvent = e as CustomEvent<DbStatusDetail>;
      if (customEvent.detail) {
        setStatusDetail(customEvent.detail);
      }
    };

    window.addEventListener('taskpulse:db_status', handleStatus);
    return () => window.removeEventListener('taskpulse:db_status', handleStatus);
  }, []);

  if (isDismissed) return null;

  const isConnected = statusDetail.status === 'connected';

  if (isConnected) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">Firebase Connected:</span>
          <span>{statusDetail.message || 'Tasks are synchronizing live with Firebase Realtime Database'} ({projectId})</span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3.5 sm:p-4 text-amber-900 dark:text-amber-100 shadow-sm transition-all animate-fade-in">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5 sm:mt-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                Local Database Active & Protected
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/60 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                100% Offline Safe
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
              All added tasks, subtasks, and edits are securely stored in your browser's persistent database and will not be lost.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200/70 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide Info' : 'Cloud Sync Info'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-200/80 dark:border-amber-900/60 text-xs space-y-2.5">
          <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            Your Firebase project <strong className="font-mono bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded">{projectId}</strong> uses Firebase Realtime Database.
          </p>

          <div className="p-3 bg-white/80 dark:bg-slate-900/70 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-1.5 text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Firebase Realtime Database Console:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] sm:text-xs">
              <li>
                Open the{' '}
                <a
                  href={`https://console.firebase.google.com/project/${projectId}/database`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 underline inline-flex items-center gap-0.5"
                >
                  Firebase Realtime Database Console <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
              <li>View all synchronized tasks in real-time under the <code className="font-mono bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded">todos</code> branch.</li>
              <li>All tasks added in TaskPulse automatically persist to this database.</li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              No action required if you are happy with fast local storage.
            </span>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-[11px] text-amber-800 dark:text-amber-300 hover:underline font-semibold"
            >
              Dismiss Banner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
