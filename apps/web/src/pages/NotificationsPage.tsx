import { useState } from "react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../hooks/use-notifications";
import { NotificationList } from "../components/notifications/notification-list";
import { CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page, 20);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated on document activity and system alerts
          </p>
        </div>
        <button
          onClick={() => markAllAsRead.mutate()}
          disabled={!data?.items?.some((n) => !n.isRead)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      <NotificationList
        notifications={data?.items || []}
        onMarkAsRead={(id) => markAsRead.mutate(id)}
        isLoading={isLoading}
      />

      {data && data.total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} · {data.total} total
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.items.length < 20}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
