import { Show, UserButton } from "@clerk/react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { ComponentType, FormEvent } from "react";
import LoginPage from "./LoginPage";
import Navbar from "../components/common/Navbar";
import {
  useCollisionData,
  getRelativeTime,
  type Clash,
  type Subject,
  type Task,
  type TaskFormState,
} from "../contexts/CollisionContext";

const categoryClasses: Record<string, string> = {
  Exam: "bg-red-300",
  Assignment: "bg-blue-300",
  Project: "bg-purple-300",
  Quiz: "bg-pink-300",
  General: "bg-neutral-300",
};



function SectionStat({
  title,
  value,
  icon: Icon,
  variant,
}: {
  title: string;
  value: number | string;
  icon: ComponentType<{ size?: number; className?: string }>;
  variant?: "default" | "alert";
}) {
  return (
    <div
      className={`p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex items-center justify-between ${
        variant === "alert"
          ? "bg-red-400 text-black dark:bg-red-500 dark:text-white"
          : "bg-white dark:bg-black"
      }`}
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1 opacity-80">
          {title}
        </p>
        <h3 className="text-4xl font-extrabold">{value}</h3>
      </div>
      <Icon size={40} className="text-black dark:text-white" />
    </div>
  );
}

function TaskCard({
  task,
  clashing,
  weeklyTimeMinutes,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  task: Task;
  clashing: boolean;
  weeklyTimeMinutes?: number;
  onEdit: (task: Task) => void;
  onDelete: (id: number, title: string) => void;
  onToggleStatus: (id: number) => void;
}) {
  const isCompleted = task.status === "Completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-white dark:bg-black p-6 border-2 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col ${
        isCompleted
          ? "border-green-500 opacity-75 bg-neutral-50 dark:bg-neutral-950"
          : clashing
            ? "border-black dark:border-white"
            : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={`px-3 py-1 border-2 border-black dark:border-white text-[10px] font-bold uppercase tracking-widest text-black ${
              categoryClasses[task.category] || categoryClasses.General
            }`}
          >
            {task.category}
          </span>
          <span
            className="px-3 py-1 border-2 border-black dark:border-white text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black"
          >
            Score: {task.priority_score || 0}
          </span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id, task.title)}
            className="p-2 border border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className={`text-2xl font-extrabold tracking-tight line-clamp-2 ${isCompleted ? "line-through text-neutral-400 dark:text-neutral-500" : ""}`}>
          {task.title}
        </h3>
        <button
          onClick={() => onToggleStatus(task.id)}
          title={isCompleted ? "Mark as Pending" : "Mark as Done"}
          className={`px-3 py-1 border-2 border-black dark:border-white font-bold text-xs uppercase tracking-widest transition-all shrink-0 flex items-center gap-1 ${
            isCompleted
              ? "bg-green-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}
        >
          <CheckCircle2 size={14} />
          {isCompleted ? "Done" : "Mark Done"}
        </button>
      </div>

      <p className={`text-neutral-500 dark:text-neutral-400 font-medium mb-4 line-clamp-3 flex-1 ${isCompleted ? "line-through opacity-60" : ""}`}>
        {task.description || "No description provided."}
      </p>

      {weeklyTimeMinutes !== undefined && weeklyTimeMinutes > 0 && (
        <div className="mb-4 inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-200 border-2 border-yellow-500 font-extrabold text-xs uppercase tracking-wider w-fit">
          <Clock size={12} />
          <span>
            {weeklyTimeMinutes >= 60
              ? `${Math.floor(weeklyTimeMinutes / 60)}h ${weeklyTimeMinutes % 60}m`
              : `${weeklyTimeMinutes}m`}{" "}
            focused this week
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-t-2 border-black dark:border-white pt-4 mt-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-bold">
            <Clock size={18} />
            <span className="text-sm">
              {new Date(task.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span
            className={`inline-block px-2 py-1 mt-1 text-[10px] font-bold uppercase tracking-widest w-fit border-2 ${
              getRelativeTime(task.deadline) === "Overdue"
                ? "bg-red-100 text-red-800 border-red-800 dark:bg-red-900/30 dark:text-red-200 dark:border-red-200"
                : getRelativeTime(task.deadline) === "Today!"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-200"
                  : "bg-neutral-100 text-neutral-800 border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-200"
            }`}
          >
            {getRelativeTime(task.deadline)}
          </span>
        </div>
        {clashing ? (
          <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest px-2 py-1 bg-red-600 text-white dark:bg-red-500">
            <AlertTriangle size={12} />
            Clash
          </div>
        ) : (
          <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <CheckCircle2 size={12} />
            Clear
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RecommendationCard({ task }: { task: Task }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 p-8 bg-white dark:bg-black text-black dark:text-white flex flex-col md:flex-row items-center md:items-start gap-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
    >
      <div className="p-4 border-2 border-black dark:border-white shrink-0 bg-transparent">
        <Star
          size={40}
          className="text-yellow-500 dark:text-yellow-400"
          fill="currentColor"
        />
      </div>
      <div className="flex-1 text-center md:text-left">
        <div className="inline-block px-4 py-1 border-2 border-black dark:border-white text-xs font-bold uppercase tracking-widest mb-4 bg-yellow-400 text-black">
          Start This First
        </div>
        <h3 className="font-extrabold text-4xl mb-2 tracking-tight text-black dark:text-white">
          {task.title}
        </h3>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">
          Highest priority task based on category weight and estimated effort.
        </p>
        <div className="flex items-center justify-center md:justify-start gap-2 font-bold border-2 border-black dark:border-white w-fit px-5 py-2 mx-auto md:mx-0 text-black dark:text-white">
          <Clock size={18} />
          <span>
            Due:{" "}
            {new Date(task.deadline).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function TaskFormModal({
  open,
  title,
  editing,
  formData,
  subjects,
  onClose,
  onSubmit,
  onChange,
  onOpenSubjectModal,
}: {
  open: boolean;
  title: string;
  editing: boolean;
  formData: TaskFormState;
  subjects: Subject[];
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onChange: (data: TaskFormState) => void;
  onOpenSubjectModal?: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-xl overflow-hidden"
      >
        <div className="p-6 border-b-4 border-black dark:border-white flex justify-between items-center bg-neutral-100 dark:bg-neutral-900">
          <h2 className="text-2xl font-extrabold uppercase tracking-widest">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest">
              Task Title
            </label>
            <input
              required
              type="text"
              placeholder="e.g., Final Year DBMS Viva"
              className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white font-medium"
              value={formData.title}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest">
                  Subject
                </label>
                {onOpenSubjectModal && (
                  <button
                    type="button"
                    onClick={onOpenSubjectModal}
                    className="text-xs font-bold uppercase underline text-black dark:text-white hover:opacity-70"
                  >
                    + Add Subject
                  </button>
                )}
              </div>
              <select
                required
                className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none appearance-none font-medium"
                value={formData.subject_id}
                onChange={(e) =>
                  onChange({ ...formData, subject_id: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Subject
                </option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
              {subjects.length === 0 && (
                <p className="text-[10px] font-bold mt-1 text-red-500">
                  Please add a subject first!
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">
                Category
              </label>
              <select
                className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none appearance-none font-medium"
                value={formData.category}
                onChange={(e) =>
                  onChange({ ...formData, category: e.target.value })
                }
              >
                <option>General</option>
                <option>Assignment</option>
                <option>Exam</option>
                <option>Project</option>
                <option>Quiz</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">
                Estimated Effort (1-10)
              </label>
              <input
                required
                type="number"
                min="1"
                max="10"
                className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none font-medium"
                value={formData.estimated_effort}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    estimated_effort: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">
                Deadline
              </label>
              <input
                required
                type="datetime-local"
                className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none font-medium"
                value={formData.deadline}
                onChange={(e) =>
                  onChange({ ...formData, deadline: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief details about the task..."
              className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none resize-none font-medium"
              value={formData.description}
              onChange={(e) =>
                onChange({ ...formData, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-widest text-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors mt-8"
          >
            {editing ? "Apply Changes" : "Create Task"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function SubjectModal({
  open,
  subjects,
  newSubjectName,
  onClose,
  onNewSubjectNameChange,
  onSubmit,
  onDeleteSubject,
}: {
  open: boolean;
  subjects: Subject[];
  newSubjectName: string;
  onClose: () => void;
  onNewSubjectNameChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onDeleteSubject: (id: number, name: string) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b-4 border-black dark:border-white flex justify-between items-center bg-neutral-100 dark:bg-neutral-900">
          <h2 className="text-xl font-extrabold uppercase tracking-widest">
            Subjects
          </h2>
          <button
            onClick={onClose}
            className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-60 overflow-y-auto space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest">
            Existing Subjects
          </label>
          {subjects.length === 0 ? (
            <p className="text-sm font-medium p-4 border-2 border-dashed border-black dark:border-white text-center">
              No subjects added yet.
            </p>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.subject_id}
                className="flex items-center justify-between p-4 border-2 border-black dark:border-white group"
              >
                <span className="font-bold">{subject.subject_name}</span>
                <button
                  onClick={() =>
                    onDeleteSubject(subject.subject_id, subject.subject_name)
                  }
                  className="p-2 border-2 border-transparent hover:border-black dark:hover:border-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={onSubmit} className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest">
              Add New
            </label>
            <div className="flex gap-3">
              <input
                required
                type="text"
                placeholder="e.g., Mathematics"
                className="flex-1 px-4 py-3 border-2 border-black dark:border-white bg-transparent focus:outline-none font-medium"
                value={newSubjectName}
                onChange={(e) => onNewSubjectNameChange(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function DeleteConfirmationModal({
  open,
  type,
  title,
  onClose,
  onConfirm,
}: {
  open: boolean;
  type: "task" | "subject" | null;
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-sm overflow-hidden"
      >
        <div className="p-6 border-b-4 border-black dark:border-white flex justify-between items-center bg-red-100 dark:bg-red-900">
          <h2 className="text-xl font-extrabold uppercase tracking-widest text-red-900 dark:text-red-100">
            Confirm Deletion
          </h2>
          <button
            onClick={onClose}
            className="p-2 border-2 border-red-900 dark:border-red-100 text-red-900 dark:text-red-100 hover:bg-red-900 hover:text-white dark:hover:bg-red-100 dark:hover:text-red-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8">
          <p className="text-lg font-bold mb-2">
            Are you sure you want to delete this {type}?
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-8 border-l-4 border-black dark:border-white pl-4">
            {title}
          </p>

          {type === "subject" && (
            <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-800 dark:text-red-200 text-sm font-bold flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <p>
                Deleting this subject will also delete ALL associated tasks.
                This action cannot be undone.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white font-extrabold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 border-2 border-red-600 bg-red-600 text-white font-extrabold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const dashboard = useCollisionData();

  const recommendedTask =
    dashboard.tasks.length > 0
      ? dashboard.tasks.reduce((prev, current) => {
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
        })
      : null;

  const dueThisWeek = dashboard.tasks.filter((task) => {
    const deadline = new Date(task.deadline).getTime();
    const now = new Date().getTime();
    return deadline >= now && deadline <= now + 7 * 24 * 60 * 60 * 1000;
  }).length;

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
