'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { Plus, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AddSwimlaneFormProps {
  boardId: string;
}

export default function AddSwimlaneForm({ boardId }: AddSwimlaneFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSwimlane } = useBoardStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addSwimlane({ board: boardId, name: name.trim() });
      setName('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add swimlane:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2 px-3 text-sm text-muted-foreground hover:text-foreground 
                   hover:bg-muted rounded-md transition-colors flex items-center gap-2 
                   border border-dashed border-border hover:border-foreground"
      >
        <Plus className="w-4 h-4" />
        Add Swimlane
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Swimlane name..."
          autoFocus
          disabled={isSubmitting}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setName('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
