import { useState, useCallback } from "react";
import { useUploadDocument } from "./use-documents";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadMutation = useUploadDocument();

  const upload = useCallback(
    async (file: File, name: string, description?: string, tags?: string[]) => {
      setState({ isUploading: true, progress: 0, error: null });

      try {
        const result = await uploadMutation.mutateAsync({
          dto: {
            file,
            name: name || file.name,
            description,
            tags,
          },
          onProgress: (progress: number) => {
            setState((prev) => ({ ...prev, progress }));
          },
        });
        setState({ isUploading: false, progress: 100, error: null });
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed";
        setState({ isUploading: false, progress: 0, error: message });
        throw err;
      }
    },
    [uploadMutation]
  );

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}
