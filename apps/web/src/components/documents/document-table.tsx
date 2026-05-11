import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../shared/data-table";
import { FileIcon } from "../shared/file-icon";
import { formatFileSize, formatDate, getStatusColor, cn } from "../../lib/utils";
import type { Document } from "../../types";
import { Download, Share2, Trash2 } from "lucide-react";

interface DocumentTableProps {
  documents: Document[];
  pageCount: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onDelete: (id: string) => void;
  onShare: (doc: Document) => void;
  onDownload: (id: string) => void;
}

export function DocumentTable({
  documents,
  pageCount,
  pageIndex,
  onPageChange,
  isLoading,
  onDelete,
  onShare,
  onDownload,
}: DocumentTableProps) {
  const columns: ColumnDef<Document, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0">
            <FileIcon mimeType={row.original.mimeType} size="sm" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
              {row.original.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {row.original.originalFilename}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            getStatusColor(row.original.status)
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "sizeBytes",
      header: "Size",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {formatFileSize(row.original.sizeBytes)}
        </span>
      ),
    },
    {
      id: "uploadedBy",
      header: "Uploaded By",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {row.original.uploadedBy
            ? `${row.original.uploadedBy.firstName} ${row.original.uploadedBy.lastName}`
            : "Unknown"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(row.original.id); }}
            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onShare(row.original); }}
            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(row.original.id); }}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={documents}
      pageCount={pageCount}
      pageIndex={pageIndex}
      onPageChange={onPageChange}
      isLoading={isLoading}
      emptyMessage="No documents found"
    />
  );
}
