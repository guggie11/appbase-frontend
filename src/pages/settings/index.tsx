import { useState, useRef, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { useSettings, useUpdateSetting } from '@/features/settings/queries'
import type { Setting } from '@/shared/api/types'
import { DataTable } from '@/shared/ui/DataTable'

// ── Helpers ────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const styleMap: Record<string, React.CSSProperties> = {
    string: { background: '#EFF6FF', color: '#3B82F6' },
    boolean: { background: '#F5F3FF', color: '#7C3AED' },
    integer: { background: '#FFF7ED', color: '#D97706' },
    float: { background: '#FFFBEB', color: '#D97706' },
    json: { background: '#F3F4F6', color: '#6B7280' },
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, ...(styleMap[type] ?? { background: '#F3F4F6', color: '#6B7280' }) }}>
      {type}
    </span>
  )
}

function VisibilityBadge({ setting }: { setting: Setting }) {
  if (setting.is_secret) {
    return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, background: '#FEF2F2', color: '#DC2626' }}>secret</span>
  }
  if (setting.is_public) {
    return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, background: '#ECFDF5', color: '#059669' }}>public</span>
  }
  return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, background: '#F3F4F6', color: '#6B7280' }}>private</span>
}

// ── Inline editable value cell ─────────────────────────────────────────────

function ValueCell({ setting }: { setting: Setting }) {
  const updateSetting = useUpdateSetting()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(setting.value ?? '')
  const [showSecret, setShowSecret] = useState(false)
  const [secretDraft, setSecretDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(setting.value ?? '')
  }, [setting.value, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function commitInline() {
    if (draft === (setting.value ?? '')) {
      setEditing(false)
      return
    }
    try {
      await updateSetting.mutateAsync({ key: setting.key, value: draft })
      toast.success(`Setting "${setting.key}" updated`)
    } catch {
      toast.error(`Failed to update "${setting.key}"`)
      setDraft(setting.value ?? '')
    } finally {
      setEditing(false)
    }
  }

  async function commitSecret() {
    if (!secretDraft) return
    try {
      await updateSetting.mutateAsync({ key: setting.key, value: secretDraft })
      toast.success(`Setting "${setting.key}" updated`)
      setSecretDraft('')
    } catch {
      toast.error(`Failed to update "${setting.key}"`)
    }
  }

  if (setting.is_secret) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#9CA3AF', letterSpacing: 2 }}>••••••</span>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretDraft}
              onChange={(e) => setSecretDraft(e.target.value)}
              placeholder="New value"
              style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 32px 4px 8px', fontSize: 12, width: 140, outline: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = '#D94F3D'; e.target.style.boxShadow = '0 0 0 3px rgba(217,79,61,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
              onKeyDown={(e) => { if (e.key === 'Enter') commitSecret() }}
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}
            >
              {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
          <button
            onClick={commitSecret}
            disabled={!secretDraft || updateSetting.isPending}
            style={{ padding: '4px 10px', fontSize: 11, background: '#D94F3D', color: 'white', border: 'none', borderRadius: 6, cursor: !secretDraft ? 'not-allowed' : 'pointer', opacity: !secretDraft ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
          >
            {updateSetting.isPending ? <Loader2 size={10} className="animate-spin" /> : 'Update'}
          </button>
        </div>
      </div>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitInline}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitInline()
          if (e.key === 'Escape') { setDraft(setting.value ?? ''); setEditing(false) }
        }}
        style={{ border: '1px solid #D94F3D', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none', width: '100%', maxWidth: 280, boxShadow: '0 0 0 3px rgba(217,79,61,0.1)' }}
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{ textAlign: 'left', fontSize: 13, color: '#374151', background: 'transparent', border: 'none', cursor: 'text', maxWidth: 280, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: 0 }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D94F3D' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#374151' }}
    >
      {updateSetting.isPending ? (
        <Loader2 size={14} className="animate-spin" style={{ color: '#D94F3D' }} />
      ) : (
        <span>{setting.value ?? <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>empty</span>}</span>
      )}
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings()

  const columns = useMemo<ColumnDef<Setting, unknown>[]>(
    () => [
      {
        accessorKey: 'key',
        header: 'Key',
        cell: ({ getValue }) => (
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1A1A1A', whiteSpace: 'nowrap' }}>
            {getValue() as string}
          </span>
        ),
      },
      {
        id: 'value',
        header: 'Value',
        cell: ({ row }) => (
          <div style={{ maxWidth: 300 }}>
            <ValueCell setting={row.original} />
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => <TypeBadge type={getValue() as string} />,
      },
      {
        id: 'visibility',
        header: 'Visibility',
        cell: ({ row }) => <VisibilityBadge setting={row.original} />,
      },
    ],
    [],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>App Settings</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>
          Click on a value to edit inline. Press Enter or blur to save.
        </p>
      </div>

      <DataTable
        data={settings ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No settings configured."
      />
    </div>
  )
}
