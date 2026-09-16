import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CollisionProvider } from "./contexts/CollisionContext";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const PomodoroPage = lazy(() => import("./pages/PomodoroPage"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center font-sans">
      <div className="p-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex items-center gap-4 bg-white dark:bg-black">
        <div className="w-5 h-5 border-4 border-black dark:border-white border-t-transparent animate-spin" />
        <span className="font-extrabold uppercase tracking-widest text-sm">
          Loading StudySync...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CollisionProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
          </Routes>
        </Suspense>
      </CollisionProvider>
    </BrowserRouter>
  );
}
