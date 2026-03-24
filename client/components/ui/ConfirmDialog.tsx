'use client';

import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen:      boolean;
  onClose:     () => void;
  onConfirm:   () => void;
  title:       string;
  description: string;
  confirmLabel?: string;
  isLoading?:    boolean;
}

export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = 'Delete', isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger" disabled={isLoading}>
          {isLoading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
