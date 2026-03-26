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
    case 'urgent': return 'text-destructive bg-destructive/10';
    case 'high':   return 'text-warning bg-warning/10';
    case 'medium': return 'text-warning bg-warning/10';
    case 'low':    return 'text-success bg-success/10';
    default:       return 'text-muted-foreground bg-muted';
  }
}
