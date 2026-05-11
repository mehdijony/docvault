import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../lib/api/documents";
import type { DocumentListParams, UploadDocumentDto, UpdateDocumentDto, CreateShareDto } from "../types";
import { toast } from "sonner";

export function useDocuments(params?: DocumentListParams) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentsApi.list(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dto,
      onProgress,
    }: {
      dto: UploadDocumentDto;
      onProgress?: (progress: number) => void;
    }) => documentsApi.upload(dto, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully");
    },
    onError: () => {
      toast.error("Failed to upload document");
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDocumentDto }) =>
      documentsApi.update(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({
        queryKey: ["document", variables.id],
      });
      toast.success("Document updated successfully");
    },
    onError: () => {
      toast.error("Failed to update document");
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete document");
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await documentsApi.getDownloadUrl(id);
      if (result.url && result.url !== "#") {
        window.open(result.url, "_blank");
      }
      return result;
    },
    onError: () => {
      toast.error("Failed to generate download link");
    },
  });
}

export function useCreateShare() {
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: CreateShareDto;
    }) => documentsApi.createShare(id, dto),
    onSuccess: () => {
      toast.success("Share link created successfully");
    },
    onError: () => {
      toast.error("Failed to create share link");
    },
  });
}
