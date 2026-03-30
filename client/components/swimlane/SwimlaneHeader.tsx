'use client';

import { useState } from 'react';
import { Swimlane } from '@/types';
import { useBoardStore } from '@/store/boardStore';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface SwimlaneHeaderProps {
  swimlane: Swimlane;
}

export default function SwimlaneHeader({ swimlane }: SwimlaneHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(swimlane.name);
  const { updateSwimlane, deleteSwimlane } = useBoardStore();

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateSwimlane(swimlane._id, { name: name.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update swimlane:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete swimlane "${swimlane.name}"? Tasks in this swimlane will be moved to no swimlane.`)) {
      return;
    }
    try {
      await deleteSwimlane(swimlane._id);
    } catch (error) {
      console.error('Failed to delete swimlane:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-r border-border min-w-[180px] sticky left-0 z-10">
      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm h-7"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setName(swimlane.name);
                setIsEditing(false);
              }
            }}
          />
          <Button size="sm" onClick={handleSave} className="h-7 px-2">
            Save
          </Button>
        </div>
      ) : (
        <>
          <h3 className="flex-1 font-medium text-sm text-foreground">{swimlane.name}</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
