'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Avatar from '../ui/Avatar';
import type { Comment } from '@/types';
import { format } from 'date-fns';
import { Trash2, Send } from 'lucide-react';

interface CommentSectionProps {
  taskId:   string;
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
}

export default function CommentSection({ taskId, comments, onChange }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    const { data } = await api.post('/comments', { task: taskId, content: content.trim() });
    onChange([...comments, data]);
    setContent('');
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/comments/${id}`);
    onChange(comments.filter(c => c._id !== id));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        {user && <Avatar name={user.displayName || user.username} size="sm" />}
        <div className="flex-1 flex gap-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }}}
            className="input-field flex-1 text-sm min-h-[70px] resize-none"
            placeholder="Add a comment... (Enter to submit)"
          />
          <button type="submit" disabled={!content.trim() || submitting}
                  className="btn-primary self-end p-2 !px-2">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment._id} className="flex gap-3 group">
            <Avatar name={comment.user?.displayName || comment.user?.username || '?'} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {comment.user?.displayName || comment.user?.username}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
            {comment.user?._id === user?._id && (
              <button onClick={() => handleDelete(comment._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-danger-500 self-start rounded">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
