// apps/web/src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import filesize from 'filesize';

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  return filesize(bytes, { base: 2 });
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('MMM D, YYYY');
}

export function formatRelativeDate(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getMimeTypeIcon(mimeType: string): string {
  const iconMap: Record<string, string> = {
    'application/pdf': '📄',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/webp': '🖼️',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'text/plain': '📃',
  };
  return iconMap[mimeType] || '📁';
}