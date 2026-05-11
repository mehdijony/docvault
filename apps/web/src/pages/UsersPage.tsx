import { useUsers, useUpdateUserRole } from "../hooks/use-users";
import { UserTable } from "../components/users/user-table";
import { useAuth } from "../providers/auth-provider";
import { EmptyState } from "../components/shared/empty-state";
import { Users as UsersIcon, UserPlus } from "lucide-react";
import type { UserRole } from "../types";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const canManage = currentUser?.role === "owner" || currentUser?.role === "admin";

  const handleUpdateRole = (id: string, role: UserRole) => {
    updateRole.mutate({ id, role });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage team members and their roles
          </p>
        </div>
        {canManage && (
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
            <UserPlus className="h-4 w-4" /> Invite User
          </button>
        )}
      </div>

      {users && users.length > 0 ? (
        <UserTable
          users={users}
          isLoading={isLoading}
          onUpdateRole={handleUpdateRole}
          canManage={canManage}
        />
      ) : isLoading ? null : (
        <EmptyState
          icon={<UsersIcon className="h-8 w-8" />}
          title="No users found"
          description="There are no users in your organization yet."
        />
      )}
    </div>
  );
}
