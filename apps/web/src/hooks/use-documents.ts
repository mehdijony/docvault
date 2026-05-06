// apps/web/src/hooks/use-documents.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { documentsApi, Document, SearchDocumentsParams } from '@/lib/api/documents';

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params?: SearchDocumentsParams) =>
    [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

// List documents
export function useDocuments(params?: SearchDocumentsParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentsApi.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Single document
export function useDocument(id: string, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

// Upload document
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      metadata,
      onProgress,
    }: {
      file: File;
      metadata: Parameters<typeof documentsApi.upload>[1];
      onProgress?: (progress: number) => void;
    }) => documentsApi.upload(file, metadata, onProgress),

    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success(`"${document.name}" uploaded successfully`);
    },

    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
}

// Update document
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof documentsApi.update>[1];
    }) => documentsApi.update(id, data),

    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(document.id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success('Document updated');
    },

    onError: (error: Error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
}

// Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success('Document deleted');
    },

    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
}

// Get download URL
export function useDownloadDocument() {
  return useMutation({
    mutationFn: (id: string) => documentsApi.getDownloadUrl(id),
    onSuccess: ({ url }) => {
      window.open(url, '_blank');
    },
    onError: (error: Error) => {
      toast.error(`Download failed: ${error.message}`);
    },
  });
}