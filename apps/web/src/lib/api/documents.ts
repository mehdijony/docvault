import apiClient from "./client";
import type {
  ApiResponse,
  PaginatedData,
  Document,
  DocumentListParams,
  UploadDocumentDto,
  UpdateDocumentDto,
  DownloadUrl,
  ShareLink,
  CreateShareDto,
} from "../../types";
import { isDemoMode } from "../utils";
import { getMockDocumentsPaginated, MOCK_DOCUMENTS, MOCK_DOCUMENT_DETAIL, MOCK_SHARE_LINK } from "../mock-data";

export const documentsApi = {
  list: async (params?: DocumentListParams): Promise<PaginatedData<Document>> => {
    if (isDemoMode()) return getMockDocumentsPaginated(params?.page || 1, params?.limit || 20);
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Document>>>("/documents", { params });
    return data.data;
  },

  getById: async (id: string): Promise<Document> => {
    if (isDemoMode()) {
      const doc = MOCK_DOCUMENTS.find((d: Document) => d.id === id) || MOCK_DOCUMENT_DETAIL;
      return { ...MOCK_DOCUMENT_DETAIL, ...doc };
    }
    const { data } = await apiClient.get<ApiResponse<Document>>(`/documents/${id}`);
    return data.data;
  },

  upload: async (dto: UploadDocumentDto, onProgress?: (progress: number) => void): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", dto.file);
    formData.append("name", dto.name);
    if (dto.description) formData.append("description", dto.description);
    if (dto.tags && dto.tags.length > 0) formData.append("tags", dto.tags.join(","));
    if (dto.folderId) formData.append("folderId", dto.folderId);

    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: "new-doc-" + Date.now(),
            name: dto.name,
            description: dto.description || null,
            originalFilename: dto.file.name,
            mimeType: dto.file.type,
            sizeBytes: dto.file.size,
            status: "processing",
            thumbnailPath: null,
            tags: dto.tags || [],
            currentVersion: 1,
            metadata: null,
            uploadedBy: { id: "550e8400-e29b-41d4-a716-446655440001", firstName: "Admin", lastName: "User", email: "admin@docvault.dev" },
            folder: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }, 1500);
      });
    }

    const { data } = await apiClient.post<ApiResponse<Document>>("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total && onProgress) onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return data.data;
  },

  update: async (id: string, dto: UpdateDocumentDto): Promise<Document> => {
    if (isDemoMode()) {
      const doc = MOCK_DOCUMENTS.find((d: Document) => d.id === id);
      return { ...(doc || MOCK_DOCUMENT_DETAIL), ...dto, updatedAt: new Date().toISOString() };
    }
    const { data } = await apiClient.patch<ApiResponse<Document>>(`/documents/${id}`, dto);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    if (isDemoMode()) return;
    await apiClient.delete(`/documents/${id}`);
  },

  getDownloadUrl: async (id: string): Promise<DownloadUrl> => {
    if (isDemoMode()) return { url: "#", expiresIn: 3600 };
    const { data } = await apiClient.get<ApiResponse<DownloadUrl>>(`/documents/${id}/download`);
    return data.data;
  },

  createShare: async (id: string, dto: CreateShareDto): Promise<ShareLink> => {
    if (isDemoMode()) {
      return { ...MOCK_SHARE_LINK, documentId: id, permission: dto.permission, expiresAt: dto.expiresAt, isPublic: dto.isPublic };
    }
    const { data } = await apiClient.post<ApiResponse<ShareLink>>(`/documents/${id}/share`, dto);
    return data.data;
  },
};
