import { useNavigate } from "react-router-dom";
import { Bell, FileText, User, AlertTriangle, ArrowRight } from "lucide-react";
import { formatRelativeTime, cn } from "../../lib/utils";
import type { Notification } from "../../types";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  isLoading?: boolean;
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "document.shared":
    case "document.updated":
    case "document.uploaded":
    case "document.deleted":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "storage.quota_warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "user.role_change":
    case "user.invite":
      return <User className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-slate-500" />;
  }
}

function getNotificationBg(type: Notification["type"]) {
  switch (type) {
    case "document.shared":
    case "document.updated":
    case "document.uploaded":
      return "bg-blue-50";
    case "document.deleted":
      return "bg-red-50";
    case "storage.quota_warning":
      return "bg-amber-50";
    case "user.role_change":
    case "user.invite":
      return "bg-purple-50";
    default:
      return "bg-slate-50";
  }
}

export function NotificationList({ notifications, onMarkAsRead, isLoading }: NotificationListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <Bell className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No notifications</h3>
        <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "rounded-lg border bg-white p-4 transition-all hover:shadow-sm cursor-pointer",
            notification.isRead ? "border-slate-200" : "border-blue-200 bg-blue-50/30"
          )}
          onClick={() => {
            if (!notification.isRead) onMarkAsRead(notification.id);
            if (notification.resourceType === "document" && notification.resourceId) {
              navigate(`/documents/${notification.resourceId}`);
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full shrink-0", getNotificationBg(notification.type))}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{notification.title}</h4>
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{notification.message}</p>
              <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(notification.createdAt)}</p>
            </div>
            {notification.resourceId && (
              <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 mt-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
