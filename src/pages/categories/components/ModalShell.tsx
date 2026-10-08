import { X } from 'lucide-react'

interface ModalShellProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: number
}

/**
 * The Archie modal frame, shared by every dialog on this page.
 *
 * Carries role="dialog" and aria-modal, which the older DeleteConfirmDialog
 * never had — without them a screen reader announces nothing when it opens.
 */
export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 520,
}: ModalShellProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(27,28,30,0.35)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '28px 28px 24px',
          margin: '0 16px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--color-text)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-meta)',
                  margin: '4px 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-meta)',
              cursor: 'pointer',
              padding: 2,
            }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 13,
  border: '1px solid var(--color-border)',
  borderRadius: 10,
  background: '#fff',
  color: 'var(--color-text)',
  outline: 'none',
}

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
}

export const primaryButton: React.CSSProperties = {
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 500,
  border: 'none',
  borderRadius: 10,
  background: 'var(--color-primary)',
  color: '#fff',
  cursor: 'pointer',
}

export const secondaryButton: React.CSSProperties = {
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 500,
  border: '1px solid var(--color-border)',
  borderRadius: 10,
  background: '#fff',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
}

export const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--color-primary)',
  marginTop: 5,
}
