// apps/web/src/lib/api/documents.ts
import { apiClient } from './client';

export interface Document {
  id: string;
  name: string;
  description?: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  status: 'processing' | 'ready' | 'error' | 'deleted';
  storagePath: string;
  thumbnailPath?: string;
  tags: string[];
  currentVersion: number;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  folder?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchDocumentsParams {
  query?: string;
  folderId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export const documentsApi = {
  // Get all documents
  getAll: async (params?: SearchDocumentsParams) => {
    const { data } = await apiClient.get<
      { data: PaginatedResponse<Document> }
    >('/documents', { params });
    return data;
  },

  // Get single document
  getById: async (id: string) => {
    const { data } = await apiClient.get<{ data: Document }>(
      `/documents/${id}`,
    );
    return data;
  },

  // Upload document
  upload: async (
    file: File,
    metadata: { name: string; description?: string; folderId?: string; tags?: string[] },
    onProgress?: (progress: number) => void,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.folderId) formData.append('folderId', metadata.folderId);
    if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));

    const { data } = await apiClient.post<{ data: Document }>(
      '/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percent);
          }
        },
      },
    );
    return data;
  },

  // Get download URL
  getDownloadUrl: async (id: string) => {
    const { data } = await apiClient.get<{ data: { url: string; expiresIn: number } }>(
      `/documents/${id}/download`,
    );
    return data;
  },

  // Update document
  update: async (
    id: string,
    data: { name?: string; description?: string; folderId?: string; tags?: string[] },
  ) => {
    const { data: result } = await apiClient.patch<{ data: Document }>(
      `/documents/${id}`,
      data,
    );
    return result;
  },

  // Create share link
  createShare: async (
    id: string,
    options: {
      permission: 'view' | 'download' | 'edit';
      expiresAt?: string;
      isPublic?: boolean;
      maxAccessCount?: number;
    },
  ) => {
    const { data } = await apiClient.post<{ data: { token: string; url: string } }>(
      `/documents/${id}/share`,
      options,
    );
    return data;
  },

  // Delete document
  delete: async (id: string) => {
    await apiClient.delete(`/documents/${id}`);
  },
};