'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Plus, X } from 'lucide-react';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description?: string;
    trigger: Record<string, any>;
    actions: Record<string, any>[];
  }) => Promise<void>;
  projectId: string;
}

const TRIGGER_EVENTS = [
  { value: 'task.created', label: 'Task Created' },
  { value: 'task.updated', label: 'Task Updated' },
  { value: 'task.moved', label: 'Task Moved' },
  { value: 'task.completed', label: 'Task Completed' },
  { value: 'task.overdue', label: 'Task Overdue' },
];

const ACTION_TYPES = [
  { value: 'notify', label: 'Send Notification' },
  { value: 'assign', label: 'Auto-assign Task' },
  { value: 'move', label: 'Move Task' },
  { value: 'update', label: 'Update Task Field' },
  { value: 'comment', label: 'Add Comment' },
];

export default function CreateRuleModal({ isOpen, onClose, onCreate, projectId }: CreateRuleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('task.created');
  const [actions, setActions] = useState<{ type: string; config: Record<string, any> }[]>([
    { type: 'notify', config: {} }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAction = () => {
    setActions([...actions, { type: 'notify', config: {} }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionTypeChange = (index: number, type: string) => {
    const newActions = [...actions];
    newActions[index] = { type, config: {} };
    setActions(newActions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        trigger: { event: triggerEvent },
        actions: actions.map(a => ({ type: a.type, ...a.config })),
      });
      
      setName('');
      setDescription('');
      setTriggerEvent('task.created');
      setActions([{ type: 'notify', config: {} }]);
      onClose();
    } catch (error) {
      console.error('Failed to create rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Automation Rule" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Rule Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Auto-assign new tasks"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Trigger Event *
          </label>
          <Select
            value={triggerEvent}
            onChange={(value) => setTriggerEvent(value)}
            options={TRIGGER_EVENTS}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              Actions *
            </label>
            <button
              type="button"
              onClick={handleAddAction}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Action
            </button>
          </div>

          <div className="space-y-3">
            {actions.map((action, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-muted rounded-md">
                <Select
                  value={action.type}
                  onChange={(value) => handleActionTypeChange(index, value)}
                  options={ACTION_TYPES}
                  className="flex-1"
                />
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(index)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            Create Rule
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
