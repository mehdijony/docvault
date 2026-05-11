import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../shared/data-table";
import { getRoleBadgeColor, cn } from "../../lib/utils";
import type { User, UserRole } from "../../types";

interface UserTableProps {
  users: User[];
  isLoading?: boolean;
  onUpdateRole: (id: string, role: UserRole) => void;
  canManage: boolean;
}

export function UserTable({ users, isLoading, onUpdateRole, canManage }: UserTableProps) {
  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        if (!canManage || user.role === "owner") {
          return (
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", getRoleBadgeColor(user.role))}>
              {user.role}
            </span>
          );
        }
        return (
          <select
            value={user.role}
            onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
            className={cn("rounded-full px-2.5 py-1 text-xs font-medium border cursor-pointer", getRoleBadgeColor(user.role))}
          >
            <option value="admin">admin</option>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
          </select>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <div className={cn("h-2 w-2 rounded-full", row.original.status === "active" ? "bg-emerald-500" : "bg-slate-300")} />
          <span className="text-sm text-slate-600 capitalize">{row.original.status}</span>
        </div>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {row.original.lastLoginAt
            ? new Date(row.original.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "Never"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      emptyMessage="No users found"
    />
  );
}
