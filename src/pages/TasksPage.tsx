import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Trash2, Edit2, AlertTriangle, Plus, CheckCircle2 } from "lucide-react";
import { useCollisionData, type Task } from "../contexts/CollisionContext";
import Navbar from "../components/common/Navbar";
import { Show } from "@clerk/react";
import LoginPage from "./LoginPage";

export default function TasksPage() {
  const dashboard = useCollisionData();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const filteredTasks = dashboard.tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectName = dashboard.subjects.find(s => s.subject_id === task.subject_id)?.subject_name || "Unknown";
    const matchesSubject =
      subjectFilter === "All" || subjectName === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const subjects = ["All", ...dashboard.subjects.map((s) => s.subject_name)];

  return (
    <>
      <Show when="signed-out">
        <LoginPage />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors">
          <Navbar />
          <div className="max-w-6xl mx-auto p-4 md:p-12">
            <header className="mb-12">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-4">
                All Tasks
              </h1>
              <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400">
                Manage and filter your upcoming deadlines.
              </p>
            </header>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-black p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-12 flex flex-col md:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full bg-transparent border-2 border-black dark:border-white py-3 pl-12 pr-4 font-bold focus:outline-none focus:ring-0 text-black dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="text-black dark:text-white" size={20} />
                <select
                  className="bg-transparent border-2 border-black dark:border-white py-3 px-4 font-bold focus:outline-none appearance-none text-black dark:text-white min-w-[200px]"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task List */}
            <div className="border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-bold text-xl uppercase tracking-widest text-neutral-500">
                    No tasks match your filters.
                  </p>
                </div>
              ) : (
                <div className="divide-y-4 divide-black dark:divide-white">
                  {filteredTasks.map((task, idx) => {
                    const clashing = dashboard.isClashing(task.id);
                    const subjectName = dashboard.subjects.find(s => s.subject_id === task.subject_id)?.subject_name || "Unknown";

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-6 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-extrabold tracking-tight">
                              {task.title}
                            </h3>
                            {clashing && (
                              <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                <AlertTriangle size={12} />
                                Clash
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-bold uppercase tracking-widest">
                            <span className="bg-neutral-200 dark:bg-neutral-800 px-3 py-1 border-2 border-black dark:border-white text-black dark:text-white">
                              {subjectName}
                            </span>
                            <span className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 border-2 border-black dark:border-white">
                              {task.category}
                            </span>
                            <span className="bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white px-3 py-1 border-2 border-black dark:border-white">
                              Score: {task.priority_score || 0}
                            </span>
                            <span className="text-neutral-600 dark:text-neutral-400">
                              {new Date(task.deadline).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <button
                            onClick={() => dashboard.startEdit(task)}
                            className="p-3 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => dashboard.handleDelete(task.id, task.title)}
                            className="p-3 border-2 border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
