import { Loader2, AlertTriangle } from 'lucide-react'

interface DeleteConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
}

export function DeleteConfirmDialog({
  open,
  title = 'Delete',
  description = 'Are you sure? This action cannot be undone.',
  onConfirm,
  onCancel,
  isPending,
}: DeleteConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
