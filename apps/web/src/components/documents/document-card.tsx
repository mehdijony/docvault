// apps/web/src/components/documents/document-card.tsx
'use client';

import { useState } from 'react';
import {
  Download,
  Share2,
  Trash2,
  MoreHorizontal,
  Eye,
  Clock,
  FileText,
} from 'lucide-react';
import { cn, formatFileSize, formatRelativeDate, getMimeTypeIcon } from '@/lib/utils';
import { Document } from '@/lib/api/documents';
import { useDeleteDocument, useDownloadDocument } from '@/hooks/use-documents';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ShareDialog } from './share-dialog';

interface DocumentCardProps {
  document: Document;
  view?: 'grid' | 'list';
  onSelect?: (doc: Document) => void;
}

export function DocumentCard({
  document,
  view = 'grid',
  onSelect,
}: DocumentCardProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const { mutate: deleteDoc } = useDeleteDocument();
  const { mutate: download } = useDownloadDocument();

  const statusColors = {
    processing: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    deleted: 'bg-gray-100 text-gray-700',
  };

  if (view === 'list') {
    return (
      <>
        <div
          className={cn(
            'flex items-center gap-4 p-4 bg-white border rounded-lg',
            'hover:shadow-sm transition-shadow',
            onSelect && 'cursor-pointer',
          )}
          onClick={() => onSelect?.(document)}
        >
          {/* Icon */}
          <span className="text-2xl flex-shrink-0">
            {getMimeTypeIcon(document.mimeType)}
          </span>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {document.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {document.originalFilename}
            </p>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="hidden md:flex gap-1">
              {document.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge variant="outline">+{document.tags.length - 2}</Badge>
              )}
            </div>
          )}

          {/* Size */}
          <span className="text-sm text-gray-500 flex-shrink-0 hidden md:block">
            {formatFileSize(document.sizeBytes)}
          </span>

          {/* Status */}
          <Badge
            className={cn(
              'flex-shrink-0 hidden lg:flex',
              statusColors[document.status],
            )}
          >
            {document.status}
          </Badge>

          {/* Date */}
          <span className="text-sm text-gray-500 flex-shrink-0 hidden lg:block">
            {formatRelativeDate(document.createdAt)}
          </span>

          {/* Actions */}
          <DocumentActions
            document={document}
            onDownload={() => download(document.id)}
            onShare={() => setShareOpen(true)}
            onDelete={() => {
              if (confirm(`Delete "${document.name}"?`)) {
                deleteDoc(document.id);
              }
            }}
          />
        </div>

        <ShareDialog
          document={document}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      </>
    );
  }

  // Grid view
  return (
    <>
      <div
        className={cn(
          'group bg-white border rounded-xl overflow-hidden',
          'hover:shadow-md transition-all hover:-translate-y-0.5',
          onSelect && 'cursor-pointer',
        )}
        onClick={() => onSelect?.(document)}
      >
        {/* Thumbnail/Preview */}
        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative">
          {document.thumbnailPath ? (
            <img
              src={`/api/thumbnails/${document.id}`}
              alt={document.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl">
              {getMimeTypeIcon(document.mimeType)}
            </span>
          )}

          {/* Processing overlay */}
          {document.status === 'processing' && (
            <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
              <Badge className="bg-yellow-100 text-yellow-700">
                Processing...
              </Badge>
            </div>
          )}

          {/* Quick actions on hover */}
          <div
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={() => download(document.id)}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={() => setShareOpen(true)}
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p
                className="font-medium text-gray-900 truncate text-sm"
                title={document.name}
              >
                {document.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(document.sizeBytes)}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">
                  v{document.currentVersion}
                </span>
              </div>
            </div>

            <DocumentActions
              document={document}
              onDownload={() => download(document.id)}
              onShare={() => setShareOpen(true)}
              onDelete={() => {
                if (confirm(`Delete "${document.name}"?`)) {
                  deleteDoc(document.id);
                }
              }}
            />
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeDate(document.createdAt)}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-[80px]" title={document.uploadedBy?.firstName}>
              {document.uploadedBy?.firstName} {document.uploadedBy?.lastName}
            </span>
          </div>
        </div>
      </div>

      <ShareDialog
        document={document}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}

// Dropdown actions component
function DocumentActions({
  document,
  onDownload,
  onShare,
  onDelete,
}: {
  document: Document;
  onDownload: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          Version History
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}