import { useMemo } from "react";
import { Show } from "@clerk/react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import LoginPage from "./LoginPage";
import Navbar from "../components/common/Navbar";
import SectionStat from "../components/dashboard/SectionStat";
import TaskCard from "../components/tasks/TaskCard";
import RecommendationCard from "../components/tasks/RecommendationCard";
import TaskFormModal from "../components/tasks/TaskFormModal";
import SubjectModal from "../components/tasks/SubjectModal";
import DeleteConfirmationModal from "../components/tasks/DeleteConfirmationModal";
import { useCollisionData, type Clash } from "../contexts/CollisionContext";

export default function DashboardPage() {
  const dashboard = useCollisionData();

  const recommendedTask = useMemo(() => {
    if (dashboard.tasks.length === 0) return null;
    return dashboard.tasks.reduce((prev, current) => {
      const prevScore = prev.priority_score || 0;
      const currScore = current.priority_score || 0;

      if (currScore > prevScore) return current;
      if (
        currScore === prevScore &&
        new Date(current.deadline) < new Date(prev.deadline)
      ) {
        return current;
      }
      return prev;
    });
  }, [dashboard.tasks]);

  const dueThisWeek = useMemo(() => {
    const now = new Date().getTime();
    const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;
    return dashboard.tasks.filter((task) => {
      const deadline = new Date(task.deadline).getTime();
      return deadline >= now && deadline <= oneWeekFromNow;
    }).length;
  }, [dashboard.tasks]);

  return (
    <>
      <Show when="signed-out">
        <LoginPage />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors">
          <Navbar />
          <div className="max-w-6xl mx-auto p-4 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 border-b-2 border-black dark:border-white pb-6">
              <div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-black dark:text-white leading-none">
                  Overview
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => dashboard.setShowSubjectForm(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  New Subject
                </button>
                <button
                  onClick={dashboard.openCreateTask}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95"
                  id="add-task-btn"
                >
                  <Plus size={20} />
                  Add New Task
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <SectionStat
                title="Total Tasks"
                value={dashboard.tasks.length}
                icon={Calendar}
              />
              <SectionStat
                title="Due This Week"
                value={dueThisWeek}
                icon={Clock}
              />
              <SectionStat
                title="Collision Status"
                value={
                  dashboard.clashes.length === 0
                    ? "All Clear!"
                    : `${dashboard.clashes.length} Clashes`
                }
                icon={
                  dashboard.clashes.length === 0 ? CheckCircle2 : AlertTriangle
                }
                variant={dashboard.clashes.length === 0 ? "default" : "alert"}
              />
            </div>

            {dashboard.clashes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 p-6 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white flex items-start gap-4"
              >
                <div className="p-2 bg-red-400 text-white dark:bg-red-500 dark:text-white shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-wider">
                    Deadline Clashes Detected
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1 font-medium">
                    The following tasks have deadlines within 24 hours of each
                    other. Consider rescheduling.
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    {dashboard.clashes.map((clash: Clash, idx: number) => {
                      const relatedSuggestion = dashboard.suggestions.find(
                        (suggestion) =>
                          suggestion.task_id === clash.task1_id ||
                          suggestion.task_id === clash.task2_id,
                      );
                      const targetTaskTitle =
                        relatedSuggestion?.task_id === clash.task1_id
                          ? clash.task1_title
                          : clash.task2_title;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-4 bg-white dark:bg-black border-2 border-black dark:border-white"
                        >
                          <span className="text-sm font-bold uppercase tracking-widest">
                            "{clash.task1_title}" vs "{clash.task2_title}"
                          </span>
                          {relatedSuggestion && (
                            <div className="mt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t-2 border-dashed border-neutral-300 dark:border-neutral-700 pt-3">
                              <div>
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                                  Smart Reschedule Suggestion
                                </p>
                                <p className="text-sm font-bold">
                                  Move "{targetTaskTitle}" to{" "}
                                  {new Date(
                                    relatedSuggestion.suggested_date,
                                  ).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-2 w-full md:w-auto">
                                <button
                                  onClick={() =>
                                    dashboard.handleSuggestion(
                                      relatedSuggestion.id,
                                      "accept",
                                    )
                                  }
                                  className="flex-1 md:flex-none px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:border-emerald-600 dark:hover:border-emerald-500 border-2 border-black dark:border-white transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    dashboard.handleSuggestion(
                                      relatedSuggestion.id,
                                      "reject",
                                    )
                                  }
                                  className="flex-1 md:flex-none px-4 py-2 border-2 border-black dark:border-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {recommendedTask && <RecommendationCard task={recommendedTask} />}

            {dashboard.error && (
              <div className="border-2 border-black dark:border-white p-8 mb-12 text-center bg-red-50 dark:bg-red-950/20">
                <AlertTriangle
                  className="mx-auto text-black dark:text-white mb-4"
                  size={40}
                />
                <h3 className="font-extrabold text-2xl uppercase tracking-wider mb-2">
                  Backend Connection Error
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium max-w-lg mx-auto">
                  The application is unable to connect to your MySQL database.
                  If you are testing this locally, make sure your MySQL server
                  (XAMPP/MySQL) is running.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {dashboard.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    clashing={dashboard.isClashing(task.id)}
                    weeklyTimeMinutes={dashboard.weeklyStats[task.id]}
                    onEdit={dashboard.startEdit}
                    onDelete={dashboard.handleDelete}
                    onToggleStatus={dashboard.toggleTaskStatus}
                  />
                ))}
              </AnimatePresence>

              {dashboard.tasks.length === 0 && !dashboard.loading && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-black dark:border-white">
                  <Clock className="mx-auto mb-6" size={64} />
                  <p className="font-bold text-2xl uppercase tracking-widest">
                    No tasks found.
                  </p>
                  <p className="text-neutral-500 mt-2 font-medium">
                    Time to add some deadlines.
                  </p>
                </div>
              )}
            </div>

            <TaskFormModal
              open={dashboard.showForm}
              title={dashboard.editingTask ? "Edit Task" : "New Task"}
              editing={Boolean(dashboard.editingTask)}
              formData={dashboard.formData}
              subjects={dashboard.subjects}
              onClose={() => dashboard.setShowForm(false)}
              onSubmit={dashboard.handleSubmit}
              onChange={dashboard.setFormData}
              onOpenSubjectModal={() => dashboard.setShowSubjectForm(true)}
            />

            <SubjectModal
              open={dashboard.showSubjectForm}
              subjects={dashboard.subjects}
              newSubjectName={dashboard.newSubjectName}
              onClose={() => dashboard.setShowSubjectForm(false)}
              onNewSubjectNameChange={dashboard.setNewSubjectName}
              onSubmit={dashboard.handleAddSubject}
              onDeleteSubject={dashboard.handleDeleteSubject}
            />

            <DeleteConfirmationModal
              open={dashboard.deleteConfirmation.isOpen}
              type={dashboard.deleteConfirmation.type}
              title={dashboard.deleteConfirmation.title}
              onClose={() =>
                dashboard.setDeleteConfirmation({
                  isOpen: false,
                  type: null,
                  id: null,
                })
              }
              onConfirm={dashboard.confirmDelete}
            />
          </div>
        </div>
      </Show>
    </>
  );
}
