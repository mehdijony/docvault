import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../lib/api/audit";
import { AuditTable } from "../components/audit/audit-table";
import { ScrollText } from "lucide-react";
import { EmptyState } from "../components/shared/empty-state";

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["audit", page],
    queryFn: () => auditApi.list({ page, limit: 50 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete history of all actions in your organization
        </p>
      </div>

      {data && data.items.length > 0 ? (
        <AuditTable
          logs={data.items}
          pageCount={Math.ceil(data.total / 50)}
          pageIndex={page - 1}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      ) : isLoading ? null : (
        <EmptyState
          icon={<ScrollText className="h-8 w-8" />}
          title="No audit logs"
          description="Audit logs will appear here as actions are performed."
        />
      )}
    </div>
  );
}
