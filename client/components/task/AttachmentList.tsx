'use client';

import { useRef } from 'react';
import api from '@/lib/api';
import type { Attachment } from '@/types';
import { Paperclip, Download, Trash2, Upload } from 'lucide-react';

interface AttachmentListProps {
  taskId:      string;
  attachments: Attachment[];
  onChange:    (attachments: Attachment[]) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function AttachmentList({ taskId, attachments, onChange }: AttachmentListProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('task', taskId);
    const { data } = await api.post('/attachments', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    onChange([...attachments, data]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/attachments/${id}`);
    onChange(attachments.filter(a => a._id !== id));
  };

  return (
    <div>
      <label className="label mb-2 block">Attachments ({attachments.length})</label>

      <div className="space-y-1.5 mb-2">
        {attachments.map(att => (
          <div key={att._id} className="flex items-center gap-2 group p-2 bg-muted rounded-md">
            <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-xs text-foreground truncate">{att.originalName}</span>
            <span className="text-xs text-muted-foreground shrink-0">{formatSize(att.size)}</span>
            <a href={`/api/attachments/${att.filename}`} download={att.originalName}
               className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary rounded">
              <Download className="w-3.5 h-3.5" />
            </a>
            <button onClick={() => handleDelete(att._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <input ref={inputRef} type="file" onChange={handleUpload} className="hidden" />
      <button onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <Upload className="w-4 h-4" /> Upload file
      </button>
    </div>
  );
}
