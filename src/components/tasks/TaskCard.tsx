import { motion } from "motion/react";
import { Edit2, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getRelativeTime, type Task } from "../../contexts/CollisionContext";

const categoryClasses: Record<string, string> = {
  Exam: "bg-red-300",
  Assignment: "bg-blue-300",
  Project: "bg-purple-300",
  Quiz: "bg-pink-300",
  General: "bg-neutral-300",
};

interface TaskCardProps {
  task: Task;
  clashing: boolean;
  weeklyTimeMinutes?: number;
  onEdit: (task: Task) => void;
  onDelete: (id: number, title: string) => void;
  onToggleStatus: (id: number) => void;
}

export default function TaskCard({
  task,
  clashing,
  weeklyTimeMinutes,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskCardProps) {
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
