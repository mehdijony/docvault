import { useAuth } from "../providers/auth-provider";
import { useDocuments, useDeleteDocument, useDownloadDocument } from "../hooks/use-documents";
import { useUsers } from "../hooks/use-users";
import { StatsCard } from "../components/shared/stats-card";
import { StatsCardSkeleton, CardSkeleton } from "../components/shared/loading-spinner";
import { DocumentCard } from "../components/documents/document-card";
import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "../lib/api/organizations";
import { formatFileSize, getStoragePercentage } from "../lib/utils";
import type { Document } from "../types";
import { useState } from "react";
import { ShareDialog } from "../components/documents/share-dialog";
import { useNavigate } from "react-router-dom";
import { FileText, Users, HardDrive, Upload, ArrowRight, Plus } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const deleteDoc = useDeleteDocument();
  const downloadDoc = useDownloadDocument();

  const { data: org, isLoading: orgLoading } = useQuery({ queryKey: ["organization"], queryFn: () => organizationsApi.getMine() });
  const { data: recentDocs, isLoading: docsLoading } = useDocuments({ page: 1, limit: 4 });
  const { data: users } = useUsers();
  const storagePercent = org ? getStoragePercentage(org.storageUsedBytes, org.storageQuotaBytes) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.firstName || "User"} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening in your organization today.</p>
        </div>
        <button onClick={() => navigate("/documents")} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
          <Plus className="h-4 w-4" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orgLoading ? (<><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /></>) : (
          <>
            <StatsCard title="Total Documents" value={recentDocs?.total ?? 0} icon={<FileText className="h-5 w-5" />} change="+3 this week" changeType="positive" />
            <StatsCard title="Storage Used" value={org ? `${formatFileSize(org.storageUsedBytes)} / ${formatFileSize(org.storageQuotaBytes)}` : "—"} icon={<HardDrive className="h-5 w-5" />} change={`${storagePercent}% used`} changeType={storagePercent > 80 ? "negative" : "neutral"} />
            <StatsCard title="Active Users" value={users?.filter((u: { status: string }) => u.status === "active").length ?? 0} icon={<Users className="h-5 w-5" />} change="Across your org" changeType="neutral" />
            <StatsCard title="Processing" value={recentDocs?.items?.filter((d: { status: string }) => d.status === "processing").length ?? 0} icon={<Upload className="h-5 w-5" />} change="In progress" changeType="neutral" />
          </>
        )}
      </div>

      {org && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Storage Usage</p>
            <p className="text-sm text-slate-500">{formatFileSize(org.storageUsedBytes)} of {formatFileSize(org.storageQuotaBytes)}</p>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className={`h-2.5 rounded-full transition-all ${storagePercent > 80 ? "bg-red-500" : storagePercent > 60 ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${Math.min(storagePercent, 100)}%` }} />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Documents</h2>
          <button onClick={() => navigate("/documents")} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">View all <ArrowRight className="h-4 w-4" /></button>
        </div>
        {docsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : recentDocs && recentDocs.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDocs.items.map((doc: Document) => (
              <DocumentCard key={doc.id} document={doc} onDelete={(id: string) => deleteDoc.mutate(id)} onShare={setShareDoc} onDownload={(id: string) => downloadDoc.mutate(id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">No documents yet</h3>
            <p className="text-sm text-slate-500 mt-1">Upload your first document to get started.</p>
            <button onClick={() => navigate("/documents")} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Upload className="h-4 w-4" /> Upload Document</button>
          </div>
        )}
      </div>

      <ShareDialog isOpen={!!shareDoc} onClose={() => setShareDoc(null)} document={shareDoc} />
    </div>
  );
}
