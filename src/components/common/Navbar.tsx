import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { ThemeToggle } from "./ThemeToggle";
import {
  Calendar,
  LayoutDashboard,
  ListTodo,
  PieChart,
  Timer,
} from "lucide-react";

interface NavItemConfig {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  activeBg: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    activeBg: "bg-yellow-400 text-black dark:bg-yellow-400 dark:text-black",
  },
  {
    to: "/tasks",
    label: "Tasks",
    icon: ListTodo,
    activeBg: "bg-cyan-400 text-black dark:bg-cyan-400 dark:text-black",
  },
  {
    to: "/calendar",
    label: "Calendar",
    icon: Calendar,
    activeBg: "bg-emerald-400 text-black dark:bg-emerald-400 dark:text-black",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: PieChart,
    activeBg: "bg-purple-400 text-black dark:bg-purple-400 dark:text-black",
  },
  {
    to: "/pomodoro",
    label: "Focus",
    icon: Timer,
    activeBg: "bg-pink-400 text-black dark:bg-pink-400 dark:text-black",
  },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b-4 border-black dark:border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl uppercase tracking-tighter text-black dark:text-white flex items-center gap-1">
              ⚡ Study
              <span className="text-yellow-500 dark:text-yellow-400">Sync</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 xl:px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-all ${
                      isActive
                        ? `${item.activeBg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-[2px] -translate-x-[2px]`
                        : "bg-transparent text-black dark:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px]"
                    } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="bg-white dark:bg-black p-2 border-2 border-black dark:border-white flex items-center justify-center transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none">
              <UserButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden border-t-2 border-black dark:border-white bg-white dark:bg-black overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex justify-start gap-3 p-3 min-w-max">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest text-xs transition-all shrink-0 ${
                  isActive
                    ? `${item.activeBg} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-[1px] -translate-x-[1px]`
                    : "bg-transparent text-black dark:text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[1px] hover:-translate-x-[1px]"
                } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
