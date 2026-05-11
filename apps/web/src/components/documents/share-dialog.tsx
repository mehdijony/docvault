import { useState } from "react";
import { X, Copy, Check, Link2 } from "lucide-react";
import { useCreateShare } from "../../hooks/use-documents";
import type { Document } from "../../types";
import { cn } from "../../lib/utils";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function ShareDialog({ isOpen, onClose, document }: ShareDialogProps) {
  const [permission, setPermission] = useState<"view" | "download" | "edit">("view");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const createShare = useCreateShare();

  if (!isOpen || !document) return null;

  const handleCreateShare = async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    try {
      const result = await createShare.mutateAsync({
        id: document.id,
        dto: {
          permission,
          expiresAt: expiresAt.toISOString(),
          isPublic,
          maxAccessCount: 100,
        },
      });
      setShareUrl(result.shareUrl);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Share Document</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <Link2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-emerald-800 font-medium">Share link created!</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <button
                onClick={handleCopyLink}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  copied
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={handleClose}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-3">
                Sharing: <span className="font-medium text-slate-900">{document.name}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Permission</label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as "view" | "download" | "edit")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="view">View only</option>
                <option value="download">View & Download</option>
                <option value="edit">View, Download & Edit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expires in</label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm text-slate-700">
                Anyone with the link can access
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShare}
                disabled={createShare.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createShare.isPending ? "Creating..." : "Create Link"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
