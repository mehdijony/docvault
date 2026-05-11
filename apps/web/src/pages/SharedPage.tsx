import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api/client";
import { FileIcon } from "../components/shared/file-icon";
import { LoadingSpinner } from "../components/shared/loading-spinner";
import { formatFileSize, formatDate } from "../lib/utils";
import type { ApiResponse, Document } from "../types";
import { Download, Shield, Clock, ArrowLeft } from "lucide-react";

export default function SharedPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: doc, isLoading } = useQuery({
    queryKey: ["shared", token],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<Document>>(
          `/documents/shared/${token}`
        );
        return data.data;
      } catch {
        setError("This shared document is no longer available or the link has expired.");
        return null;
      }
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Access Denied</h1>
          <p className="text-sm text-slate-500 mt-2">{error || "Document not found."}</p>
          <button onClick={() => navigate("/login")} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4" /> Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-slate-200">
                <FileIcon mimeType={doc.mimeType} size="lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{doc.name}</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {doc.originalFilename} · {formatFileSize(doc.sizeBytes)}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {doc.description && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
                <p className="text-sm text-slate-600">{doc.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Shared on:</span>
                <span className="text-slate-900 font-medium">{formatDate(doc.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-medium capitalize">{doc.status}</span>
              </div>
            </div>

            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {doc.tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 mt-4">
              <Download className="h-4 w-4" /> Download Document
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
            <p className="text-xs text-center text-slate-400">
              Shared via DocVault · Secure Document Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
