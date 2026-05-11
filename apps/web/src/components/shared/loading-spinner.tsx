import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

export function LoadingSpinner({
  size = "md",
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-200 border-t-blue-600",
        sizeMap[size],
        className
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200",
        className
      )}
    />
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <LoadingSkeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
      </div>
      <LoadingSkeleton className="h-3 w-1/3" />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-10 w-10 rounded-lg" />
      </div>
      <LoadingSkeleton className="h-8 w-32 mt-3" />
      <LoadingSkeleton className="h-3 w-20 mt-2" />
    </div>
  );
}
