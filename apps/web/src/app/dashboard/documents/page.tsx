// apps/web/src/app/(dashboard)/documents/page.tsx
'use client';

import { useState } from 'react';
import {
  Grid3x3,
  List,
  Upload,
  Search,
  Filter,
  Plus,
  FolderOpen,
} from 'lucide-react';
import { useDocuments } from '@/hooks/use-documents';
import { DocumentCard } from '@/components/documents/document-card';
import { DocumentUpload } from '@/components/documents/document-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function DocumentsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useDocuments({
    query: search || undefined,
    page,
    limit: 24,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.total ?? 0} documents in your workspace
          </p>
        </div>

        <Button
          onClick={() => setUploadOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Filter */}
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        {/* View Toggle */}
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <DocumentsLoadingSkeleton view={view} />
      ) : error ? (
        <ErrorState error={error as Error} />
      ) : !data?.items.length ? (
        <EmptyState onUpload={() => setUploadOpen(true)} />
      ) : (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {data.items.map((doc) => (
                <DocumentCard key={doc.id} document={doc} view="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* List Header */}
              <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="w-8" />
                <span className="flex-1">Name</span>
                <span className="hidden md:block w-32">Tags</span>
                <span className="hidden md:block w-20">Size</span>
                <span className="hidden lg:block w-20">Status</span>
                <span className="hidden lg:block w-28">Modified</span>
                <span className="w-10" />
              </div>
              {data.items.map((doc) => (
                <DocumentCard key={doc.id} document={doc} view="list" />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
          </DialogHeader>
          <DocumentUpload onComplete={() => setUploadOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16">
      <FolderOpen className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        No documents yet
      </h3>
      <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
        Upload your first document to get started. Supports PDF, Word, Excel,
        and images.
      </p>
      <Button onClick={onUpload} className="bg-blue-600 hover:bg-blue-700">
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16">
      <p className="text-red-600">Failed to load documents: {error.message}</p>
    </div>
  );
}

function DocumentsLoadingSkeleton({ view }: { view: 'grid' | 'list' }) {
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border">
            <Skeleton className="h-32" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16 hidden md:block" />
          <Skeleton className="h-6 w-16 rounded-full hidden md:block" />
        </div>
      ))}
    </div>
  );
}