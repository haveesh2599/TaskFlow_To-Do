import { useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';
import { Categories } from './pages/Categories';
import { Completed } from './pages/Completed';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { MyTasks } from './pages/MyTasks';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { Today } from './pages/Today';
import { Upcoming } from './pages/Upcoming';
import { VerifyEmailGate } from './pages/VerifyEmailGate';
import type { NavSection, Task, TaskCategory, TaskInput } from './types/task';

function TaskFlowWorkspace() {
  const {
    user,
    profile,
    authLoading,
    profileError,
    refreshAuthState,
    retryProfileSync,
    logout,
  } = useAuth();
  const { showToast } = useToast();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<TaskCategory | undefined>(
    undefined
  );
  const [modalDefaultDate, setModalDefaultDate] = useState<Date | undefined>(undefined);

  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  const {
    tasks,
    loading,
    error,
    stats,
    completedTasks,
    overdueTasks,
    todayTasks,
    tomorrowTasks,
    thisWeekTasks,
    upcomingTasks,
    recentActivity,
    categoryCounts,
    getTasksForDate,
    addTask,
    editTask,
    toggleComplete,
    removeTask,
  } = useTasks();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7F4] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-[#777F78]">
          <div className="w-5 h-5 border-2 border-[#E5E9E4] border-t-[#52765D] rounded-full animate-spin" />
          <span>Loading TaskFlow...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  if (!user.emailVerified) {
    return (
      <VerifyEmailGate
        user={user}
        onRefresh={refreshAuthState}
        onLogout={logout}
      />
    );
  }

  const displayName =
    profile?.displayName ||
    user.displayName ||
    user.email?.split('@')[0] ||
    'User';
  const userEmail = profile?.email || user.email || '';

  const openNewTaskModal = (options?: {
    category?: TaskCategory;
    date?: Date;
  }) => {
    setEditingTask(null);
    setModalDefaultCategory(options?.category);
    setModalDefaultDate(options?.date);
    setModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setModalDefaultCategory(undefined);
    setModalDefaultDate(undefined);
    setModalOpen(true);
  };

  const handleSaveTask = async (input: TaskInput) => {
    if (editingTask) {
      await editTask(editingTask.id, input);
      showToast('Task updated.', 'success');
    } else {
      await addTask(input);
      showToast('Task created.', 'success');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const nextCompleted = !task.completed;
    try {
      await toggleComplete(task.id, nextCompleted);
      showToast(
        nextCompleted ? 'Task marked as completed.' : 'Task marked as pending.',
        'success'
      );
    } catch {
      showToast('Failed to update task status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setDeletingInProgress(true);
    try {
      await removeTask(deletingTask.id);
      showToast('Task deleted.', 'success');
      setDeletingTask(null);
    } catch {
      showToast('Failed to delete task.', 'error');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Signed out of TaskFlow.', 'info');
    } catch {
      showToast('Failed to sign out.', 'error');
    }
  };

  const pendingTodayCount = todayTasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#F6F7F4] flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userName={displayName}
        userEmail={userEmail}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        counts={{
          all: stats.pending,
          today: pendingTodayCount,
          upcoming: upcomingTasks.length,
          completed: completedTasks.length,
        }}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          activeSection={activeSection}
          userName={displayName}
          pendingTodayCount={pendingTodayCount}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onAddTask={() =>
            openNewTaskModal({
              date: activeSection === 'today' ? new Date() : undefined,
            })
          }
        />

        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            {error || profileError ? (
              <div
                role="alert"
                className="mb-6 px-4 py-3 text-sm text-[#B3433E] bg-[#FBECEB] border border-[#EBC3C1] rounded-lg flex flex-wrap items-center justify-between gap-3"
              >
                <span>
                  Unable to synchronize with Cloud Firestore. Please verify your
                  connection and try again.
                </span>
                {profileError ? (
                  <button
                    type="button"
                    onClick={() => void retryProfileSync()}
                    className="px-3 py-1.5 text-xs font-medium text-[#B3433E] bg-[#FFFFFF] border border-[#EBC3C1] hover:bg-[#FDF6F6] rounded-md transition-colors cursor-pointer"
                  >
                    Retry connection
                  </button>
                ) : null}
              </div>
            ) : null}

            {activeSection === 'dashboard' ? (
              <Dashboard
                stats={stats}
                todayTasks={todayTasks}
                upcomingTasks={upcomingTasks}
                recentActivity={recentActivity}
                loading={loading}
                onToggleComplete={handleToggleComplete}
                onEditTask={openEditTaskModal}
                onDeleteTask={setDeletingTask}
                onAddTask={() => openNewTaskModal()}
                onNavigate={setActiveSection}
              />
            ) : null}

            {activeSection === 'my-tasks' ? (
              <MyTasks
                tasks={tasks}
                loading={loading}
                onToggleComplete={handleToggleComplete}
                onEditTask={openEditTaskModal}
                onDeleteTask={setDeletingTask}
                onAddTask={() => openNewTaskModal()}
              />
            ) : null}

            {activeSection === 'today' ? (
              <Today
                todayTasks={todayTasks}
                overdueTasks={overdueTasks}
                loading={loading}
                onToggleComplete={handleToggleComplete}
                onEditTask={openEditTaskModal}
                onDeleteTask={setDeletingTask}
                onAddTask={() => openNewTaskModal({ date: new Date() })}
              />
            ) : null}

            {activeSection === 'upcoming' ? (
              <Upcoming
                allTasks={tasks}
                overdueTasks={overdueTasks}
                todayTasks={todayTasks}
                tomorrowTasks={tomorrowTasks}
                thisWeekTasks={thisWeekTasks}
                getTasksForDate={getTasksForDate}
                loading={loading}
                onToggleComplete={handleToggleComplete}
                onEditTask={openEditTaskModal}
                onDeleteTask={setDeletingTask}
                onAddTaskForDate={(date) => openNewTaskModal({ date })}
              />
            ) : null}

            {activeSection === 'completed' ? (
              <Completed
                completedTasks={completedTasks}
                loading={loading}
                onToggleComplete={handleToggleComplete}
                onEditTask={openEditTaskModal}
                onDeleteTask={setDeletingTask}
              />
            ) : null}

            {activeSection === 'categories' ? (
              <Categories
                tasks={tasks}
                categoryCounts={categoryCounts}
                loading={loading}
                onToggleComplete={handleToggleComplete}
                onEditTask={openEditTaskModal}
                onDeleteTask={setDeletingTask}
                onAddTaskInCategory={(category) =>
                  openNewTaskModal({ category })
                }
              />
            ) : null}

            {activeSection === 'settings' ? <Settings /> : null}
          </div>
        </main>
      </div>

      <TaskModal
        open={modalOpen}
        editingTask={editingTask}
        defaultCategory={modalDefaultCategory || profile?.defaultCategory || 'Personal'}
        defaultPriority={profile?.defaultPriority || 'Medium'}
        defaultDate={modalDefaultDate}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete task"
        message={
          deletingTask
            ? `Are you sure you want to permanently delete "${deletingTask.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete task"
        loading={deletingInProgress}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <TaskFlowWorkspace />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
