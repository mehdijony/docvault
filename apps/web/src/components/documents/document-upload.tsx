import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon, CheckCircle } from "lucide-react";
import { formatFileSize, cn } from "../../lib/utils";
import { useUpload } from "../../hooks/use-upload";

interface DocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentUpload({ isOpen, onClose }: DocumentUploadProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isUploading, progress, upload, reset } = useUpload();
  const [uploadComplete, setUploadComplete] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      if (!name) setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  }, [name]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "text/plain": [".txt"],
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await upload(
        selectedFile,
        name || selectedFile.name,
        description || undefined,
        tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined
      );
      setUploadComplete(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setTags("");
    setSelectedFile(null);
    setUploadComplete(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Upload Document</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {uploadComplete ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
            <p className="text-lg font-semibold text-slate-900">Upload Complete!</p>
            <p className="text-sm text-slate-500 mt-1">Your document is being processed.</p>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
                isDragActive
                  ? "border-blue-400 bg-blue-50"
                  : selectedFile
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
              )}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="text-center">
                  <FileIcon className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (max 100MB)
                  </p>
                </div>
              )}
            </div>

            {/* Form fields */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter document name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. finance, quarterly, 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">Uploading...</span>
                  <span className="text-blue-600 font-medium">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || !name}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
