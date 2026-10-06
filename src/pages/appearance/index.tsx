import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, RotateCcw, Save } from 'lucide-react'
import { useSettings, useUpdateSetting } from '@/features/settings/queries'
import {
  PRESETS,
  checkBrandColor,
  isDirty,
  normaliseHex,
  type AppearanceValues,
} from './model'

const EMPTY: AppearanceValues = {
  app_name: '',
  app_subtitle: '',
  primary_color: '#d8452a',
}

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 500,
  color: '#1b1c1e',
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 13,
  borderRadius: 10,
  border: '1px solid #e2e3e3',
  background: '#fff',
  color: '#1b1c1e',
  outline: 'none',
}

const card: React.CSSProperties = {
  border: '1px solid #e2e3e3',
  borderRadius: 14,
  background: '#fff',
  padding: 18,
}

export function AppearancePage() {
  const { data: settings = [], isLoading } = useSettings()
  const updateSetting = useUpdateSetting()

  const saved = useMemo<AppearanceValues>(() => {
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value ?? '']))
    return {
      app_name: map.app_name ?? '',
      app_subtitle: map.app_subtitle ?? '',
      primary_color: map.primary_color || EMPTY.primary_color,
    }
  }, [settings])

  const [draft, setDraft] = useState<AppearanceValues>(EMPTY)
  const [initialised, setInitialised] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !initialised) {
      setDraft(saved)
      setInitialised(true)
    }
  }, [isLoading, initialised, saved])

  const dirty = initialised && isDirty(saved, draft)
  const check = checkBrandColor(draft.primary_color)
  const canSave = dirty && check.ok && !updateSetting.isPending

  // Warn before losing edits — the old screen saved silently, this one does
  // not, so leaving must not quietly discard work.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = (patch: Partial<AppearanceValues>) => {
    setStatus(null)
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const handleSave = async () => {
    if (!canSave) return
    const changes: [string, string][] = []
    if (draft.app_name !== saved.app_name) changes.push(['app_name', draft.app_name])
    if (draft.app_subtitle !== saved.app_subtitle)
      changes.push(['app_subtitle', draft.app_subtitle])
    if (normaliseHex(draft.primary_color) !== normaliseHex(saved.primary_color))
      changes.push(['primary_color', normaliseHex(draft.primary_color)])

    for (const [key, value] of changes) {
      await updateSetting.mutateAsync({ key, value })
    }
    setStatus(`Saved ${changes.length} change${changes.length === 1 ? '' : 's'}`)
  }

  if (isLoading) {
    return <p style={{ fontSize: 13, color: '#8a8c8e' }}>Loading…</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: '#55585b' }}>
        Branding shown to everyone who signs in. Changes apply once you save.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: 18, alignItems: 'start' }}>
        <section style={card}>
          <div style={{ marginBottom: 16 }}>
            <label style={label} htmlFor="app-name">Application name</label>
            <input
              id="app-name"
              data-testid="app-name"
              value={draft.app_name}
              onChange={(e) => set({ app_name: e.target.value })}
              style={input}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={label} htmlFor="app-subtitle">Subtitle</label>
            <input
              id="app-subtitle"
              data-testid="app-subtitle"
              value={draft.app_subtitle}
              onChange={(e) => set({ app_subtitle: e.target.value })}
              style={input}
            />
          </div>

          <span style={label}>Brand colour</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {PRESETS.map((preset) => {
              const active =
                normaliseHex(draft.primary_color) === normaliseHex(preset.value)
              return (
                <button
                  key={preset.value}
                  type="button"
                  data-testid={`preset-${preset.name.toLowerCase()}`}
                  onClick={() => set({ primary_color: preset.value })}
                  aria-pressed={active}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '6px 11px 6px 7px',
                    borderRadius: 999,
                    border: `1px solid ${active ? '#1b1c1e' : '#e2e3e3'}`,
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#1b1c1e',
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: preset.value,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {active && <Check size={10} strokeWidth={3} aria-hidden="true" />}
                  </span>
                  {preset.name}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="color"
              aria-label="Custom brand colour"
              value={check.ratio > 0 ? normaliseHex(draft.primary_color) : '#d8452a'}
              onChange={(e) => set({ primary_color: e.target.value })}
              style={{ width: 40, height: 34, padding: 0, border: '1px solid #e2e3e3', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
            />
            <input
              data-testid="color-hex"
              value={draft.primary_color}
              onChange={(e) => set({ primary_color: e.target.value })}
              style={{ ...input, width: 130, fontFamily: 'Geist Mono, monospace' }}
            />
            {check.ratio > 0 && (
              <span
                data-testid="contrast-ratio"
                style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: '#6c6e70' }}
              >
                {check.ratio.toFixed(1)}:1
              </span>
            )}
          </div>

          {(check.reason || check.warn) && (
            <p
              data-testid={check.ok ? 'contrast-warning' : 'contrast-error'}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 7,
                marginTop: 10,
                padding: '9px 11px',
                borderRadius: 10,
                fontSize: 12,
                lineHeight: 1.45,
                background: check.ok ? '#fdf6e9' : '#fdecea',
                border: `1px solid ${check.ok ? '#f0dfbc' : '#f0cfca'}`,
                color: check.ok ? '#6b4f14' : '#8a1c13',
              }}
            >
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <span>{check.reason}</span>
            </p>
          )}
        </section>

        {/* Preview uses real components, not colour swatches: a swatch cannot
            show whether button text stays readable. */}
        <section style={card} data-testid="appearance-preview">
          <h3
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6c6e70',
              marginBottom: 14,
            }}
          >
            Preview
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: draft.primary_color, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1b1c1e' }}>
                {draft.app_name || 'Application'}
              </div>
              <div style={{ fontSize: 11, color: '#6c6e70' }}>
                {draft.app_subtitle || 'Subtitle'}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled
            style={{
              width: '100%',
              padding: '9px 14px',
              marginBottom: 10,
              borderRadius: 10,
              border: 'none',
              background: draft.primary_color,
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Primary button
          </button>

          <div
            style={{
              padding: '8px 11px',
              marginBottom: 10,
              borderRadius: 10,
              background: '#fff',
              border: '1px solid #e2e3e3',
              boxShadow: '0 1px 2px rgba(27,28,30,0.06)',
              fontSize: 13,
              color: draft.primary_color,
              fontWeight: 500,
            }}
          >
            Active nav item
          </div>

          <span
            style={{
              display: 'inline-flex',
              padding: '2px 9px',
              borderRadius: 999,
              background: draft.primary_color,
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Badge
          </span>
        </section>
      </div>

      {/* Dirty state: the old screen wrote every keystroke straight to the
          database with no way back. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {dirty ? (
          <span data-testid="dirty-flag" style={{ fontSize: 13, color: '#6b4f14' }}>
            Unsaved changes
          </span>
        ) : (
          status && (
            <span data-testid="save-status" style={{ fontSize: 13, color: '#1d7a4c' }}>
              {status}
            </span>
          )
        )}

        <span style={{ flex: 1 }} />

        <button
          type="button"
          data-testid="discard"
          disabled={!dirty}
          onClick={() => { setDraft(saved); setStatus(null) }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 14px',
            fontSize: 13,
            borderRadius: 10,
            border: '1px solid #e2e3e3',
            background: '#fff',
            color: dirty ? '#1b1c1e' : '#b9babb',
            cursor: dirty ? 'pointer' : 'not-allowed',
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Discard
        </button>

        <button
          type="button"
          data-testid="save"
          disabled={!canSave}
          onClick={handleSave}
          className="btn-primary"
          style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed' }}
        >
          <Save size={14} aria-hidden="true" />
          {updateSetting.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
