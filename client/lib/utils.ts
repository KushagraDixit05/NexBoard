import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format minutes to Xh Ym string.
 */
export function formatDuration(minutes: number): string {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/**
 * Get the base URL for constructing attachment download links.
 */
export function getAttachmentUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}/${path.replace(/^\.?\//, '')}`;
}

/**
 * Check if a date is past due.
 */
export function isOverdue(dueDate: string | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/**
 * Get priority color class.
 */
export function priorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-50';
    case 'high':   return 'text-orange-600 bg-orange-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low':    return 'text-green-600 bg-green-50';
    default:       return 'text-gray-600 bg-gray-50';
  }
}
