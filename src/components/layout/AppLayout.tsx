import React, { useState } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { TopNavbar } from './TopNavbar';
import { MobileBottomNav } from './MobileBottomNav';
import { QuickSearchModal } from './QuickSearchModal';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { CreateTodoModal } from '../todos/CreateTodoModal';
import { MainContentView } from '../views/MainContentView';
import { useTodos } from '../../context/TodoContext';
import {
  X,
  CheckCircle2,
  LayoutDashboard,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ListTodo,
  Tags,
  Settings,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const {
    isCreateModalOpen,
    createModalPreset,
    closeCreateModal,
    activeView,
    setActiveView,
    todayCount,
    overdueCount,
    completedCount,
    allCount,
    setSelectedCategory,
  } = useTodos();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Desktop Sticky Sidebar */}
      <DesktopSidebar />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full glass-modal p-5 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10 animate-slide-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-lg font-display text-slate-900 dark:text-white">
                  TaskPulse
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'today', label: 'Today', count: todayCount, icon: Calendar },
                { id: 'upcoming', label: 'Upcoming', icon: Clock },
                { id: 'overdue', label: 'Overdue', count: overdueCount, alert: true, icon: AlertTriangle },
                { id: 'completed', label: 'Completed', count: completedCount, icon: CheckCircle },
                { id: 'all', label: 'All Todos', count: allCount, icon: ListTodo },
                { id: 'categories', label: 'Categories', icon: Tags },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedCategory(null);
                      setActiveView(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeView === item.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          item.alert
                            ? 'bg-rose-500 text-white'
                            : activeView === item.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable View Content with responsive bottom clearance for mobile nav */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-6xl w-full mx-auto">
          <MainContentView />
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <MobileBottomNav />

      {/* Global Modals & Panels */}
      <NotificationPanel />
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CreateTodoModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        preset={createModalPreset}
      />
    </div>
  );
};
