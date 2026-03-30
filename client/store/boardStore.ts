import { create } from 'zustand';
import api from '@/lib/api';
import type { BoardData, Task, Column, Swimlane } from '@/types';

interface BoardState {
  boardData: BoardData | null;
  isLoading: boolean;
  error:     string | null;

  fetchBoard:       (boardId: string) => Promise<void>;
  optimisticMoveTask: (taskId: string, srcColId: string, destColId: string, destIndex: number, srcSwim?: string, destSwim?: string) => void;
  moveTask:         (taskId: string, targetColumn: string, targetPosition: number, targetSwimlane?: string) => Promise<void>;
  addTask:          (data: Partial<Task>) => Promise<Task>;
  updateTask:       (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask:       (taskId: string) => Promise<void>;
  addColumn:        (data: Partial<Column>) => Promise<void>;
  updateColumn:     (columnId: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn:     (columnId: string) => Promise<void>;
  reorderColumns:   (columns: { id: string; position: number }[]) => Promise<void>;
  addSwimlane:      (data: Partial<Swimlane>) => Promise<void>;
  updateSwimlane:   (swimlaneId: string, updates: Partial<Swimlane>) => Promise<void>;
  deleteSwimlane:   (swimlaneId: string) => Promise<void>;
  reorderSwimlanes: (swimlanes: { id: string; position: number }[]) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boardData: null,
  isLoading: false,
  error:     null,

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      set({ boardData: data, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load board';
      set({ error: msg, isLoading: false });
    }
  },

  optimisticMoveTask: (taskId, srcColId, destColId, destIndex, srcSwim, destSwim) => {
    const { boardData } = get();
    if (!boardData) return;

    const newColumns = boardData.columns.map(col => ({
      ...col,
      tasks: [...col.tasks],
    }));

    const srcCol  = newColumns.find(c => c._id === srcColId)!;
    const taskIdx = srcCol.tasks.findIndex(t => t._id === taskId);
    const [movedTask] = srcCol.tasks.splice(taskIdx, 1);

    const destCol = newColumns.find(c => c._id === destColId)!;
    movedTask.column = destColId;
    if (destSwim !== undefined) {
      movedTask.swimlane = destSwim;
    }
    destCol.tasks.splice(destIndex, 0, movedTask);

    srcCol.tasks.forEach((t, i)  => { t.position = i; });
    destCol.tasks.forEach((t, i) => { t.position = i; });

    set({ boardData: { ...boardData, columns: newColumns } });
  },

  moveTask: async (taskId, targetColumn, targetPosition, targetSwimlane) => {
    try {
      const payload: any = { targetColumn, targetPosition };
      if (targetSwimlane !== undefined) {
        payload.targetSwimlane = targetSwimlane;
      }
      await api.patch(`/tasks/${taskId}/move`, payload);
    } catch {
      const { boardData } = get();
      if (boardData) get().fetchBoard(boardData.board._id as string);
    }
  },

  addTask: async (data) => {
    const { data: task } = await api.post('/tasks', data);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
    return task;
  },

  updateTask: async (taskId, updates) => {
    await api.put(`/tasks/${taskId}`, updates);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  addColumn: async (data) => {
    await api.post('/columns', data);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  updateColumn: async (columnId, updates) => {
    await api.put(`/columns/${columnId}`, updates);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  deleteColumn: async (columnId) => {
    await api.delete(`/columns/${columnId}`);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  reorderColumns: async (columns) => {
    await api.patch('/columns/reorder', { columns });
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  addSwimlane: async (data) => {
    await api.post('/swimlanes', data);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  updateSwimlane: async (swimlaneId, updates) => {
    await api.put(`/swimlanes/${swimlaneId}`, updates);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  deleteSwimlane: async (swimlaneId) => {
    await api.delete(`/swimlanes/${swimlaneId}`);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },

  reorderSwimlanes: async (swimlanes) => {
    await api.patch('/swimlanes/reorder', { swimlanes });
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id as string);
  },
}));
