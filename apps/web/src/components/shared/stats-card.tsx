import { type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      {change && (
        <div className="mt-2 flex items-center gap-1">
          {changeType === "positive" && (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          )}
          {changeType === "negative" && (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span
            className={cn("text-xs font-medium", {
              "text-emerald-600": changeType === "positive",
              "text-red-600": changeType === "negative",
              "text-slate-500": changeType === "neutral",
            })}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
