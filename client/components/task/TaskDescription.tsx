'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TaskDescriptionProps {
  content: string;
  onSave:  (content: string) => void;
}

export default function TaskDescription({ content, onSave }: TaskDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]         = useState(content);

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          autoFocus value={draft}
          onChange={e => setDraft(e.target.value)}
          className="input-field min-h-[140px] font-mono text-sm resize-y"
          placeholder="Write a description (Markdown supported)..."
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-primary text-sm py-1.5">Save</button>
          <button onClick={() => { setDraft(content); setIsEditing(false); }} className="btn-secondary text-sm py-1.5">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <button onClick={() => setIsEditing(true)}
                className="text-xs text-primary hover:underline">
          Edit
        </button>
      </div>
      {content ? (
        <div className="prose prose-sm max-w-none text-foreground cursor-pointer"
             onClick={() => setIsEditing(true)}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground cursor-pointer hover:text-foreground italic"
           onClick={() => setIsEditing(true)}>
          Click to add a description (Markdown supported)...
        </p>
      )}
    </div>
  );
}
