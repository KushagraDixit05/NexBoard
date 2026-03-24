'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import TaskDescription from './TaskDescription';
import SubtaskList from './SubtaskList';
import CommentSection from './CommentSection';
import AttachmentList from './AttachmentList';
import TimeTracker from './TimeTracker';
import ActivityTimeline from './ActivityTimeline';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import Spinner from '../ui/Spinner';
import type { Task, Subtask, Comment, Attachment } from '@/types';
import { useBoardStore } from '@/store/boardStore';

interface TaskDetailModalProps {
  taskId:  string;
  onClose: () => void;
}

type TabType = 'comments' | 'activity';

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { deleteTask } = useBoardStore();
  const [task, setTask]             = useState<Task | null>(null);
  const [subtasks, setSubtasks]     = useState<Subtask[]>([]);
  const [comments, setComments]     = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [tab, setTab]               = useState<TabType>('comments');
  const [loading, setLoading]       = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/tasks/${taskId}`),
      api.get(`/subtasks/task/${taskId}`),
      api.get(`/comments/task/${taskId}`),
      api.get(`/attachments/task/${taskId}`),
    ]).then(([tRes, sRes, cRes, aRes]) => {
      setTask(tRes.data);
      setSubtasks(sRes.data);
      setComments(cRes.data);
      setAttachments(aRes.data);
    }).finally(() => setLoading(false));
  }, [taskId]);

  const handleUpdate = async (field: string, value: unknown) => {
    await api.put(`/tasks/${taskId}`, { [field]: value });
    setTask(t => t ? { ...t, [field]: value } : null);
  };

  const handleDelete = async () => {
    await deleteTask(taskId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
        ) : !task ? null : (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-4 border-b border-gray-100">
              <input
                type="text" value={task.title}
                onChange={e => setTask(t => t ? { ...t, title: e.target.value } : null)}
                onBlur={() => handleUpdate('title', task.title)}
                className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-none
                           focus:outline-none focus:ring-0 min-w-0"
              />
              <button onClick={() => setShowDelete(true)}
                      className="p-2 text-gray-400 hover:text-danger-500 rounded-lg shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100">
                {/* Main content — 2 cols */}
                <div className="col-span-2 p-6 space-y-6">
                  <TaskDescription
                    content={task.description || ''}
                    onSave={(c) => handleUpdate('description', c)}
                  />
                  <SubtaskList taskId={taskId} subtasks={subtasks} onChange={setSubtasks} />

                  {/* Tabs */}
                  <div>
                    <div className="flex gap-4 border-b border-gray-100 mb-4">
                      {(['comments', 'activity'] as TabType[]).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                                className={`pb-2 text-sm font-medium border-b-2 transition-colors capitalize
                                  ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                          {t === 'comments' ? `Comments (${comments.length})` : 'Activity'}
                        </button>
                      ))}
                    </div>
                    {tab === 'comments'
                      ? <CommentSection taskId={taskId} comments={comments} onChange={setComments} />
                      : <ActivityTimeline taskId={taskId} projectId={task.project} />
                    }
                  </div>
                </div>

                {/* Sidebar metadata — 1 col */}
                <div className="p-5 space-y-5">
                  {/* Status */}
                  <div>
                    <label className="label mb-1 block">Status</label>
                    <select value={task.status} onChange={e => handleUpdate('status', e.target.value)} className="input-field">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="label mb-1 block">Priority</label>
                    <select value={task.priority} onChange={e => handleUpdate('priority', e.target.value)} className="input-field">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="label mb-1 block">Assignee</label>
                    {task.assignee ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar name={task.assignee.displayName || task.assignee.username} size="xs" />
                        <span className="text-sm text-gray-700">{task.assignee.displayName}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">Unassigned</p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="label mb-1 block">Due Date</label>
                    <input
                      type="date"
                      value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                      onChange={e => handleUpdate('dueDate', e.target.value || null)}
                      className="input-field"
                    />
                  </div>

                  {/* Time Tracking */}
                  <TimeTracker
                    estimated={task.timeEstimated}
                    spent={task.timeSpent}
                    onLogTime={(min) => handleUpdate('timeSpent', task.timeSpent + min)}
                  />

                  {/* Labels */}
                  {task.labels.length > 0 && (
                    <div>
                      <label className="label mb-2 block">Labels</label>
                      <div className="flex flex-wrap gap-1">
                        {task.labels.map((label, i) => (
                          <Badge key={i}>{label}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  <AttachmentList taskId={taskId} attachments={attachments} onChange={setAttachments} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Task?" description="This will permanently delete the task, subtasks, comments, and attachments."
      />
    </div>
  );
}
