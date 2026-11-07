import { useState } from 'react'
import type { Category } from '@/shared/api/types'
import {
  ModalShell,
  errorStyle,
  inputStyle,
  labelStyle,
  primaryButton,
  secondaryButton,
} from './ModalShell'

interface DeprecateModalProps {
  category: Category
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
}

/**
 * Deprecating is the normal way to retire a value: it leaves every existing
 * reference intact while removing the value from pickers elsewhere.
 *
 * The reason is required because "why was this switched off" is the first
 * question asked months later.
 */
export function DeprecateModal({
  category,
  onClose,
  onSubmit,
}: DeprecateModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('A reason is required')
      return
    }
    setBusy(true)
    try {
      await onSubmit(reason.trim())
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ?? 'Could not deprecate this item',
      )
      setBusy(false)
    }
  }

  return (
    <ModalShell
      title={`Deprecate "${category.name}"`}
      subtitle="It leaves every picker. Existing references stay intact."
      onClose={onClose}
      maxWidth={460}
    >
      <form onSubmit={submit}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="deprecate-reason">
            Reason
          </label>
          <input
            id="deprecate-reason"
            autoFocus
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError(null)
            }}
            placeholder="Replaced by 'shipped'"
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={busy} style={primaryButton}>
            {busy ? 'Deprecating…' : 'Deprecate'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
