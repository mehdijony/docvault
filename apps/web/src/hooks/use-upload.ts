// apps/web/src/hooks/use-upload.ts
import { useState, useCallback } from 'react';
import { useUploadDocument } from './use-documents';

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export function useFileUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const { mutateAsync: upload } = useUploadDocument();

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      progress: 0,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);
    return uploadFiles;
  }, []);

  const uploadFiles = useCallback(
    async (
      filesToUpload: UploadFile[],
      metadata: { folderId?: string; tags?: string[] },
    ) => {
      for (const uploadFile of filesToUpload) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: 'uploading' } : f,
          ),
        );

        try {
          await upload({
            file: uploadFile.file,
            metadata: {
              name: uploadFile.name.replace(/\.[^/.]+$/, ''), // Remove extension
              ...metadata,
            },
            onProgress: (progress) => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadFile.id ? { ...f, progress } : f,
                ),
              );
            },
          });

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: 'done', progress: 100 }
                : f,
            ),
          );
        } catch (error) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: 'error', error: (error as Error).message }
                : f,
            ),
          );
        }
      }
    },
    [upload],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== 'done'));
  }, []);

  return {
    files,
    addFiles,
    uploadFiles,
    removeFile,
    clearCompleted,
  };
}