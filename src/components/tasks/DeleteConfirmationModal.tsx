import { motion } from "motion/react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  type: "task" | "subject" | null;
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  open,
  type,
  title,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
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
