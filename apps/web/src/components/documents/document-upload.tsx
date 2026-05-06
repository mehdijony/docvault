// apps/web/src/components/documents/document-upload.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { useFileUpload } from '@/hooks/use-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadProps {
  folderId?: string;
  onComplete?: () => void;
}

export function DocumentUpload({ folderId, onComplete }: DocumentUploadProps) {
  const { files, addFiles, uploadFiles, removeFile, clearCompleted } =
    useFileUpload();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        ['.xlsx'],
    },
  });

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    await uploadFiles(pendingFiles, { folderId });
    setIsUploading(false);
    onComplete?.();
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const doneCount = files.filter((f) => f.status === 'done').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          'hover:border-blue-400 hover:bg-blue-50',
          isDragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 bg-gray-50',
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            'mx-auto h-12 w-12 mb-4',
            isDragActive ? 'text-blue-500' : 'text-gray-400',
          )}
        />
        {isDragActive ? (
          <p className="text-blue-600 font-medium text-lg">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium text-lg">
              Drag & drop files here
            </p>
            <p className="text-gray-500 text-sm mt-1">
              or click to browse — PDF, Word, Excel, Images up to 100MB
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700">
              Files ({files.length})
            </h3>
            {doneCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
              >
                Clear completed
              </Button>
            )}
          </div>

          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {file.status === 'done' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {file.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {file.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.file.size)}
                </p>
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">{file.error}</p>
                )}
              </div>

              {/* Progress % */}
              {file.status === 'uploading' && (
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {file.progress}%
                </span>
              )}

              {/* Remove Button */}
              {(file.status === 'pending' || file.status === 'error') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-gray-500">
            {pendingCount > 0 && (
              <span>{pendingCount} pending</span>
            )}
            {doneCount > 0 && (
              <span className="text-green-600">{doneCount} uploaded</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-600">{errorCount} failed</span>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={pendingCount === 0 || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}