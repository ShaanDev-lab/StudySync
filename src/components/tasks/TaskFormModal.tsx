import type { FormEvent } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import type { Subject, TaskFormState } from "../../contexts/CollisionContext";

interface TaskFormModalProps {
  open: boolean;
  title: string;
  editing: boolean;
  formData: TaskFormState;
  subjects: Subject[];
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onChange: (data: TaskFormState) => void;
  onOpenSubjectModal?: () => void;
}

export default function TaskFormModal({
  open,
  title,
  editing,
  formData,
  subjects,
  onClose,
  onSubmit,
  onChange,
  onOpenSubjectModal,
}: TaskFormModalProps) {
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
