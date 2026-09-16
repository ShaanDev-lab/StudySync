import type { ComponentType } from "react";

interface SectionStatProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ size?: number; className?: string }>;
  variant?: "default" | "alert";
}

export default function SectionStat({
  title,
  value,
  icon: Icon,
  variant,
}: SectionStatProps) {
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
