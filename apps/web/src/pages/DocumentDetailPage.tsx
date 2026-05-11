import { useParams, useNavigate } from "react-router-dom";
import { useDocument, useDeleteDocument, useDownloadDocument, useUpdateDocument } from "../hooks/use-documents";
import { DocumentPreview } from "../components/documents/document-preview";
import { LoadingSpinner } from "../components/shared/loading-spinner";
import { ArrowLeft, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import type { Document, DocumentVersion } from "../types";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doc, isLoading } = useDocument(id || "");
  const deleteDoc = useDeleteDocument();
  const downloadDoc = useDownloadDocument();
  const updateDoc = useUpdateDocument();
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!doc) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Document not found</h2>
      <p className="text-sm text-slate-500 mt-1">The document you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/documents")} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Documents</button>
    </div>
  );

  const handleDelete = () => { if (confirm("Delete this document?")) deleteDoc.mutate(doc.id, { onSuccess: () => navigate("/documents") }); };
  const handleSaveEdit = () => { updateDoc.mutate({ id: doc.id, dto: { name: editName, description: editDescription } }, { onSuccess: () => setIsEditing(false) }); };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate("/documents")} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"><ArrowLeft className="h-4 w-4" /> Back to Documents</button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} disabled={updateDoc.isPending} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"><Check className="h-4 w-4" /> Save</button>
                  <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><X className="h-4 w-4" /> Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{doc.name}</h1>
                  <button onClick={() => { setEditName(doc.name); setEditDescription(doc.description || ""); setIsEditing(true); }} className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                </div>
                {doc.description && <p className="text-sm text-slate-500 mt-1">{doc.description}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShareDoc(doc)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Share</button>
            <button onClick={() => downloadDoc.mutate(doc.id)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Download</button>
            <button onClick={handleDelete} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Document Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">File</p><p className="text-sm font-medium text-slate-900">{doc.originalFilename}</p><p className="text-xs text-slate-500">{doc.mimeType}</p></div>
          <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Size</p><p className="text-sm font-medium text-slate-900">{(doc.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p></div>
          <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Version</p><p className="text-sm font-medium text-slate-900">v{doc.currentVersion}</p></div>
          <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Uploaded By</p><p className="text-sm font-medium text-slate-900">{doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : "Unknown"}</p></div>
          <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Created</p><p className="text-sm font-medium text-slate-900">{new Date(doc.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></div>
          <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Last Modified</p><p className="text-sm font-medium text-slate-900">{new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></div>
        </div>
        {doc.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">{doc.tags.map((tag: string) => <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{tag}</span>)}</div>
          </div>
        )}
      </div>

      {doc.versions && doc.versions.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Version History</h2>
          <div className="space-y-3">
            {doc.versions.map((version: DocumentVersion) => (
              <div key={version.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">v{version.versionNumber}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{version.changeNote}</p>
                    <p className="text-xs text-slate-500">{new Date(version.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })} · {(version.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                {version.versionNumber === doc.currentVersion && <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">Current</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {doc.extractedText && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Extracted Text</h2>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{doc.extractedText}</pre>
          </div>
        </div>
      )}

      <DocumentPreview isOpen={!!shareDoc} onClose={() => setShareDoc(null)} document={shareDoc} onDownload={(docId: string) => downloadDoc.mutate(docId)} onShare={() => {}} />
    </div>
  );
}
