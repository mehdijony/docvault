import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format("MMM D, YYYY");
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format("MMM D, YYYY h:mm A");
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export type FileCategory = "pdf" | "document" | "spreadsheet" | "image" | "text" | "other";

export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document")) return "document";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "spreadsheet";
  if (mimeType.includes("image")) return "image";
  if (mimeType.includes("text")) return "text";
  return "other";
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ready: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    processing: "bg-amber-50 text-amber-700 border border-amber-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    suspended: "bg-red-50 text-red-700 border border-red-200",
    deleted: "bg-slate-50 text-slate-500 border border-slate-200",
    inactive: "bg-slate-50 text-slate-500 border border-slate-200",
  };
  return map[status] || "bg-slate-50 text-slate-600 border border-slate-200";
}

export function getRoleBadgeColor(role: string): string {
  const map: Record<string, string> = {
    owner: "bg-purple-50 text-purple-700 border border-purple-200",
    admin: "bg-blue-50 text-blue-700 border border-blue-200",
    editor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    viewer: "bg-slate-50 text-slate-600 border border-slate-200",
  };
  return map[role] || "bg-slate-50 text-slate-600 border border-slate-200";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getStoragePercentage(used: number, quota: number): number {
  if (quota === 0) return 0;
  return Math.round((used / quota) * 100);
}

export function isDemoMode(): boolean {
  return localStorage.getItem("demo_mode") === "true";
}

export function getMimeTypeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "text/plain": "TXT",
  };
  return map[mimeType] || mimeType.split("/").pop()?.toUpperCase() || "FILE";
}
