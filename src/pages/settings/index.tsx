import { useState, useRef, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Upload, RotateCcw, Save } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { useSettings, useUpdateSetting, useUploadLogo, useUploadFavicon } from '@/features/settings/queries'
import { useThemeStore } from '@/shared/config/theme'
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
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(216,69,42,0.1)' }}
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
            style={{ padding: '4px 10px', fontSize: 11, background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 6, cursor: !secretDraft ? 'not-allowed' : 'pointer', opacity: !secretDraft ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
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
        style={{ border: '1px solid #d8452a', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none', width: '100%', maxWidth: 280, boxShadow: '0 0 0 3px rgba(216,69,42,0.1)' }}
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{ textAlign: 'left', fontSize: 13, color: '#374151', background: 'transparent', border: 'none', cursor: 'text', maxWidth: 280, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: 0 }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#d8452a' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#374151' }}
    >
      {updateSetting.isPending ? (
        <Loader2 size={14} className="animate-spin" style={{ color: '#d8452a' }} />
      ) : (
        <span>{setting.value ?? <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>empty</span>}</span>
      )}
    </button>
  )
}

// ── Appearance Section ─────────────────────────────────────────────────────

const DEFAULT_VALUES = {
  appName: 'Appbase',
  appSubtitle: 'App Template',
  primaryColor: 'var(--color-primary)',
  logoUrl: '',
  faviconUrl: '',
}

function AppearanceSection() {
  const { appName, appSubtitle, primaryColor, logoUrl, faviconUrl, updateField, applyTheme } = useThemeStore()
  const updateSetting = useUpdateSetting()
  const uploadLogo = useUploadLogo()
  const uploadFavicon = useUploadFavicon()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'app_name', value: appName }),
        updateSetting.mutateAsync({ key: 'app_subtitle', value: appSubtitle }),
        updateSetting.mutateAsync({ key: 'primary_color', value: primaryColor }),
      ])
      applyTheme()
      toast.success('Appearance settings saved')
    } catch {
      toast.error('Failed to save appearance settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'app_name', value: DEFAULT_VALUES.appName }),
        updateSetting.mutateAsync({ key: 'app_subtitle', value: DEFAULT_VALUES.appSubtitle }),
        updateSetting.mutateAsync({ key: 'primary_color', value: DEFAULT_VALUES.primaryColor }),
      ])
      updateField('appName', DEFAULT_VALUES.appName)
      updateField('appSubtitle', DEFAULT_VALUES.appSubtitle)
      updateField('primaryColor', DEFAULT_VALUES.primaryColor)
      applyTheme({ appName: DEFAULT_VALUES.appName, appSubtitle: DEFAULT_VALUES.appSubtitle, primaryColor: DEFAULT_VALUES.primaryColor } as Parameters<typeof applyTheme>[0])
      toast.success('Appearance reset to defaults')
    } catch {
      toast.error('Failed to reset appearance settings')
    } finally {
      setResetting(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadLogo.mutateAsync(file)
      updateField('logoUrl', result.url)
      applyTheme({ logoUrl: result.url } as Parameters<typeof applyTheme>[0])
      toast.success('Logo uploaded')
    } catch {
      toast.error('Failed to upload logo')
    }
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadFavicon.mutateAsync(file)
      updateField('faviconUrl', result.url)
      applyTheme({ faviconUrl: result.url } as Parameters<typeof applyTheme>[0])
      toast.success('Favicon uploaded')
    } catch {
      toast.error('Failed to upload favicon')
    }
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    color: '#1A1A1A',
    background: 'white',
  }

  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Appearance</h2>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
        Customize your app branding. Changes apply in real-time.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* App Name */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            App Name
          </label>
          <input
            type="text"
            value={appName}
            onChange={(e) => updateField('appName', e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(216,69,42,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
            placeholder="Appbase"
          />
        </div>

        {/* App Subtitle */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            App Subtitle
          </label>
          <input
            type="text"
            value={appSubtitle}
            onChange={(e) => updateField('appSubtitle', e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(216,69,42,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
            placeholder="App Template"
          />
        </div>

        {/* Primary Color */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Primary Color
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              style={{ ...inputStyle, width: 120 }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(216,69,42,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
              placeholder='#d8452a'
            />
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(primaryColor) ? primaryColor : '#d8452a' }
              onChange={(e) => updateField('primaryColor', e.target.value)}
              style={{ width: 36, height: 36, padding: 2, border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', background: 'white' }}
              title="Pick a color"
            />
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: /^#[0-9A-Fa-f]{6}$/.test(primaryColor) ? primaryColor : 'var(--color-primary)',
                border: '1px solid #E5E7EB',
                flexShrink: 0,
              }}
              title="Preview"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Logo
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                style={{ width: 60, height: 60, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 6, background: '#F9FAFB' }}
              />
            ) : (
              <div style={{ width: 60, height: 60, border: '1px dashed #D1D5DB', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', color: '#9CA3AF', fontSize: 11 }}>
                No logo
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadLogo.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#374151', fontWeight: 500 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white' }}
            >
              {uploadLogo.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload Logo
            </button>
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Favicon
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt="Favicon"
                style={{ width: 32, height: 32, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 4, background: '#F9FAFB' }}
              />
            ) : (
              <div style={{ width: 32, height: 32, border: '1px dashed #D1D5DB', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', color: '#9CA3AF', fontSize: 9 }}>
                None
              </div>
            )}
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFaviconUpload}
            />
            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              disabled={uploadFavicon.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#374151', fontWeight: 500 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white' }}
            >
              {uploadFavicon.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload Favicon
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#d8452a' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 500, background: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.7 : 1 }}
            onMouseEnter={(e) => { if (!resetting) (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white' }}
          >
            {resetting ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            Reset to Default
          </button>
        </div>
      </div>
    </div>
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
          Manage app settings and customize the appearance of your app.
        </p>
      </div>

      {/* Appearance section */}
      <AppearanceSection />

      {/* Raw settings table */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>All Settings</h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
          Click on a value to edit inline. Press Enter or blur to save.
        </p>
        <DataTable
          data={settings ?? []}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No settings configured."
        />
      </div>
    </div>
  )
}
