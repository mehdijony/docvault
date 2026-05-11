import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "../lib/api/organizations";
import { formatFileSize, getStoragePercentage } from "../lib/utils";
import { Settings as SettingsIcon, Building, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: org, isLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: () => organizationsApi.getMine(),
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const updateOrg = useMutation({
    mutationFn: (dto: { name?: string; description?: string }) =>
      organizationsApi.updateMine(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      setIsEditing(false);
      toast.success("Organization updated successfully");
    },
    onError: () => {
      toast.error("Failed to update organization");
    },
  });

  // Sync form when org loads
  if (org && !name && !isEditing) {
    setName(org.name);
    setDescription(org.description || "");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-lg bg-slate-200" />
          <div className="h-60 rounded-lg bg-slate-200" />
        </div>
      </div>
    );
  }

  const storagePercent = org ? getStoragePercentage(org.storageUsedBytes, org.storageQuotaBytes) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization settings and preferences
        </p>
      </div>

      {/* Organization Info */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Organization</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <SettingsIcon className="h-4 w-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateOrg.mutate({ name, description });
                }}
                disabled={updateOrg.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {updateOrg.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
              <button
                onClick={() => {
                  setName(org?.name || "");
                  setDescription(org?.description || "");
                  setIsEditing(false);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
            {isEditing ? (
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            ) : (
              <p className="text-sm text-slate-900">{org?.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <p className="text-sm text-slate-500 font-mono">{org?.slug}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            {isEditing ? (
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
            ) : (
              <p className="text-sm text-slate-600">{org?.description || "No description"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200 capitalize">
              {org?.plan}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 border border-emerald-200 capitalize">
              {org?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Storage</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Used</span>
            <span className="text-sm font-medium text-slate-900">
              {org ? formatFileSize(org.storageUsedBytes) : "—"} of{" "}
              {org ? formatFileSize(org.storageQuotaBytes) : "—"}
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className={`h-3 rounded-full transition-all ${storagePercent > 80 ? "bg-red-500" : storagePercent > 60 ? "bg-amber-500" : "bg-blue-600"}`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{storagePercent}% of storage quota used</p>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Public Sharing</p>
              <p className="text-xs text-slate-500">Allow members to create public share links</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${org?.settings.allowPublicSharing ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
              {org?.settings.allowPublicSharing ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Require MFA</p>
              <p className="text-xs text-slate-500">Require multi-factor authentication for all users</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${org?.settings.requireMfa ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
              {org?.settings.requireMfa ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
