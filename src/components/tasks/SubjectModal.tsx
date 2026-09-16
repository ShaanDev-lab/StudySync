import type { FormEvent } from "react";
import { motion } from "motion/react";
import { X, Trash2, Plus } from "lucide-react";
import type { Subject } from "../../contexts/CollisionContext";

interface SubjectModalProps {
  open: boolean;
  subjects: Subject[];
  newSubjectName: string;
  onClose: () => void;
  onNewSubjectNameChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onDeleteSubject: (id: number, name: string) => void;
}

export default function SubjectModal({
  open,
  subjects,
  newSubjectName,
  onClose,
  onNewSubjectNameChange,
  onSubmit,
  onDeleteSubject,
}: SubjectModalProps) {
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
