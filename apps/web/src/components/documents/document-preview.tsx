import { X, Download, Share2, FileText, Clock, HardDrive, User } from "lucide-react";
import { FileIcon } from "../shared/file-icon";
import { formatFileSize, formatDateTime, getStatusColor, getMimeTypeLabel, cn } from "../../lib/utils";
import type { Document } from "../../types";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onDownload: (id: string) => void;
  onShare: (doc: Document) => void;
}

export function DocumentPreview({
  isOpen,
  onClose,
  document,
  onDownload,
  onShare,
}: DocumentPreviewProps) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-2xl max-h-[90vh] flex-col rounded-xl bg-white shadow-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 shrink-0">
              <FileIcon mimeType={document.mimeType} size="lg" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {document.name}
              </h2>
              <p className="text-sm text-slate-500">{document.originalFilename}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Type */}
          <div className="flex items-center gap-3">
            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", getStatusColor(document.status))}>
              {document.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {getMimeTypeLabel(document.mimeType)}
            </span>
            {document.currentVersion > 1 && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                v{document.currentVersion}
              </span>
            )}
          </div>

          {/* Description */}
          {document.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
              <p className="text-sm text-slate-600">{document.description}</p>
            </div>
          )}

          {/* Tags */}
          {document.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {document.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Size:</span>
                <span className="text-slate-900 font-medium">{formatFileSize(document.sizeBytes)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Modified:</span>
                <span className="text-slate-900 font-medium">{formatDateTime(document.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">By:</span>
                <span className="text-slate-900 font-medium">
                  {document.uploadedBy ? `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}` : "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-900 font-medium">{formatDateTime(document.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Version History */}
          {document.versions && document.versions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Version History</h3>
              <div className="space-y-2">
                {document.versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        v{version.versionNumber}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{version.changeNote}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(version.createdAt)} · {formatFileSize(version.sizeBytes)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Text */}
          {document.extractedText && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Extracted Text</h3>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {document.extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={() => onShare(document)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            onClick={() => onDownload(document.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
