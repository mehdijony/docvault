import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../shared/data-table";
import { formatDateTime, cn } from "../../lib/utils";
import type { AuditLog } from "../../types";
import {
  Upload,
  Download,
  Eye,
  Trash2,
  Share2,
  FileEdit,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  Building,
  Settings,
} from "lucide-react";

interface AuditTableProps {
  logs: AuditLog[];
  pageCount: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function getActionIcon(action: string) {
  switch (action) {
    case "document.upload": return <Upload className="h-4 w-4 text-blue-500" />;
    case "document.download": return <Download className="h-4 w-4 text-emerald-500" />;
    case "document.view": return <Eye className="h-4 w-4 text-slate-500" />;
    case "document.delete": return <Trash2 className="h-4 w-4 text-red-500" />;
    case "document.share": return <Share2 className="h-4 w-4 text-purple-500" />;
    case "document.update": return <FileEdit className="h-4 w-4 text-amber-500" />;
    case "user.login": return <LogIn className="h-4 w-4 text-emerald-500" />;
    case "user.logout": return <LogOut className="h-4 w-4 text-slate-500" />;
    case "user.invite": return <UserPlus className="h-4 w-4 text-blue-500" />;
    case "user.role_change": return <Shield className="h-4 w-4 text-purple-500" />;
    case "org.created": return <Building className="h-4 w-4 text-blue-500" />;
    case "org.settings_update": return <Settings className="h-4 w-4 text-amber-500" />;
    default: return <Eye className="h-4 w-4 text-slate-400" />;
  }
}

function getActionBadgeColor(action: string): string {
  if (action.startsWith("document")) {
    switch (action) {
      case "document.upload": return "bg-blue-50 text-blue-700 border-blue-200";
      case "document.download": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "document.delete": return "bg-red-50 text-red-700 border-red-200";
      case "document.share": return "bg-purple-50 text-purple-700 border-purple-200";
      case "document.update": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }
  if (action.startsWith("user")) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export function AuditTable({ logs, pageCount, pageIndex, onPageChange, isLoading }: AuditTableProps) {
  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getActionIcon(row.original.action)}
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border", getActionBadgeColor(row.original.action))}>
            {row.original.action}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "resourceType",
      header: "Resource",
      cell: ({ row }) => (
        <div>
          <span className="text-sm font-medium text-slate-700 capitalize">
            {row.original.resourceType}
          </span>
          <p className="text-xs text-slate-400 font-mono">
            {row.original.resourceId.slice(0, 12)}...
          </p>
        </div>
      ),
    },
    {
      accessorKey: "userId",
      header: "User ID",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 font-mono">
          {row.original.userId.slice(0, 12)}...
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 font-mono">{row.original.ipAddress}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      pageCount={pageCount}
      pageIndex={pageIndex}
      onPageChange={onPageChange}
      isLoading={isLoading}
      emptyMessage="No audit logs found"
    />
  );
}
