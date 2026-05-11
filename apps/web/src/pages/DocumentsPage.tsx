import { useState } from "react";
import { useDocuments, useDeleteDocument, useDownloadDocument } from "../hooks/use-documents";
import { DocumentCard } from "../components/documents/document-card";
import { DocumentTable } from "../components/documents/document-table";
import { DocumentUpload } from "../components/documents/document-upload";
import { ShareDialog } from "../components/documents/share-dialog";
import { EmptyState } from "../components/shared/empty-state";
import { CardSkeleton, LoadingSpinner } from "../components/shared/loading-spinner";
import { Search, LayoutGrid, List, Upload } from "lucide-react";
import type { Document } from "../types";
import { toast } from "sonner";

export default function DocumentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const deleteDoc = useDeleteDocument();
  const downloadDoc = useDownloadDocument();

  const { data, isLoading } = useDocuments({ page, limit: 20, query: search || undefined });

  const handleDelete = (id: string) => { if (confirm("Are you sure you want to delete this document?")) deleteDoc.mutate(id); };
  const handleDownload = (id: string) => {
    downloadDoc.mutate(id, { onSuccess: (result: { url: string }) => { if (result.url === "#") toast.info("Demo mode — download not available"); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-500 mt-1">{data ? `${data.total} document${data.total !== 1 ? "s" : ""}` : "Loading..."}</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"><Upload className="h-4 w-4" /> Upload Document</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search documents..." className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("grid")} className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 ${viewMode === "grid" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"}`}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("table")} className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 ${viewMode === "table" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {isLoading ? (viewMode === "grid" ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}</div> : <LoadingSpinner fullScreen />) : data && data.items.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.items.map((doc: Document) => <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} onShare={setShareDoc} onDownload={handleDownload} />)}
          </div>
        ) : (
          <DocumentTable documents={data.items} pageCount={data.totalPages || 1} pageIndex={page - 1} onPageChange={setPage} isLoading={isLoading} onDelete={handleDelete} onShare={setShareDoc} onDownload={handleDownload} />
        )
      ) : (
        <EmptyState title="No documents found" description={search ? `No documents match "${search}".` : "Upload your first document to get started."} action={!search ? <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Upload className="h-4 w-4" /> Upload Document</button> : undefined} />
      )}

      {viewMode === "grid" && data && data.totalPages && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">Previous</button>
          <span className="text-sm text-slate-500">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(data.totalPages || 1, p + 1))} disabled={page >= (data.totalPages || 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">Next</button>
        </div>
      )}

      <DocumentUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
      <ShareDialog isOpen={!!shareDoc} onClose={() => setShareDoc(null)} document={shareDoc} />
    </div>
  );
}
