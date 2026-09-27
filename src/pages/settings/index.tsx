import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useSettings, useUpdateSetting } from '@/features/settings/queries'
import type { Setting } from '@/shared/api/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const color: Record<string, string> = {
    string: 'bg-blue-100 text-blue-700',
    boolean: 'bg-purple-100 text-purple-700',
    integer: 'bg-orange-100 text-orange-700',
    float: 'bg-yellow-100 text-yellow-700',
    json: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color[type] ?? 'bg-gray-100 text-gray-700'}`}>
      {type}
    </span>
  )
}

function VisibilityBadge({ setting }: { setting: Setting }) {
  if (setting.is_secret) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        secret
      </span>
    )
  }
  if (setting.is_public) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        public
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      private
    </span>
  )
}

// ── Inline editable value cell ─────────────────────────────────────────────

function ValueCell({ setting }: { setting: Setting }) {
  const updateSetting = useUpdateSetting()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(setting.value ?? '')
  const [showSecret, setShowSecret] = useState(false)
  const [secretDraft, setSecretDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // sync if value changes externally
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

  // Secret field: masked display + separate update button
  if (setting.is_secret) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-gray-500 tracking-widest">••••••</span>
        <div className="flex items-center gap-1">
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretDraft}
              onChange={(e) => setSecretDraft(e.target.value)}
              placeholder="New value"
              className="rounded border border-gray-300 px-2 py-1 pr-8 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSecret()
              }}
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
          <button
            onClick={commitSecret}
            disabled={!secretDraft || updateSetting.isPending}
            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updateSetting.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Update'}
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
          if (e.key === 'Escape') {
            setDraft(setting.value ?? '')
            setEditing(false)
          }
        }}
        className="rounded border border-indigo-400 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-xs"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to edit"
      className="text-left text-sm text-gray-700 hover:text-indigo-600 hover:underline cursor-text max-w-xs truncate w-full"
    >
      {updateSetting.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
      ) : (
        <span>{setting.value ?? <span className="text-gray-400 italic">empty</span>}</span>
      )}
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">App Settings</h1>
      <p className="text-sm text-gray-500">
        Click on a value to edit inline. Press Enter or blur to save.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Key', 'Value', 'Type', 'Visibility'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {settings?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 text-sm">
                    No settings configured.
                  </td>
                </tr>
              ) : (
                settings?.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-gray-800 whitespace-nowrap">
                      {setting.key}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <ValueCell setting={setting} />
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={setting.type} />
                    </td>
                    <td className="px-4 py-3">
                      <VisibilityBadge setting={setting} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
