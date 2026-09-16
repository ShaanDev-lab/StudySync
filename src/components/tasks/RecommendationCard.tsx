import { motion } from "motion/react";
import { Star, Clock } from "lucide-react";
import type { Task } from "../../contexts/CollisionContext";

interface RecommendationCardProps {
  task: Task;
}

export default function RecommendationCard({ task }: RecommendationCardProps) {
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
