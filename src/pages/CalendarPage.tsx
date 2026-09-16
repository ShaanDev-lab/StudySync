import React, { useState } from "react";
import { Show } from "@clerk/react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import Navbar from "../components/common/Navbar";
import LoginPage from "./LoginPage";
import { useCollisionData, type Task } from "../contexts/CollisionContext";
import { getDaysInMonth, startOfMonth, getDay, addMonths, subMonths, format, isSameDay } from "date-fns";

export default function CalendarPage() {
  const dashboard = useCollisionData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getDay(startOfMonth(currentDate));
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getTasksForDay = (day: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dashboard.tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return isSameDay(dateToCheck, taskDate);
    });
  };

  const hasClashForDay = (day: number) => {
    const dayTasks = getTasksForDay(day);
    return dayTasks.some(t => dashboard.isClashing(t.id));
  };

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <Show when="signed-out">
        <LoginPage />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors">
          <Navbar />
          <div className="max-w-6xl mx-auto p-4 md:p-12">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-4">
                  Calendar
                </h1>
                <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400">
                  Your deadlines at a glance.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-black border-4 border-black dark:border-white p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <button
                  onClick={prevMonth}
                  className="p-3 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-extrabold uppercase tracking-widest min-w-[200px] text-center">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-3 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </header>

            <div className="border-4 border-black dark:border-white bg-white dark:bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b-4 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900">
                {WEEKDAYS.map(day => (
                  <div key={day} className="p-4 text-center font-extrabold uppercase tracking-widest border-r-4 last:border-r-0 border-black dark:border-white text-sm md:text-base">
                    <span className="hidden md:inline">{day}</span>
                    <span className="md:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
                {blanks.map(blank => (
                  <div key={`blank-${blank}`} className="border-b-2 border-r-2 border-black dark:border-white bg-neutral-50 dark:bg-neutral-950/30 p-2 min-h-[120px]" />
                ))}
                
                {days.map(day => {
                  const dayTasks = getTasksForDay(day);
                  const isToday = isSameDay(new Date(), new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                  const hasClash = hasClashForDay(day);
                  
                  return (
                    <div 
                      key={`day-${day}`} 
                      className={`border-b-2 border-r-2 last:border-r-0 border-black dark:border-white p-2 min-h-[120px] transition-colors relative group ${
                        isToday ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-lg font-extrabold w-8 h-8 flex items-center justify-center ${
                          isToday ? 'bg-black text-white dark:bg-white dark:text-black rounded-full' : ''
                        }`}>
                          {day}
                        </span>
                        {hasClash && (
                           <AlertTriangle size={16} className="text-red-600 dark:text-red-500" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayTasks.map(task => (
                           <div 
                            key={task.id} 
                            className={`text-[10px] font-bold p-1 truncate border border-black dark:border-white ${
                              dashboard.isClashing(task.id) ? 'bg-red-600 text-white' : 'bg-white dark:bg-black text-black dark:text-white'
                            }`}
                            title={`${task.title} - ${format(new Date(task.deadline), 'HH:mm')}`}
                           >
                             {format(new Date(task.deadline), 'HH:mm')} {task.title}
                           </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
