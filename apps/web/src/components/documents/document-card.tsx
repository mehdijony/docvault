import { useNavigate } from "react-router-dom";
import { MoreVertical, Download, Share2, Trash2 } from "lucide-react";
import { FileIcon } from "../shared/file-icon";
import { formatFileSize, formatDate, getStatusColor, cn } from "../../lib/utils";
import type { Document } from "../../types";
import { useState, useRef, useEffect } from "react";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onShare: (doc: Document) => void;
  onDownload: (id: string) => void;
}

export function DocumentCard({ document: doc, onDelete, onShare, onDownload }: DocumentCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    globalThis.document.addEventListener("mousedown", handleClickOutside);
    return () => globalThis.document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
      onClick={() => navigate(`/documents/${doc.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <FileIcon mimeType={doc.mimeType} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {doc.name}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {doc.originalFilename}
            </p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { onDownload(doc.id); setShowMenu(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <button
                onClick={() => { onShare(doc); setShowMenu(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button
                onClick={() => { onDelete(doc.id); setShowMenu(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {doc.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{doc.description}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {doc.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
          >
            {tag}
          </span>
        ))}
        {doc.tags.length > 3 && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            +{doc.tags.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", getStatusColor(doc.status))}>
            {doc.status}
          </span>
          <span className="text-xs text-slate-400">{formatFileSize(doc.sizeBytes)}</span>
        </div>
        <span className="text-xs text-slate-400">{formatDate(doc.createdAt)}</span>
      </div>
    </div>
  );
}
