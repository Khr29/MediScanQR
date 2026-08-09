import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

// Shared confirmation dialog, replacing native window.confirm() calls with a
// styled modal consistent with the rest of the app.
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  tone = 'danger',
  loading = false,
}) => {
  const iconChipClasses =
    tone === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-brand-50 text-brand-600';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="flex gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconChipClasses}`}>
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
        <p className="text-sm text-slate-600 pt-1.5">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          loading={loading}
          className={tone === 'danger' ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700' : ''}
        >
          {loading ? 'Please wait...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
